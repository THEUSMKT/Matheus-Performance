/* ==========================================================================
   Modelo do projeto configurado pelo visitante.

   Versão 3: acrescenta caminho de contratação, serviço principal, pedido de
   orientação, necessidades que exigem diagnóstico, limite de orçamento e
   dados de contato — tudo validado ao ler do navegador, de links ou de
   versões anteriores. Nenhum valor monetário é definido aqui: todo preço sai
   de config/pricing.ts via lib/estimate.ts.
   ========================================================================== */
import { pricing, brl } from '../config/pricing';
import { features } from '../config/features';
import { contact } from '../config/contact';
import { plans, complexNeeds, revisionRounds, type Plan } from '../config/offer';
import { volumeOptions } from '../config/forms';
import { siteTypes } from '../config/siteTypes';
import { breakdown, estimate, type BreakdownLine, type Estimate } from './estimate';
import { emptySelection, type Selection } from './types';

/* ── Catálogos ───────────────────────────────────────────────────────────── */

export const segments = [
  { id: 'local', name: 'Serviços locais', demo: 'Oficina do Lar', title: 'Sua casa bem cuidada, sem complicação.', intro: 'Reparos e soluções para deixar cada ambiente pronto para o seu dia a dia.', services: ['Pequenos reparos', 'Instalações', 'Manutenção preventiva'], label: 'Cuidado em cada detalhe' },
  { id: 'beleza', name: 'Beleza e bem-estar', demo: 'Ateliê Aurora', title: 'Um tempo para você. Um cuidado só seu.', intro: 'Beleza e bem-estar com atenção ao seu estilo e à sua rotina.', services: ['Cuidados faciais', 'Beleza natural', 'Rituais de bem-estar'], label: 'Seu momento de cuidado' },
  { id: 'consultoria', name: 'Consultoria e autônomos', demo: 'Clara Consultoria', title: 'Clareza para dar o próximo passo.', intro: 'Orientação próxima para organizar prioridades e transformar ideias em um plano de ação.', services: ['Diagnóstico inicial', 'Planejamento', 'Acompanhamento'], label: 'Ideias que ganham direção' },
  { id: 'criativo', name: 'Portfólio criativo', demo: 'Estúdio Forma', title: 'Boas ideias merecem ganhar forma.', intro: 'Design e direção criativa para marcas com algo próprio a dizer.', services: ['Identidade visual', 'Design editorial', 'Direção de arte'], label: 'Design com intenção' },
  { id: 'alimentacao', name: 'Alimentação', demo: 'Casa Oliva', title: 'Feito com calma. Servido com afeto.', intro: 'Receitas da casa, ingredientes da estação e uma boa razão para reunir quem você gosta.', services: ['Pratos da casa', 'Opções da estação', 'Encomendas especiais'], label: 'Sabores para compartilhar' },
  { id: 'outro', name: 'Outro segmento', demo: 'Seu Negócio · demonstração', title: 'O que você precisa, com atenção de verdade.', intro: 'Conheça nossos serviços e encontre a solução que faz sentido para você.', services: ['Atendimento personalizado', 'Soluções sob medida', 'Acompanhamento'], label: 'Seu negócio, bem apresentado' },
] as const;

export const objectives = [
  { id: 'orcamento', name: 'Receber pedidos de orçamento', cta: 'Pedir um orçamento' },
  { id: 'servicos', name: 'Apresentar meus serviços', cta: 'Conhecer os serviços' },
  { id: 'agenda', name: 'Facilitar solicitações de horário', cta: 'Solicitar um horário' },
  { id: 'trabalhos', name: 'Mostrar meus trabalhos', cta: 'Ver trabalhos' },
  { id: 'localizacao', name: 'Apresentar meu negócio e localização', cta: 'Ver localização' },
] as const;

export const directions = [
  { id: 'essencial', name: 'Essencial', template: 'minimal', style: 'minimalista', description: 'Linhas limpas, leitura direta e espaço para respirar.' },
  { id: 'elegante', name: 'Elegante', template: 'elegance', style: 'elegante', description: 'Tipografia editorial, tons suaves e detalhes delicados.' },
  { id: 'marcante', name: 'Marcante', template: 'bold', style: 'criativo', description: 'Títulos fortes, contraste e composição expressiva.' },
] as const;

