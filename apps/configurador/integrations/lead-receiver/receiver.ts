/* ==========================================================================
   Receptor de pedidos — implementação de referência, sem dependência de
   provedor. Recebe o POST da página, valida de novo, recalcula a
   estimativa, salva ANTES de responder e só então tenta o CRM.

   Para ativar: hospede este handler numa função serverless (ou servidor)
   com os adaptadores reais de armazenamento, CRM e fila, e publique a URL
   em NEXT_PUBLIC_LEAD_ENDPOINT. Tokens do CRM ficam só no ambiente dessa
   função — nunca na página. Ver OPERACAO.md.
   ========================================================================== */
import { buildPayload, validateLead, LEAD_SCHEMA_VERSION } from '../../src/lib/leads';
import { normalizeProject, projectEstimate, needsDiagnosis } from '../../src/lib/project';
import { CRM_SCHEMA_VERSION, type CrmLead } from './crm';

export type Stored = { leadId: string; record: CrmLead };

/** Armazenamento durável (banco, planilha, KV). `put` precisa ser atômico por chave. */
export interface LeadStore {
  get(idempotencyKey: string): Promise<Stored | null>;
  put(idempotencyKey: string, value: Stored): Promise<void>;
}
/** Adaptador do CRM (HubSpot, Pipedrive, RD Station, planilha...). */
export interface CrmAdapter {
  upsert(record: CrmLead): Promise<void>;
}
/** Fila de novas tentativas quando o CRM falha. */
export interface RetryQueue {
  push(job: { kind: 'crm_upsert'; leadId: string; attempt: number }): Promise<void>;
}

export type ReceiverRequest = { method: string; headers: Record<string, string | undefined>; body: string };
export type ReceiverResponse = { status: number; headers: Record<string, string>; body: string };

type Deps = {
  store: LeadStore;
  crm: CrmAdapter;
  queue: RetryQueue;
  /** Origem permitida no CORS, ex.: https://theusmkt.github.io */
  allowedOrigin: string;
  now?: () => Date;
  newId?: () => string;
  log?: (msg: string, data?: Record<string, unknown>) => void;
};

const json = (status: number, body: unknown, origin: string): ReceiverResponse => ({
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  },
  body: JSON.stringify(body),
});

export function createReceiver(deps: Deps) {
  const now = deps.now ?? (() => new Date());
  const newId = deps.newId ?? (() => `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  const log = deps.log ?? (() => {});

  return async function handle(req: ReceiverRequest): Promise<ReceiverResponse> {
    const origin = deps.allowedOrigin;
    if (req.method === 'OPTIONS') return json(204, null, origin);
    if (req.method !== 'POST') return json(405, { ok: false, error: 'metodo' }, origin);
    if (req.headers.origin && req.headers.origin !== origin) return json(403, { ok: false, error: 'origem' }, origin);
    if (req.body.length > 64_000) return json(413, { ok: false, error: 'tamanho' }, origin);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(req.body);
    } catch {
      return json(400, { ok: false, error: 'json' }, origin);
    }
    if (data.schema !== LEAD_SCHEMA_VERSION) return json(422, { ok: false, error: 'versao' }, origin);

    // Nada do navegador é aceito sem passar pelas mesmas regras de novo.
    const project = normalizeProject(data.project);
    const errors = validateLead(project);
    if (Object.keys(errors).length) return json(422, { ok: false, error: 'validacao', fields: Object.keys(errors) }, origin);

    const payload = buildPayload(project, (data.origin ?? {}) as never);
    const key = req.headers['idempotency-key'];
    if (!key || key !== data.idempotencyKey || key !== payload.idempotencyKey) {
      return json(422, { ok: false, error: 'idempotencia' }, origin);
    }

    // Repetição (clique duplo, nova tentativa): devolve o mesmo pedido.
    const existing = await deps.store.get(key);
    if (existing) return json(200, { ok: true, leadId: existing.leadId, duplicate: true }, origin);

    const e = projectEstimate(project);
    const estimate = { min: e.min, max: e.max, total: e.total, deadline: e.deadline, diagnosis: needsDiagnosis(project) };
    const client = data.clientEstimate as Partial<typeof estimate> | undefined;
    const leadId = newId();
    const record: CrmLead = {
      schema: CRM_SCHEMA_VERSION,
      leadId,
      idempotencyKey: key,
      createdAt: now().toISOString(),
      stage: 'novo_contato',
      contact: payload.contact,
      qualification: payload.qualification,
      consent: { commercial: true, marketing: project.lead.marketing },
      estimate,
      estimateMismatch: !client || client.total !== estimate.total || client.min !== estimate.min || client.max !== estimate.max,
      flowVersion: typeof data.flowVersion === 'string' ? data.flowVersion.slice(0, 40) : '',
      projectId: project.id,
      project,
      origin: payload.origin,
    };

    // Salva antes de confirmar. Se salvar falhar, o visitante vê erro e tenta de novo.
    try {
      await deps.store.put(key, { leadId, record });
    } catch (err) {
      log('falha ao salvar', { error: String(err) });
      return json(503, { ok: false, error: 'armazenamento' }, origin);
    }

    // O pedido já está salvo: falha no CRM vira nova tentativa, não erro para o visitante.
    try {
      await deps.crm.upsert(record);
    } catch (err) {
      log('CRM indisponível, reenfileirado', { leadId, error: String(err) });
      await deps.queue.push({ kind: 'crm_upsert', leadId, attempt: 1 }).catch(() => log('fila indisponível', { leadId }));
    }

    return json(201, { ok: true, leadId, duplicate: false }, origin);
  };
}

/** Adaptadores em memória — só para testes locais. */
export function memoryAdapters() {
  const rows = new Map<string, Stored>();
  const crmRows: CrmLead[] = [];
  const jobs: { kind: 'crm_upsert'; leadId: string; attempt: number }[] = [];
  return {
    rows,
    crmRows,
    jobs,
    store: { get: async (k: string) => rows.get(k) ?? null, put: async (k: string, v: Stored) => void rows.set(k, v) } satisfies LeadStore,
    crm: { upsert: async (r: CrmLead) => void crmRows.push(r) } satisfies CrmAdapter,
    queue: { push: async (j: (typeof jobs)[number]) => void jobs.push(j) } satisfies RetryQueue,
  };
}
