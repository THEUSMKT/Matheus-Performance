/* ==========================================================================
   Pedido de proposta — contrato, validação e envio.

   O mesmo módulo valida no navegador e no receptor (integrations/
   lead-receiver). O navegador nunca decide o preço da proposta: manda a
   estimativa só como referência, e o receptor recalcula com as mesmas
   regras. Sucesso só existe quando o receptor responde que salvou.
   ========================================================================== */
import { complexNeeds } from '@/config/offer';
import {
  budgetInfo,
  FLOW_VERSION,
  needsDiagnosis,
  normalizeProject,
  projectEstimate,
  type Project,
} from './project';
import type { Origin } from './origin';

export const LEAD_SCHEMA_VERSION = 1;

export type LeadPayload = {
  schema: typeof LEAD_SCHEMA_VERSION;
  idempotencyKey: string;
  projectId: string;
  flowVersion: string;
  contact: { name: string; channel: string; value: string };
  qualification: {
    need: string;
    budget: ReturnType<typeof budgetInfo>;
    deadline: string;
    decision: string;
  };
  consent: { commercial: true; marketing: boolean };
  /** Projeto completo, com textos privados — só trafega para o receptor. */
  project: Project;
  /** Referência do navegador. O receptor recalcula e é o valor dele que vale. */
  clientEstimate: { min: number; max: number; total: number; deadline: string; diagnosis: boolean };
  origin: Origin;
};

export type FieldErrors = Partial<Record<'name' | 'contact' | 'channel', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Telefone brasileiro: 10 ou 11 dígitos, com ou sem 55. */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  return d.length === 10 || d.length === 11 ? d : '';
}

/**
 * Nome e um canal. Não exige telefone e e-mail ao mesmo tempo: pede só o
 * dado do canal escolhido.
 */
export function validateLead(p: Project): FieldErrors {
  const errors: FieldErrors = {};
  const { name, channel, contact } = p.lead;
  if (name.trim().length < 2) errors.name = 'Informe como podemos chamar você.';
  if (!['whatsapp', 'telefone', 'email'].includes(channel)) errors.channel = 'Escolha um canal de contato.';
  else if (channel === 'email') {
    if (!EMAIL.test(contact.trim())) errors.contact = 'Informe um e-mail válido, como nome@empresa.com.br.';
  } else if (!normalizePhone(contact)) {
    errors.contact = 'Informe um telefone com DDD, como (51) 99999-0000.';
  }
  return errors;
}

/** Hash curto e estável (FNV-1a), só para formar a chave de idempotência. */
export function stableHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/**
 * Mesmos dados geram a mesma chave: clique duplo, repetição ou nova
 * tentativa depois de erro não criam um segundo pedido no receptor.
 */
export function buildPayload(input: Project, origin: Origin): LeadPayload {
  const p = normalizeProject(input);
  const e = projectEstimate(p);
  const contactValue = p.lead.channel === 'email' ? p.lead.contact.trim().toLowerCase() : normalizePhone(p.lead.contact);
  const need = p.complex.length
    ? complexNeeds.filter((n) => p.complex.includes(n.id)).map((n) => n.name).join('; ')
    : p.guidance
      ? 'Precisa de orientação para definir'
      : p.objective;
  const body = {
    projectId: p.id,
    contact: { name: p.lead.name.trim(), channel: p.lead.channel, value: contactValue },
    project: { ...p, step: 0 },
  };
  return {
    schema: LEAD_SCHEMA_VERSION,
    idempotencyKey: `${p.id || 'sem-id'}:${stableHash(JSON.stringify(body))}`,
    projectId: p.id,
    flowVersion: FLOW_VERSION,
    contact: body.contact,
    qualification: { need, budget: budgetInfo(p), deadline: p.lead.deadline, decision: p.lead.decision },
    consent: { commercial: true, marketing: p.lead.marketing },
    project: p,
    clientEstimate: { min: e.min, max: e.max, total: e.total, deadline: e.deadline, diagnosis: needsDiagnosis(p) },
    origin,
  };
}

export type SubmitResult =
  | { ok: true; leadRef: string; duplicate: boolean }
  | { ok: false; reason: 'validacao' | 'rede' | 'tempo' | 'servidor' | 'sem-receptor' };

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/**
 * Envia e só devolve sucesso se o receptor confirmar que salvou
 * ({ ok: true, leadId }). Qualquer outra resposta é falha — os dados do
 * formulário continuam no navegador para uma nova tentativa.
 */
export async function submitLead(
  payload: LeadPayload,
  endpoint: string,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
  timeoutMs = 15000,
): Promise<SubmitResult> {
  if (!endpoint) return { ok: false, reason: 'sem-receptor' };
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': payload.idempotencyKey },
      body: JSON.stringify(payload),
      signal: controller?.signal,
    });
    if (res.status === 422) return { ok: false, reason: 'validacao' };
    if (!res.ok) return { ok: false, reason: 'servidor' };
    const data = (await res.json().catch(() => null)) as { ok?: unknown; leadId?: unknown; duplicate?: unknown } | null;
    if (!data || data.ok !== true || typeof data.leadId !== 'string' || !data.leadId) return { ok: false, reason: 'servidor' };
    return { ok: true, leadRef: data.leadId, duplicate: data.duplicate === true };
  } catch (err) {
    return { ok: false, reason: (err as { name?: string })?.name === 'AbortError' ? 'tempo' : 'rede' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Envolve o envio com uma trava: enquanto um pedido está em andamento,
 * novas chamadas recebem a mesma promessa em vez de disparar outra
 * requisição.
 */
export function createSubmitter(send: (p: LeadPayload) => Promise<SubmitResult>) {
  let inFlight: Promise<SubmitResult> | null = null;
  return (payload: LeadPayload): Promise<SubmitResult> => {
    if (inFlight) return inFlight;
    inFlight = send(payload).finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}

export const reasonText: Record<Exclude<SubmitResult, { ok: true }>['reason'], string> = {
  validacao: 'Alguns dados não foram aceitos. Confira os campos e tente de novo.',
  rede: 'Não foi possível conectar. Suas respostas continuam aqui — tente de novo em instantes.',
  tempo: 'O envio demorou demais. Suas respostas continuam aqui — tente de novo.',
  servidor: 'O pedido não foi confirmado. Nada foi perdido — tente de novo ou fale pelo WhatsApp.',
  'sem-receptor': 'O envio direto não está disponível. Use o WhatsApp para falar com a gente.',
};