export const palettes = [
  { id: 'roxo', name: 'Violeta', accent: '#6650b5', bg: '#f6f3fc' },
  { id: 'verde', name: 'Oliva', accent: '#485d44', bg: '#f2f3ea' },
  { id: 'azul', name: 'Oceano', accent: '#285c79', bg: '#eff5f8' },
  { id: 'terracota', name: 'Argila', accent: '#a44932', bg: '#fbf2eb' },
] as const;

export const sections = [
  { id: 'apresentacao', name: 'Apresentação', feature: null, fixed: true },
  { id: 'servicos', name: 'Serviços', feature: null, fixed: false },
  { id: 'sobre', name: 'Sobre o negócio', feature: null, fixed: false },
  { id: 'galeria', name: 'Galeria', feature: 'galeria', fixed: false },
  { id: 'depoimentos', name: 'Depoimentos', feature: 'depoimentos', fixed: false },
  { id: 'faq', name: 'Perguntas frequentes', feature: 'faq', fixed: false },
  { id: 'localizacao', name: 'Localização', feature: 'mapa', fixed: false },
  { id: 'contato', name: 'Contato', feature: null, fixed: true },
] as const;

/** Recursos que dependem de um serviço de terceiros, com custo próprio. */
export const externalFeatures = ['formularioEmail', 'agendamento', 'instagram'];

/** Versão do fluxo apresentado — registrada no projeto e nos eventos. */
export const FLOW_VERSION = 'assistido-4m-v1';
export const STEP_COUNT = 4;
export const steps = ['Negócio e objetivo', 'Recomendação', 'Ajustes opcionais', 'Resumo e próximo passo'] as const;

/** Chaves de armazenamento, da atual para as anteriores. */
export const KEY = 'mb.configurador.v3';
export const LEGACY_KEYS = { v2: 'mb.configurador.v2', v1: 'mb.configurador.v1' } as const;

export const contactChannels = [
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'telefone', name: 'Ligação' },
  { id: 'email', name: 'E-mail' },
] as const;

export const desiredDeadlines = [
  { id: 'urgente', name: 'O quanto antes' },
  { id: 'mes', name: 'No próximo mês' },
  { id: 'sem_pressa', name: 'Sem pressa' },
  { id: 'nao_sei', name: 'Ainda não sei' },
] as const;

export const decisionRoles = [
  { id: 'eu', name: 'Eu decido' },
  { id: 'junto', name: 'Decido junto com outra pessoa' },
  { id: 'outra', name: 'Outra pessoa decide' },
] as const;

/* ── Tipos ───────────────────────────────────────────────────────────────── */

export type Lead = {
  name: string;
  channel: string;
  /** Telefone ou e-mail, conforme o canal. Opcional quando o canal é WhatsApp. */
  contact: string;
  deadline: string;
  decision: string;
  /** Aceite separado para comunicações promocionais. Nunca vem marcado. */
  marketing: boolean;
};

export type Project = {
  version: 3;
  /** Versão do fluxo em que o projeto foi editado por último. */
  flow: string;
  /** Identificador local, gerado no primeiro salvamento. */
  id: string;
  name: string;
  description: string;
  segment: string;
  segmentOther: string;
  service: string;
  objective: string;
  /** O visitante pediu orientação em vez de decidir sozinho. */
  guidance: boolean;
  /** Necessidades que levam o projeto para diagnóstico. */
  complex: string[];
  plan: Plan['id'] | null;
  sections: string[];
  direction: string;
  palette: string;
  custom: string | null;
  font: string;
  features: string[];
  type: string;
  legacyTemplate?: string;
  legacyStyle?: string;
  emailVolume: string | null;
  /** Entrada do limite de orçamento, como digitada. '' = não informado. */
  budget: string;
  budgetOn: boolean;
  step: number;
  lead: Lead;
};

export const emptyLead: Lead = { name: '', channel: 'whatsapp', contact: '', deadline: '', decision: '', marketing: false };

