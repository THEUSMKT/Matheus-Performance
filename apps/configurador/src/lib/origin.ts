/* ==========================================================================
   Origem da visita: parâmetros de campanha permitidos, normalizados.

   Só entram chaves conhecidas, com caracteres seguros e tamanho limitado.
   Nunca guardamos a URL completa nem o referrer completo — só o domínio de
   quem indicou, que não carrega dado pessoal.
   ========================================================================== */
import { segments } from './project';

export const ORIGIN_KEY = 'bp.origem.v1';

const ALLOWED = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type Origin = Partial<Record<(typeof ALLOWED)[number] | 'referrer' | 'segment', string>>;

/** minúsculas, só [a-z0-9 . _ -], no máximo 60 caracteres. */
export function normalizeValue(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

/** Descarta qualquer valor que pareça dado pessoal (e-mail ou telefone). */
function looksPersonal(value: string): boolean {
  return value.includes('@') || value.replace(/\D/g, '').length >= 8;
}

export function parseOrigin(search: string, referrer: string, ownHost: string): Origin {
  const params = new URLSearchParams(search);
  const out: Origin = {};
  for (const key of ALLOWED) {
    const raw = params.get(key);
    if (!raw || looksPersonal(raw)) continue;
    const v = normalizeValue(raw);
    if (v) out[key] = v;
  }
  // Segmento de campanha: só ids conhecidos. Adapta exemplo e recomendação.
  const seg = normalizeValue(params.get('segmento'));
  if (seg && segments.some((s) => s.id === seg)) out.segment = seg;

  try {
    const host = referrer ? new URL(referrer).hostname.replace(/^www\./, '') : '';
    if (host && host !== ownHost) out.referrer = normalizeValue(host);
  } catch {
    /* referrer inválido: ignora */
  }
  return out;
}

/** Primeira origem da sessão vence: uma navegação interna não a apaga. */
export function captureOrigin(): Origin {
  try {
    const saved = sessionStorage.getItem(ORIGIN_KEY);
    if (saved) return JSON.parse(saved) as Origin;
    const origin = parseOrigin(location.search, document.referrer, location.hostname);
    sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
    return origin;
  } catch {
    return {};
  }
}

/** Resumo curto para a referência da mensagem: "google/cpc/lancamento". */
export function originTag(o: Origin): string {
  const parts = [o.utm_source, o.utm_medium, o.utm_campaign].filter(Boolean);
  if (parts.length) return parts.join('/');
  return o.referrer ? `ref:${o.referrer}` : '';
}
