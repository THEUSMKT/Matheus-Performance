/* ==========================================================================
   Mensuração — um único ponto de saída para todos os eventos.

   Não há ferramenta de análise instalada. Cada evento é emitido como
   CustomEvent('mb:configurator') — o mesmo contrato do fluxo anterior — e,
   se um gerenciador de tags existir na página (window.dataLayer), é
   repassado para ele uma única vez. Nada sai daqui sem estar na lista.

   Intenção x confirmação: "whatsapp_open" é um clique, não um contato
   recebido. "generate_lead" só é emitido depois que um receptor real
   confirma o pedido salvo. Qualificação, proposta e venda acontecem no
   atendimento/CRM e nunca são disparados pelo navegador.
   ========================================================================== */
import { experiments, type ExperimentId } from '@/config/experiments';
import { FLOW_VERSION } from './project';
import { normalizeValue, type Origin } from './origin';

/** Eventos permitidos e as propriedades que cada um pode carregar. */
export const EVENTS = {
  configurator_start: { once: 'session', props: [] },
  step_complete: { once: 'per-value', props: ['step'] },
  recommendation_applied: { once: false, props: ['plan'] },
  plan_selected: { once: false, props: ['plan', 'source'] },
  example_opened: { once: false, props: ['segment'] },
  example_applied: { once: false, props: ['segment'] },
  summary_view: { once: 'session', props: [] },
  whatsapp_open: { once: false, props: ['context'] },
  share_link: { once: false, props: [] },
  pdf_save: { once: false, props: [] },
  help_open: { once: false, props: ['step'] },
  lead_submit_attempt: { once: false, props: [] },
  lead_submit_error: { once: false, props: ['reason'] },
  /** Só depois de confirmação do receptor. Nunca no modo WhatsApp. */
  generate_lead: { once: 'per-value', props: ['lead_ref'] },
} as const;

export type EventName = keyof typeof EVENTS;
type Props = Record<string, string | number | boolean>;

/** Eventos que dependem do atendimento ou do CRM — documentados, nunca emitidos aqui. */
export const SERVER_ONLY_EVENTS = ['qualify_lead', 'proposal_sent', 'deal_won', 'deal_lost'] as const;

const SENT_KEY = 'bp.eventos.v1';

function sentSet(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SENT_KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

function remember(key: string) {
  try {
    const s = sentSet();
    s.add(key);
    sessionStorage.setItem(SENT_KEY, JSON.stringify([...s]));
  } catch {
    /* sem sessionStorage: a deduplicação vale só para esta aba */
  }
}

const memory = new Set<string>();

/** Só primitivos das chaves permitidas; textos passam pela normalização. */
export function sanitize(name: EventName, props: Props = {}): Props {
  const allowed = EVENTS[name].props as readonly string[];
  const out: Props = {};
  for (const key of allowed) {
    const v = props[key];
    if (typeof v === 'number' && Number.isFinite(v)) out[key] = v;
    else if (typeof v === 'boolean') out[key] = v;
    else if (typeof v === 'string') out[key] = normalizeValue(v);
  }
  return out;
}

let context: Props = { flow_version: FLOW_VERSION };

/** Contexto comum: versão do fluxo, variantes e origem resumida. */
export function setContext(origin: Origin, variants: Partial<Record<ExperimentId, string>>) {
  context = { flow_version: FLOW_VERSION };
  for (const [id, v] of Object.entries(variants)) if (v) context[`var_${id}`] = v;
  if (origin.utm_source) context.utm_source = origin.utm_source;
  if (origin.utm_medium) context.utm_medium = origin.utm_medium;
  if (origin.utm_campaign) context.utm_campaign = origin.utm_campaign;
  if (origin.segment) context.campaign_segment = origin.segment;
}

type DataLayerWindow = Window & { dataLayer?: unknown[] };

export function track(name: EventName, props: Props = {}): boolean {
  if (!(name in EVENTS)) return false;
  const clean = sanitize(name, props);
  const rule = EVENTS[name].once;
  const key = rule === 'session' ? name : rule === 'per-value' ? `${name}:${JSON.stringify(clean)}` : '';
  if (key) {
    if (memory.has(key) || sentSet().has(key)) return false;
    memory.add(key);
    remember(key);
  }
  const detail = { event: name, ...context, ...clean };
  if (typeof window === 'undefined') return true;
  window.dispatchEvent(new CustomEvent('mb:configurator', { detail }));
  const w = window as DataLayerWindow;
  if (Array.isArray(w.dataLayer)) w.dataLayer.push(detail);
  return true;
}

/* ── Variantes ───────────────────────────────────────────────────────────── */

const BUCKET_KEY = 'bp.variantes.v1';

/**
 * Variante estável por visitante. Teste inativo = controle, sempre.
 * `?v_hero=b` força uma variante válida (útil para revisar a página).
 */
export function variantFor(id: ExperimentId, search = ''): string {
  const exp = experiments[id];
  const forced = new URLSearchParams(search).get(`v_${id}`);
  if (forced && (exp.variants as readonly string[]).includes(forced)) return forced;
  if (!exp.active || exp.variants.length < 2) return exp.variants[0];
  try {
    const saved = JSON.parse(localStorage.getItem(BUCKET_KEY) || '{}') as Record<string, string>;
    if (saved[id] && (exp.variants as readonly string[]).includes(saved[id])) return saved[id];
    const v = exp.variants[Math.floor(Math.random() * exp.variants.length)];
    localStorage.setItem(BUCKET_KEY, JSON.stringify({ ...saved, [id]: v }));
    return v;
  } catch {
    return exp.variants[0];
  }
}

/** Apenas para testes automatizados. */
export function _resetForTests() {
  memory.clear();
  context = { flow_version: FLOW_VERSION };
}