export function initialProject(): Project {
  return {
    version: 3,
    flow: FLOW_VERSION,
    id: '',
    name: '',
    description: '',
    segment: 'consultoria',
    segmentOther: '',
    service: '',
    objective: 'orcamento',
    guidance: false,
    complex: [],
    plan: null,
    sections: ['apresentacao', 'servicos', 'sobre', 'contato'],
    direction: 'essencial',
    palette: 'azul',
    custom: null,
    font: 'auto',
    features: ['whatsapp', 'redes'],
    type: 'landing',
    emailVolume: null,
    budget: '',
    budgetOn: false,
    step: 0,
    lead: { ...emptyLead },
  };
}

/* ── Validação ───────────────────────────────────────────────────────────── */

const record = (x: unknown): Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {};
const cleanText = (x: unknown, max: number) =>
  typeof x === 'string' ? x.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max) : '';
const pick = (x: unknown, ids: readonly string[], fallback: string) =>
  typeof x === 'string' && ids.includes(x) ? x : fallback;
const pickOrEmpty = (x: unknown, ids: readonly string[]) => (typeof x === 'string' && ids.includes(x) ? x : '');
const has = (obj: object, key: unknown) => typeof key === 'string' && Object.hasOwn(obj, key);

export function normalizeLead(input: unknown): Lead {
  const x = record(input);
  return {
    name: cleanText(x.name, 80),
    channel: pick(x.channel, contactChannels.map((c) => c.id), 'whatsapp'),
    contact: cleanText(x.contact, 120),
    deadline: pickOrEmpty(x.deadline, desiredDeadlines.map((d) => d.id)),
    decision: pickOrEmpty(x.decision, decisionRoles.map((d) => d.id)),
    marketing: x.marketing === true,
  };
}

/**
 * Lê qualquer coisa — armazenamento, link, versão anterior — e devolve um
 * projeto válido. Ids desconhecidos caem para o padrão; recursos repetidos
 * viram um; seções pagas e recursos ficam sempre em sincronia.
 */
export function normalizeProject(input: unknown): Project {
  const x = record(input);
  const d = initialProject();
  if (x.version !== 3) return d;

  const chosen = Array.isArray(x.sections)
    ? [...new Set(x.sections.filter((s): s is string => typeof s === 'string' && sections.some((a) => a.id === s)))]
    : [...d.sections];
  for (const s of sections.filter((s) => s.fixed)) if (!chosen.includes(s.id)) chosen.push(s.id);

  // Seções pagas são a fonte de verdade dos seus recursos: some o recurso
  // solto e ele volta só se a seção estiver marcada. Nunca cobra duas vezes.
  let selected = Array.isArray(x.features)
    ? [...new Set(x.features.filter((f): f is string => typeof f === 'string' && features.some((a) => a.id === f)))]
    : [...d.features];
  selected = selected.filter((f) => !sections.some((s) => s.feature === f));
  for (const id of chosen) {
    const f = sections.find((s) => s.id === id)?.feature;
    if (f && !selected.includes(f)) selected.push(f);
  }
  for (const f of ['whatsapp', 'redes']) if (!selected.includes(f)) selected.push(f);

  const complex = Array.isArray(x.complex)
    ? [...new Set(x.complex.filter((c): c is string => typeof c === 'string' && complexNeeds.some((n) => n.id === c)))]
    : [];

  return {
    ...d,
    flow: typeof x.flow === 'string' ? cleanText(x.flow, 40) : FLOW_VERSION,
    id: typeof x.id === 'string' && /^bp-[a-z0-9]{8,16}$/.test(x.id) ? x.id : '',
    name: cleanText(x.name, 80),
    description: cleanText(x.description, 280),
    segment: pick(x.segment, segments.map((s) => s.id), d.segment),
    segmentOther: cleanText(x.segmentOther, 60),
    service: cleanText(x.service, 100),
    objective: pick(x.objective, objectives.map((o) => o.id), d.objective),
    guidance: x.guidance === true,
    complex,
    plan: (pickOrEmpty(x.plan, plans.map((p) => p.id)) || null) as Project['plan'],
    sections: chosen,
    features: selected,
    direction: pick(x.direction, directions.map((s) => s.id), d.direction),
    palette: pick(x.palette, palettes.map((s) => s.id), d.palette),
    custom: typeof x.custom === 'string' && /^#[0-9a-f]{6}$/i.test(x.custom) ? x.custom.toLowerCase() : null,
    font: pick(x.font, ['auto', 'sans', 'serif'], 'auto'),
    type: pick(x.type, Object.keys(pricing.byType), 'landing'),
    legacyTemplate: has(pricing.byTemplate, x.legacyTemplate) ? (x.legacyTemplate as string) : undefined,
    legacyStyle: has(pricing.byStyle, x.legacyStyle) ? (x.legacyStyle as string) : undefined,
    emailVolume: pickOrEmpty(x.emailVolume, volumeOptions.map((v) => v.id)) || null,
    budget: cleanText(x.budget, 16),
    budgetOn: x.budgetOn === true,
    step: typeof x.step === 'number' && Number.isInteger(x.step) ? Math.max(0, Math.min(STEP_COUNT - 1, x.step)) : 0,
    lead: normalizeLead(x.lead),
  };
}

