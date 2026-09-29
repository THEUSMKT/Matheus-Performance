/* ==========================================================================
   Servidor intermediário da prévia por descrição (Cloudflare Worker).

   A página no GitHub Pages é estática e pública: qualquer chave colocada nela
   seria copiada. Por isso a chave do Gemini fica só aqui, como segredo do
   Worker (GEMINI_API_KEY), e a página chama este endereço.

   O que ele faz: aceita só POST do site permitido, limita tamanho e
   frequência, remove e-mails e telefones da descrição, pede ao Gemini um JSON
   no formato combinado e devolve apenas a sugestão validada. Em /transcricao
   recebe um áudio WAV curto e devolve só o texto transcrito (sem contatos).
   Descrição e áudio não são gravados nem registrados em log. Ver README.md
   desta pasta.

   Versões: aceita pedidos `schema: 1` (páginas antigas) e `schema: 2`. Os
   dois usam o mesmo prompt; a resposta à versão 1 vem no formato antigo
   (toLegacySuggestion), então página e servidor não precisam ser
   atualizados no mesmo instante.
   ========================================================================== */
import { AI_SCHEMA_ACCEPTED, DESCRIPTION_MAX, DESCRIPTION_MIN, geminiRequest, parseGeminiResponse, sanitizeSuggestion, toLegacySuggestion } from '../../src/lib/aiPreview';
import { AUDIO_MAX_BASE64, AUDIO_MIME, cleanTranscript, transcriptionRequest } from '../../src/lib/aiAudio';
import { packageOrder, type PackageId } from '../../src/config/packages';

export interface Env {
  /** Segredo: `wrangler secret put GEMINI_API_KEY` ou painel da Cloudflare. Nunca no wrangler.toml. */
  GEMINI_API_KEY?: string;
  /** Origens permitidas, separadas por vírgula (ex.: https://theusmkt.github.io). */
  ALLOWED_ORIGINS?: string;
  /** Modelo do Gemini (ex.: gemini-3.5-flash-lite). Confirme o nome na lista do AI Studio. */
  GEMINI_MODEL?: string;
  /** Limite por visitante (binding "ratelimits" do wrangler.toml). */
  RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
type Log = (msg: string, data?: Record<string, unknown>) => void;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_BODY = 6000;
/** Transcrição: até 90 s de WAV em base64 mais o envelope JSON. */
const MAX_AUDIO_BODY = 4_300_000;
/**
 * Até duas chamadas ao Gemini por pedido. 2 × 18 s + a pausa ficam abaixo dos
 * 45 s que a página espera (requestSuggestion).
 */
const ATTEMPTS = 2;
const ATTEMPT_TIMEOUT = 18000;
const RETRY_DELAY = 800;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function reply(status: number, body: unknown, origin: string | null): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

export async function handle(request: Request, env: Env, fetchImpl: FetchLike = fetch, log: Log = () => {}, pause: (ms: number) => Promise<void> = wait): Promise<Response> {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin && allowed.includes(origin) ? origin : null;

  if (request.method === 'OPTIONS') return reply(allowedOrigin ? 204 : 403, null, allowedOrigin);
  if (!allowedOrigin) return reply(403, { ok: false, error: 'origem' }, null);
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'metodo' }, allowedOrigin);

  // /transcricao: áudio → texto. Qualquer outro caminho: descrição → prévia.
  const audio = new URL(request.url).pathname.replace(/\/+$/, '').endsWith('/transcricao');
  const limit = audio ? MAX_AUDIO_BODY : MAX_BODY;
  if (Number(request.headers.get('Content-Length') ?? 0) > limit) return reply(413, { ok: false, error: 'tamanho' }, allowedOrigin);
  const raw = await request.text();
  if (raw.length > limit) return reply(413, { ok: false, error: 'tamanho' }, allowedOrigin);
  let data: { schema?: unknown; description?: unknown; pkg?: unknown; mime?: unknown; audio?: unknown };
  try {
    data = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: 'json' }, allowedOrigin);
  }
  if (typeof data.schema !== 'number' || !AI_SCHEMA_ACCEPTED.includes(data.schema)) return reply(422, { ok: false, error: 'versao' }, allowedOrigin);
  const schema = data.schema;

  let body: unknown;
  let accept: (value: unknown) => Attempt;
  if (audio) {
    const wav = typeof data.audio === 'string' ? data.audio : '';
    if (data.mime !== AUDIO_MIME || wav.length < 1000 || wav.length > AUDIO_MAX_BASE64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(wav)) {
      return reply(422, { ok: false, error: 'audio' }, allowedOrigin);
    }
    body = transcriptionRequest(wav);
    // Sem fala não é falha passageira: repetir não ajuda.
    accept = (value) => {
      const text = cleanTranscript(value);
      return text ? { ok: true, payload: { text } } : { ok: false, status: 422, error: 'sem-fala', retry: false };
    };
  } else {
    const description = typeof data.description === 'string' ? data.description.trim() : '';
    if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) return reply(422, { ok: false, error: 'descricao' }, allowedOrigin);
    const pkg: PackageId = packageOrder.includes(data.pkg as PackageId) ? (data.pkg as PackageId) : 'essencial';
    body = geminiRequest(description);
    accept = (value) => {
      const suggestion = sanitizeSuggestion(value, pkg, { description });
      if (suggestion) return { ok: true, payload: { suggestion: schema === 1 ? toLegacySuggestion(suggestion) : suggestion } };
      log('resposta do Gemini recusada', { reason: 'formato' });
      return { ok: false, status: 502, error: 'formato', retry: true };
    };
  }

  if (env.RATE_LIMITER) {
    // Transcrição e prévia contam separadamente: gravar e depois gerar não esgota o limite.
    const ip = request.headers.get('CF-Connecting-IP') ?? 'anonimo';
    const { success } = await env.RATE_LIMITER.limit({ key: audio ? `${ip}:audio` : ip });
    if (!success) return reply(429, { ok: false, error: 'limite' }, allowedOrigin);
  }

  if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL) {
    log('configuração incompleta: GEMINI_API_KEY ou GEMINI_MODEL ausente');
    return reply(503, { ok: false, error: 'configuracao' }, allowedOrigin);
  }

  for (let attempt = 1; ; attempt++) {
    const called = await callGemini(body, env.GEMINI_API_KEY, env.GEMINI_MODEL, fetchImpl, log);
    const result = called.ok ? accept(called.value) : called;
    if (result.ok) return reply(200, { ok: true, ...result.payload }, allowedOrigin);
    if (!result.retry || attempt >= ATTEMPTS) return reply(result.status, { ok: false, error: result.error }, allowedOrigin);
    // Falha passageira (sobrecarga, demora, resposta cortada): tenta mais uma vez.
    log('nova tentativa', { attempt: attempt + 1 });
    await pause(RETRY_DELAY);
  }
}

