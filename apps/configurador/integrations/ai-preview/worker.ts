/* ==========================================================================
   Servidor intermediário da prévia por descrição (Cloudflare Worker).

   A página no GitHub Pages é estática e pública: qualquer chave colocada nela
   seria copiada. Por isso a chave do Gemini fica só aqui, como segredo do
   Worker (GEMINI_API_KEY), e a página chama este endereço.

   O que ele faz: aceita só POST do site permitido, limita tamanho e
   frequência, remove e-mails e telefones da descrição, pede ao Gemini um JSON
   no formato combinado e devolve apenas a sugestão validada. A descrição não
   é gravada nem registrada em log. Ver README.md desta pasta.
   ========================================================================== */
import { AI_SCHEMA_VERSION, DESCRIPTION_MAX, DESCRIPTION_MIN, geminiRequest, parseGeminiResponse, sanitizeSuggestion } from '../../src/lib/aiPreview';
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

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_BODY = 6000;

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

export async function handle(request: Request, env: Env, fetchImpl: FetchLike = fetch, log: (msg: string, data?: Record<string, unknown>) => void = () => {}): Promise<Response> {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin && allowed.includes(origin) ? origin : null;

  if (request.method === 'OPTIONS') return reply(allowedOrigin ? 204 : 403, null, allowedOrigin);
  if (!allowedOrigin) return reply(403, { ok: false, error: 'origem' }, null);
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'metodo' }, allowedOrigin);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return reply(413, { ok: false, error: 'tamanho' }, allowedOrigin);
  let data: { schema?: unknown; description?: unknown; pkg?: unknown };
  try {
    data = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: 'json' }, allowedOrigin);
  }
  if (data.schema !== AI_SCHEMA_VERSION) return reply(422, { ok: false, error: 'versao' }, allowedOrigin);
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) return reply(422, { ok: false, error: 'descricao' }, allowedOrigin);
  const pkg: PackageId = packageOrder.includes(data.pkg as PackageId) ? (data.pkg as PackageId) : 'essencial';

  if (env.RATE_LIMITER) {
    const key = request.headers.get('CF-Connecting-IP') ?? 'anonimo';
    const { success } = await env.RATE_LIMITER.limit({ key });
    if (!success) return reply(429, { ok: false, error: 'limite' }, allowedOrigin);
  }

  if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL) {
    log('configuração incompleta: GEMINI_API_KEY ou GEMINI_MODEL ausente');
    return reply(503, { ok: false, error: 'configuracao' }, allowedOrigin);
  }

  let res: Response;
  try {
    res = await fetchImpl(`${GEMINI_URL}/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify(geminiRequest(description)),
      signal: AbortSignal.timeout(25000),
    });
  } catch (err) {
    log('falha ao chamar o Gemini', { error: (err as Error)?.name ?? 'erro' });
    return reply(502, { ok: false, error: 'ia' }, allowedOrigin);
  }
  // Só o código de status vai para o log — nunca a descrição nem a resposta.
  if (res.status === 429) {
    log('Gemini: cota atingida', { status: 429 });
    return reply(429, { ok: false, error: 'cota' }, allowedOrigin);
  }
  if (!res.ok) {
    log('Gemini respondeu com erro', { status: res.status });
    return reply(502, { ok: false, error: 'ia' }, allowedOrigin);
  }

  const parsed = parseGeminiResponse(await res.json().catch(() => null));
  if (!parsed.ok) {
    log('resposta do Gemini recusada', { reason: parsed.reason });
    return reply(parsed.reason === 'bloqueado' ? 422 : 502, { ok: false, error: parsed.reason }, allowedOrigin);
  }
  const suggestion = sanitizeSuggestion(parsed.value, pkg);
  if (!suggestion) return reply(502, { ok: false, error: 'formato' }, allowedOrigin);
  return reply(200, { ok: true, suggestion }, allowedOrigin);
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env, fetch, (msg, data) => console.log(msg, data ?? ''));
  },
};