/** Etapas do fluxo de seis passos (v2) para os quatro momentos (v3). */
const V2_STEP_TO_V3 = [0, 0, 1, 2, 2, 3];

/** Projeto salvo pela versão anterior do configurador (seis etapas). */
export function fromV2(input: unknown): Project {
  const x = record(input);
  if (x.version !== 2) return initialProject();
  const step = typeof x.step === 'number' && Number.isInteger(x.step) ? V2_STEP_TO_V3[Math.max(0, Math.min(5, x.step))] : 0;
  return normalizeProject({ ...x, version: 3, flow: 'seis-etapas-v2', step, complex: [], plan: null, budget: '', budgetOn: false });
}

/** Seleção do configurador original (v1), antes das etapas guiadas. */
export function migrateLegacy(input: unknown): Project {
  const x = record(record(input).selection);
  const d = initialProject();
  if (!Object.keys(x).length) return d;
  const fs = Array.isArray(x.features) ? x.features : [];
  return normalizeProject({
    ...d,
    flow: 'configurador-v1',
    name: x.company,
    type: x.type,
    legacyTemplate: x.template,
    legacyStyle: x.style,
    palette: x.color,
    custom: record(x.customColor).accent,
    features: fs,
    sections: [...d.sections, ...sections.filter((s) => s.feature && fs.includes(s.feature)).map((s) => s.id)],
    emailVolume: x.emailVolume,
    lead: { name: x.name },
  });
}

/** Lê o que houver salvo, da versão mais nova para a mais antiga. */
export function readStored(get: (key: string) => string | null): { project: Project; source: 'v3' | 'v2' | 'v1' } | null {
  const v3 = get(KEY);
  if (v3) return { project: normalizeProject(JSON.parse(v3)), source: 'v3' };
  const v2 = get(LEGACY_KEYS.v2);
  if (v2) return { project: fromV2(JSON.parse(v2)), source: 'v2' };
  const v1 = get(LEGACY_KEYS.v1);
  if (v1) return { project: migrateLegacy(JSON.parse(v1)), source: 'v1' };
  return null;
}

/** Identificador local, curto e não sequencial. */
export function newProjectId(random: () => number = Math.random): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'bp-';
  for (let i = 0; i < 10; i++) id += alphabet[Math.floor(random() * alphabet.length)];
  return id;
}

/* ── Cálculo ─────────────────────────────────────────────────────────────── */

export function selectionFor(p: Project): Selection {
  const d = directions.find((d) => d.id === p.direction)!;
  return {
    ...emptySelection,
    type: p.type,
    template: p.legacyTemplate ?? d.template,
    style: p.legacyStyle ?? d.style,
    color: p.palette,
    customColor: p.custom ? { accent: p.custom, bg: '#faf9f6' } : null,
    font: p.font,
    features: p.features,
    company: p.name,
    emailVolume: p.emailVolume,
  };
}

export function projectEstimate(p: Project): Estimate {
  return estimate(selectionFor(p));
}

/** O projeto tem alguma necessidade que não cabe em estimativa automática? */
export function needsDiagnosis(p: Project): boolean {
  return p.complex.length > 0;
}

export function priceLabel(p: Project): string {
  const e = projectEstimate(p);
  return `${brl(e.min)} – ${brl(e.max)}`;
}