type Failure = { ok: false; status: number; error: string; retry: boolean };
type Attempt = { ok: true; payload: Record<string, unknown> } | Failure;

/** Uma chamada ao Gemini: devolve o JSON da resposta ou a falha (`retry` diz se vale tentar de novo). */
async function callGemini(body: unknown, key: string, model: string, fetchImpl: FetchLike, log: Log): Promise<{ ok: true; value: unknown } | Failure> {
  let res: Response;
  try {
    res = await fetchImpl(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ATTEMPT_TIMEOUT),
    });
  } catch (err) {
    log('falha ao chamar o Gemini', { error: (err as Error)?.name ?? 'erro' });
    return { ok: false, status: 502, error: 'ia', retry: true };
  }
  // Só o código de status vai para o log — nunca a descrição, o áudio nem a resposta.
  if (res.status === 429) {
    log('Gemini: cota atingida', { status: 429 });
    return { ok: false, status: 429, error: 'cota', retry: false };
  }
  if (!res.ok) {
    log('Gemini respondeu com erro', { status: res.status });
    return { ok: false, status: 502, error: 'ia', retry: res.status >= 500 };
  }
  const parsed = parseGeminiResponse(await res.json().catch(() => null));
  if (!parsed.ok) {
    log('resposta do Gemini recusada', { reason: parsed.reason });
    if (parsed.reason === 'bloqueado') return { ok: false, status: 422, error: 'bloqueado', retry: false };
    return { ok: false, status: 502, error: parsed.reason, retry: true };
  }
  return { ok: true, value: parsed.value };
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env, fetch, (msg, data) => console.log(msg, data ?? ''));
  },
};