/** Texto do preço conforme o caso: faixa, ou diagnóstico sem faixa. */
export function investmentLabel(p: Project): string {
  return needsDiagnosis(p) ? 'Sob diagnóstico' : priceLabel(p);
}

export type CompositionLine = { label: string; note?: string; value: number };

/** Composição legível da estimativa. A soma é sempre o total calculado. */
export function composition(p: Project): CompositionLine[] {
  const sel = selectionFor(p);
  return breakdown(sel).map((line: BreakdownLine): CompositionLine => {
    switch (line.kind) {
      case 'base':
        return { label: 'Projeto base', note: 'Página principal responsiva, WhatsApp, redes, ajustes e publicação', value: line.value };
      case 'type':
        return {
          label: `Categoria: ${siteTypes.find((t) => t.id === line.id)?.name ?? line.id}`,
          note: 'Organização do conteúdo; não adiciona páginas',
          value: line.value,
        };
      case 'identity': {
        const dir = directions.find((d) => d.template === sel.template && d.style === sel.style);
        return {
          label: `Identidade visual: ${dir?.name ?? `${sel.template} / ${sel.style}`}`,
          note: pricing.identity.mode === 'incluida' ? 'Aplicação básica incluída no pacote' : undefined,
          value: line.value,
        };
      }
      case 'colors':
        return { label: 'Adaptação às cores da sua marca', value: line.value };
      default: {
        const section = sections.find((s) => s.feature === line.id);
        const name = features.find((f) => f.id === line.id)?.name ?? line.id;
        return {
          label: section ? `Seção: ${section.name}` : name,
          note: externalFeatures.includes(line.id) ? 'Implementação; a assinatura da plataforma é à parte' : undefined,
          value: line.value,
        };
      }
    }
  });
}

export function directionPrice(id: string): number {
  const d = directions.find((d) => d.id === id)!;
  if (pricing.identity.mode === 'incluida') return 0;
  return pricing.byTemplate[d.template] + pricing.byStyle[d.style];
}

/* ── Orçamento informado ─────────────────────────────────────────────────── */

export type BudgetInfo =
  | { status: 'ausente' }
  | { status: 'invalido' }
  | { status: 'abaixo'; value: number }
  | { status: 'valido'; value: number; fit: 'cabe' | 'pode_ultrapassar' | 'excede' | 'diagnostico' };

/** Aceita "1500", "1.500", "1500,00" e "R$ 1.500". */
export function parseBudget(raw: string): number | null {
  const t = raw.replace(/R\$|\s/gi, '').trim();
  if (!t) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return NaN;
  return Number(t.replace(/\./g, '').replace(',', '.'));
}

/**
 * Diferencia orçamento não informado de orçamento zero ou inválido, e
 * compara com a faixa: cabe inteira, pode ultrapassar (o teto passa do
 * limite) ou excede (o piso já passa).
 */
export function budgetInfo(p: Project): BudgetInfo {
  if (!p.budgetOn) return { status: 'ausente' };
  const value = parseBudget(p.budget);
  if (value === null) return { status: 'ausente' };
  if (!Number.isFinite(value) || value <= 0) return { status: 'invalido' };
  if (value < pricing.base) return { status: 'abaixo', value };
  if (needsDiagnosis(p)) return { status: 'valido', value, fit: 'diagnostico' };
  const e = projectEstimate(p);
  const fit = e.max <= value ? 'cabe' : e.min <= value ? 'pode_ultrapassar' : 'excede';
  return { status: 'valido', value, fit };
}

export function budgetText(p: Project): string {
  const b = budgetInfo(p);
  switch (b.status) {
    case 'ausente':
      return 'Não informado';
    case 'invalido':
      return 'Valor informado não reconhecido — confirmar na conversa';
    case 'abaixo':
      return `${brl(b.value)} — abaixo do projeto base de ${brl(pricing.base)}`;
    case 'valido':
      return {
        cabe: `${brl(b.value)} — a faixa estimada cabe no limite`,
        pode_ultrapassar: `${brl(b.value)} — a faixa pode ultrapassar o limite`,
        excede: `${brl(b.value)} — a estimativa passa do limite`,
        diagnostico: `${brl(b.value)} — comparação após o diagnóstico`,
      }[b.fit];
  }
}

/* ── Recomendação ────────────────────────────────────────────────────────── */

export function recommendations(p: Project): string[] {
  return [
    ...new Set([
      'apresentacao',
      'servicos',
      'sobre',
      ...(p.segment === 'criativo' || p.objective === 'trabalhos' ? ['galeria'] : []),
      ...(p.segment === 'local' || p.segment === 'alimentacao' || p.objective === 'localizacao' ? ['localizacao'] : []),
      'contato',
    ]),
  ];
}

/** Caminho recomendado por regra, a partir das respostas do Momento 1. */
export function recommendedPlan(p: Project): Plan['id'] {
  if (needsDiagnosis(p)) return 'empresarial';
  if (!p.guidance && p.objective === 'orcamento') return 'captacao';
  return 'presenca';
}

/** Por que esta recomendação — uma frase, para o visitante entender. */
export function recommendationReason(p: Project): string {
  if (needsDiagnosis(p))
    return 'Você indicou uma necessidade que depende de levantamento. O caminho empresarial começa por esse diagnóstico, sem prometer um valor antes da hora.';
  if (p.guidance)
    return 'Começamos pelo essencial para você decidir com calma. Na conversa, ajustamos a estrutura ao que fizer sentido para o seu negócio.';
  switch (p.objective) {
    case 'orcamento':
      return 'Como o objetivo é receber pedidos de orçamento, a estrutura organiza a oferta e usa um formulário que já chega pelo WhatsApp com as informações certas.';
    case 'agenda':
      return 'Para pedidos de horário, o botão de WhatsApp resolve sem assinatura extra. Agenda automática só entra se você precisar.';
    case 'trabalhos':
      return 'Para mostrar trabalhos, a galeria entra na estrutura e o contato fica sempre à mão.';
    case 'localizacao':
      return 'Para quem precisa ser encontrado, a localização entra na estrutura junto dos serviços e do contato.';
    default:
      return 'Para apresentar serviços com clareza, a estrutura essencial já cobre apresentação, serviços, sobre e contato.';
  }
}

/** Aplica um caminho de contratação, preservando identidade e textos. */
export function applyPlan(p: Project, planId: Plan['id']): Project {
  const plan = plans.find((x) => x.id === planId)!;
  const extraSections = recommendations(p).filter((s) => !plan.config.sections.includes(s));
  return normalizeProject({
    ...p,
    plan: plan.id,
    type: plan.config.type,
    sections: [...plan.config.sections, ...extraSections],
    features: [...plan.config.features],
  });
}

/**
 * Ajustes de estrutura que o visitante fez por conta própria, além do
 * caminho escolhido (ou da estrutura inicial, se nenhum foi escolhido).
 * Serve para pedir confirmação antes de um caminho substituí-los.
 */
export function customStructure(p: Project): string[] {
  const d = initialProject();
  const baseline = p.plan ? applyPlan(p, p.plan) : normalizeProject({ ...p, type: d.type, sections: d.sections, features: d.features });
  return choiceChanges(baseline, p).filter((c) => ['seções', 'recursos', 'categoria'].includes(c));
}

/** Exemplo demonstrativo por segmento, usado como ponto de partida. */
export function exampleProject(id: string): Project {
  const p = normalizeProject({
    ...initialProject(),
    segment: id,
    objective: id === 'criativo' ? 'trabalhos' : id === 'beleza' ? 'agenda' : id === 'alimentacao' ? 'localizacao' : 'orcamento',
    direction: id === 'beleza' || id === 'alimentacao' ? 'elegante' : id === 'criativo' ? 'marcante' : 'essencial',
    palette: id === 'alimentacao' ? 'verde' : id === 'beleza' ? 'terracota' : id === 'criativo' ? 'roxo' : 'azul',
  });
  return normalizeProject({ ...p, sections: recommendations(p) });
}

/** Campos que mudam a estrutura, a identidade ou o preço. */
const CHOICE_FIELDS = ['segment', 'objective', 'plan', 'sections', 'direction', 'palette', 'custom', 'font', 'features', 'type'] as const;

/** Lista legível do que mudaria se `next` substituísse `current`. */
export function choiceChanges(current: Project, next: Project): string[] {
  const labels: Record<(typeof CHOICE_FIELDS)[number], string> = {
    segment: 'segmento', objective: 'objetivo', plan: 'caminho de contratação', sections: 'seções',
    direction: 'identidade visual', palette: 'cores', custom: 'cores', font: 'tipografia', features: 'recursos', type: 'categoria',
  };
  const changed = CHOICE_FIELDS.filter((f) => JSON.stringify(current[f]) !== JSON.stringify(next[f])).map((f) => labels[f]);
  return [...new Set(changed)];
}

/** O visitante já fez escolhas próprias (diferentes do ponto de partida)? */
export function hasOwnChoices(p: Project): boolean {
  return choiceChanges(initialProject(), p).length > 0;
}

/** Mantém o que o visitante digitou e troca só as escolhas estruturais. */
export function mergeStartingPoint(current: Project, base: Project): Project {
  return normalizeProject({
    ...base,
    id: current.id,
    name: current.name,
    description: current.description,
    service: current.service,
    segmentOther: base.segment === 'outro' ? current.segmentOther : '',
    guidance: current.guidance,
    complex: current.complex,
    budget: current.budget,
    budgetOn: current.budgetOn,
    lead: current.lead,
    step: current.step,
  });
}

/* ── Compartilhamento ────────────────────────────────────────────────────── */

/**
 * Link público só com opções. Ficam fora: nome, descrição, serviço, texto de
 * segmento, orçamento, dados de contato e o identificador.
 */
export function shareLink(p: Project): string {
  const n = normalizeProject(p);
  const safe = {
    version: 3,
    segment: n.segment,
    objective: n.objective,
    guidance: n.guidance,
    complex: n.complex,
    plan: n.plan,
    sections: n.sections,
    direction: n.direction,
    palette: n.palette,
    custom: n.custom,
    font: n.font,
    features: n.features,
    type: n.type,
    legacyTemplate: n.legacyTemplate,
    legacyStyle: n.legacyStyle,
    emailVolume: n.emailVolume,
    step: STEP_COUNT - 1,
  };
  return `${contact.siteUrl}/#projeto=${encodeURIComponent(JSON.stringify(safe))}`;
}

/** Lê links da versão atual e da anterior. Lança erro se o link não for válido. */
export function fromShare(hash: string): Project | null {
  if (!hash.startsWith('#projeto=')) return null;
  if (hash.length > 6000) throw Error('Link muito longo');
  const data = record(JSON.parse(decodeURIComponent(hash.slice(9))));
  const privateless = { name: '', description: '', service: '', segmentOther: '', budget: '', budgetOn: false, lead: emptyLead, id: '' };
  if (data.version === 3) return normalizeProject({ ...data, ...privateless });
  if (data.version === 2) return fromV2({ ...data, ...privateless });
  throw Error('Versão de link não reconhecida');
}

/* ── Apresentação ────────────────────────────────────────────────────────── */

export function contrastInk(hex: string): string {
  const rgb = hex.slice(1).match(/../g)!.map((v) => parseInt(v, 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  return (l + 0.05) / 0.05 >= 4.5 ? '#000000' : '#ffffff';
}

export function segmentLabel(p: Project): string {
  const s = segments.find((a) => a.id === p.segment)!;
  return p.segment === 'outro' && p.segmentOther.trim() ? `Outro: ${p.segmentOther.trim()}` : s.name;
}

export function pagesLabel(p: Project): string {
  return p.features.includes('paginaExtra') ? 'Página principal + 1 página adicional' : 'Página principal';
}

export function selectedSections(p: Project): string[] {
  return sections.filter((s) => p.sections.includes(s.id)).map((s) => s.name);
}

/** Opcionais que não são seções nem o essencial incluído. */
export function selectedExtras(p: Project): string[] {
  return features
    .filter((f) => p.features.includes(f.id) && !['whatsapp', 'redes'].includes(f.id) && !sections.some((s) => s.feature === f.id))
    .map((f) => f.name);
}

export function externalCostLines(p: Project): string[] {
  const lines = ['Domínio e hospedagem', 'E-mail profissional, se desejar'];
  if (p.features.includes('formularioEmail')) lines.push('Plataforma de formulário por e-mail, conforme o volume');
  if (p.features.includes('agendamento')) lines.push('Plataforma de agendamento');
  if (p.features.includes('instagram')) lines.push('Ferramenta de exibição do Instagram, se necessária');
  return lines;
}

export const nextStepText =
  'Na conversa, confirmamos escopo, conteúdo e prazo por escrito. Nada é contratado ou publicado sem a sua aprovação.';

/** Prazo com o início da contagem, igual em todos os resumos. */
export function deadlineText(p: Project): string {
  if (needsDiagnosis(p)) return 'Definido após o diagnóstico';
  return `${projectEstimate(p).deadline}, contados após o recebimento de textos, imagens e logo`;
}

/**
 * Mensagem do WhatsApp: legível, com o essencial para a conversa começar.
 * Usa exatamente as mesmas funções da página e do PDF.
 */
export function projectMessage(p: Project, origin?: string): string {
  const plan = plans.find((x) => x.id === (p.plan ?? recommendedPlan(p)))!;
  const objective = objectives.find((o) => o.id === p.objective)!;
  const extras = selectedExtras(p);
  const lead = p.lead;
  const lines: string[] = [contact.whatsappIntro, ''];

  if (lead.name.trim()) lines.push(`Meu nome: ${lead.name.trim()}`);
  lines.push(`Negócio: ${p.name.trim() || 'a informar'}`);
  lines.push(`Segmento: ${segmentLabel(p)}`);
  if (p.service.trim()) lines.push(`Serviço principal: ${p.service.trim()}`);
  lines.push(`Objetivo: ${p.guidance ? 'preciso de orientação para definir' : objective.name}`);
  if (p.description.trim()) lines.push(`Sobre o negócio: ${p.description.trim()}`);

  lines.push('', `Caminho: ${plan.name}${p.plan ? '' : ' (recomendado)'}`);
  lines.push(`Estrutura: ${pagesLabel(p)}`);
  lines.push(`Seções: ${selectedSections(p).join(', ')}`);
  if (extras.length) lines.push(`Opcionais: ${extras.join(', ')}`);
  lines.push(`Identidade: ${directions.find((d) => d.id === p.direction)!.name}, ${p.custom ? `cor própria ${p.custom}` : palettes.find((x) => x.id === p.palette)!.name}`);
  if (p.features.includes('formularioEmail')) {
    const v = volumeOptions.find((o) => o.id === p.emailVolume);
    lines.push(`Contatos por mês (formulário por e-mail): ${v ? v.messageLabel : 'a definir'}`);
  }
  if (p.complex.length) {
    lines.push(`Precisa de diagnóstico: ${complexNeeds.filter((n) => p.complex.includes(n.id)).map((n) => n.name).join('; ')}`);
  }

  lines.push('');
  lines.push(needsDiagnosis(p) ? 'Investimento: sob diagnóstico' : `Desenvolvimento estimado: ${priceLabel(p)}`);
  lines.push(`Meu limite de orçamento: ${budgetText(p)}`);
  lines.push(`Prazo estimado: ${deadlineText(p)}`);
  lines.push(`Ajustes: ${revisionRounds} rodadas antes da publicação`);
  lines.push('Custos externos à parte: domínio, hospedagem e plataformas');

  const quando = desiredDeadlines.find((d) => d.id === lead.deadline);
  const decisao = decisionRoles.find((d) => d.id === lead.decision);
  if (quando || decisao) {
    lines.push('');
    if (quando) lines.push(`Quando quero começar: ${quando.name}`);
    if (decisao) lines.push(`Decisão: ${decisao.name}`);
  }

  lines.push('', `Opções do projeto: ${shareLink(p)}`);
  if (p.id || origin) lines.push(`Ref.: ${[p.id, origin].filter(Boolean).join(' · ')}`);
  lines.push('', contact.whatsappOutro);
  return lines.join('\n');
}

/** Mensagem curta para tirar dúvidas no meio do fluxo, sem dados pessoais. */
export function helpMessage(p: Project): string {
  return `Olá! Estou configurando um site no simulador (etapa: ${steps[p.step]}) e fiquei com uma dúvida.`;
}
