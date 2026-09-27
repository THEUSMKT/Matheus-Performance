/* ==========================================================================
   Modelo do projeto configurado pelo visitante.

   Versão 4: pacotes de preço fixo (config/packages.ts), objetivo que define
   a estrutura, seções em ordem, textos e serviços editáveis, observações e
   necessidades de projeto personalizado. Tudo é validado ao ler do
   navegador, de links ou de versões anteriores (v3, v2 e v1 continuam
   sendo lidas). Nenhum valor monetário é definido aqui.
   ========================================================================== */
import { contact } from '../config/contact';
import {
  brl,
  customNeeds,
  higher,
  packageById,
  packageOrder,
  packages,
  priceNotes,
  rank,
  revisionRounds,
  type Package,
  type PackageId,
} from '../config/packages';
import { segments, keywordRules, type Segment } from '../config/segments';

export { segments };

/* ── Catálogos ───────────────────────────────────────────────────────────── */

export type Objective = {
  id: string;
  name: string;
  /** Texto do botão principal do site. */
  cta: string;
  /** Como o visitante do site entra em contato. */
  contactPath: string;
  /** Estrutura inicial — sempre dentro do Essencial. */
  structure: string[];
  /** Pacote que faz mais sentido para o objetivo, com o motivo em uma frase. */
  recommend?: { pkg: PackageId; reason: string };
};

export const objectives: Objective[] = [
  {
    id: 'orcamento',
    name: 'Pedir um orçamento',
    cta: 'Solicitar orçamento',
    contactPath: 'Pedido de orçamento pelo WhatsApp',
    structure: ['apresentacao', 'servicos', 'diferenciais', 'sobre', 'contato'],
    recommend: { pkg: 'profissional', reason: 'Para pedidos de orçamento, o Profissional acrescenta um formulário que organiza o pedido e perguntas frequentes.' },
  },
  {
    id: 'agendamento',
    name: 'Solicitar um agendamento',
    cta: 'Pedir um horário',
    contactPath: 'Pedido de horário pelo WhatsApp — o horário é confirmado na conversa',
    structure: ['apresentacao', 'servicos', 'atendimento', 'sobre', 'contato'],
  },
  {
    id: 'empresa',
    name: 'Conhecer minha empresa',
    cta: 'Fale com a gente',
    contactPath: 'Conversa pelo WhatsApp',
    structure: ['apresentacao', 'sobre', 'servicos', 'diferenciais', 'contato'],
  },
  {
    id: 'servicos',
    name: 'Ver meus serviços',
    cta: 'Ver serviços',
    contactPath: 'Conversa pelo WhatsApp',
    structure: ['apresentacao', 'servicos', 'processo', 'sobre', 'contato'],
  },
  {
    id: 'produtos',
    name: 'Conhecer meus produtos',
    cta: 'Ver produtos',
    contactPath: 'Pedido pelo WhatsApp, sem pagamento online',
    structure: ['apresentacao', 'servicos', 'sobre', 'atendimento', 'contato'],
    recommend: { pkg: 'completo', reason: 'Para mostrar vários produtos, o Completo inclui uma vitrine com até 10 itens e pedido pelo WhatsApp.' },
  },
  {
    id: 'trabalhos',
    name: 'Ver meus trabalhos',
    cta: 'Ver trabalhos',
    contactPath: 'Conversa pelo WhatsApp',
    structure: ['apresentacao', 'servicos', 'processo', 'sobre', 'contato'],
    recommend: { pkg: 'profissional', reason: 'Para mostrar trabalhos, o Profissional inclui uma galeria com até 8 imagens suas.' },
  },
];

/** Estilos visuais. Os ids são os mesmos das versões anteriores (links e projetos salvos). */
export const directions = [
  { id: 'marcante', name: 'Moderno', description: 'Títulos fortes, contraste e blocos de cor.' },
  { id: 'elegante', name: 'Elegante', description: 'Serifa, tons suaves e composição centralizada.' },
  { id: 'essencial', name: 'Minimalista', description: 'Linhas limpas, muito respiro e leitura direta.' },
  { id: 'tecnologico', name: 'Tecnológico', description: 'Topo escuro com grade e detalhes digitais.' },
  { id: 'sofisticado', name: 'Sofisticado', description: 'Foto em destaque, serifa e tons de papel.' },
  { id: 'escuro', name: 'Escuro', description: 'Fundo escuro em todo o site.' },
] as const;

export const palettes = [
  { id: 'azul', name: 'Oceano', accent: '#285c79', bg: '#eff5f8' },
  { id: 'verde', name: 'Oliva', accent: '#485d44', bg: '#f2f3ea' },
  { id: 'terracota', name: 'Argila', accent: '#a44932', bg: '#fbf2eb' },
  { id: 'roxo', name: 'Violeta', accent: '#6650b5', bg: '#f6f3fc' },
] as const;

export type Section = { id: string; name: string; fixed?: boolean; min: PackageId; hint?: string };

/** Blocos da página. Cada um conta como uma seção do pacote. */
export const sections: Section[] = [
  { id: 'apresentacao', name: 'Apresentação', fixed: true, min: 'essencial' },
  { id: 'servicos', name: 'Serviços', min: 'essencial' },
  { id: 'sobre', name: 'Sobre a empresa', min: 'essencial' },
  { id: 'diferenciais', name: 'Diferenciais', min: 'essencial' },
  { id: 'atendimento', name: 'Informações de atendimento', min: 'essencial', hint: 'Horários, região ou endereço — você informa.' },
  { id: 'processo', name: 'Como funciona', min: 'essencial' },
  { id: 'galeria', name: 'Galeria de fotos', min: 'profissional', hint: 'Com as suas fotos.' },
  { id: 'faq', name: 'Perguntas frequentes', min: 'profissional' },
  { id: 'depoimentos', name: 'Depoimentos', min: 'profissional', hint: 'Só com relatos reais, autorizados pelos seus clientes.' },
  { id: 'vitrine', name: 'Vitrine de produtos', min: 'completo', hint: 'Até 10 itens, com pedido pelo WhatsApp. Sem pagamento online.' },
  { id: 'contato', name: 'Contato', fixed: true, min: 'essencial' },
];

/** Versão do fluxo apresentado — registrada no projeto e nos eventos. */
export const FLOW_VERSION = 'etapas-4-v3';
export const STEP_COUNT = 4;
export const steps = ['Seu negócio', 'Seu objetivo', 'Sua identidade', 'Seu site'] as const;

/** Chaves de armazenamento, da atual para as anteriores. */
export const KEY = 'mb.configurador.v4';
export const LEGACY_KEYS = { v3: 'mb.configurador.v3', v2: 'mb.configurador.v2', v1: 'mb.configurador.v1' } as const;

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

export const GALLERY_SIZES: readonly number[] = [8, 15];

/* ── Tipos ───────────────────────────────────────────────────────────────── */

export type Lead = {
  name: string;
  channel: string;
  /** Telefone ou e-mail, conforme o canal. Só pedido no formulário direto. */
  contact: string;
  deadline: string;
  decision: string;
  /** Aceite separado para comunicações promocionais. Nunca vem marcado. */
  marketing: boolean;
};

export type Project = {
  version: 4;
  /** Versão do fluxo em que o projeto foi editado por último. */
  flow: string;
  /** Identificador local, gerado no primeiro salvamento. */
  id: string;
  name: string;
  /** '' enquanto o visitante não escolhe. */
  segment: string;
  segmentOther: string;
  service: string;
  /** O visitante escolheu "Definir depois" para o serviço principal. */
  serviceLater: boolean;
  objective: string;
  /** O objetivo foi escolhido pelo visitante (e não só sugerido pelo segmento). */
  objectiveSet: boolean;
  /** Título próprio. '' = sugestão da prévia. */
  headline: string;
  /** Frase de apresentação própria. '' = sugestão da prévia. */
  description: string;
  /** Serviços ou produtos escritos pelo visitante. Vazio = sugestões. */
  services: string[];
  /** Textos ricos da prévia gerados a partir da descrição e validados no navegador. */
  previewCopy: {
    about: string;
    serviceDetails: string[];
    differentials: string[];
    processSteps: string[];
    faqQuestions: string[];
  };
  /**
   * Nome e segmento que a última prévia por descrição preencheu ('' = não foi
   * a IA). Ao gerar de novo, a IA pode trocar o que ela mesma sugeriu, mas
   * nunca o que o visitante digitou ou escolheu.
   */
  aiFilled: { name: string; segment: string; segmentOther: string };
  /** Seções na ordem da página. Apresentação sempre primeiro, contato sempre por último. */
  sections: string[];
  /** O visitante mexeu nas seções: trocar o objetivo não reorganiza mais sozinho. */
  structureEdited: boolean;
  /** Formulário que organiza o pedido e encaminha ao WhatsApp. */
  form: boolean;
  /** Limite de imagens da galeria. */
  gallery: number;
  pkg: PackageId;
  /** Necessidades fora dos pacotes: levam a orçamento personalizado. */
  complex: string[];
  /** Estilo ou cores escolhidos pelo visitante (o segmento não troca mais sozinho). */
  identitySet: boolean;
  direction: string;
  palette: string;
  custom: string | null;
  font: string;
  /** Observações para o atendimento. */
  notes: string;
  step: number;
  lead: Lead;
};

export const emptyLead: Lead = { name: '', channel: 'whatsapp', contact: '', deadline: '', decision: '', marketing: false };

export function initialProject(): Project {
  return {
    version: 4,
    flow: FLOW_VERSION,
    id: '',
    name: '',
    segment: '',
    segmentOther: '',
    service: '',
    serviceLater: false,
    objective: 'orcamento',
    objectiveSet: false,
    headline: '',
    description: '',
    services: [],
    previewCopy: { about: '', serviceDetails: [], differentials: [], processSteps: [], faqQuestions: [] },
    aiFilled: { name: '', segment: '', segmentOther: '' },
    sections: [...objectives[0].structure],
    structureEdited: false,
    form: false,
    gallery: 8,
    pkg: 'essencial',
    complex: [],
    identitySet: false,
    direction: 'marcante',
    palette: 'azul',
    custom: null,
    font: 'auto',
    notes: '',
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
const strings = (x: unknown) => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : []);

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

const sectionById = (id: string) => sections.find((s) => s.id === id);
const MAX_SECTIONS = packages[packages.length - 1].maxSections;

/** Apresentação primeiro, contato por último, sem repetição e dentro do maior pacote. */
function orderSections(list: string[]): string[] {
  const middle = [...new Set(list)].filter((id) => sectionById(id) && !sectionById(id)!.fixed);
  return ['apresentacao', ...middle.slice(0, MAX_SECTIONS - 2), 'contato'];
}

/**
 * Lê qualquer coisa — armazenamento, link — e devolve um projeto válido.
 * O pacote nunca fica abaixo do que as escolhas exigem: preço e escopo
 * andam sempre juntos.
 */
export function normalizeProject(input: unknown): Project {
  const x = record(input);
  const d = initialProject();
  if (x.version !== 4) return d;
  const complex = [...new Set(strings(x.complex).filter((c) => customNeeds.some((n) => n.id === c)))];
  const p: Project = {
    ...d,
    flow: typeof x.flow === 'string' ? cleanText(x.flow, 40) : FLOW_VERSION,
    id: typeof x.id === 'string' && /^bp-[a-z0-9]{8,16}$/.test(x.id) ? x.id : '',
    name: cleanText(x.name, 80),
    segment: pickOrEmpty(x.segment, segments.map((s) => s.id)),
    segmentOther: cleanText(x.segmentOther, 60),
    service: cleanText(x.service, 80),
    serviceLater: x.serviceLater === true,
    objective: pick(x.objective, objectives.map((o) => o.id), d.objective),
    objectiveSet: x.objectiveSet === true,
    headline: cleanText(x.headline, 90),
    description: cleanText(x.description, 200),
    services: strings(x.services).slice(0, 6).map((s) => cleanText(s, 60)),
    previewCopy: {
      about: cleanText(record(x.previewCopy).about, 420),
      serviceDetails: strings(record(x.previewCopy).serviceDetails).slice(0, 3).map((s) => cleanText(s, 160)),
      differentials: strings(record(x.previewCopy).differentials).slice(0, 3).map((s) => cleanText(s, 100)),
      processSteps: strings(record(x.previewCopy).processSteps).slice(0, 3).map((s) => cleanText(s, 80)),
      faqQuestions: strings(record(x.previewCopy).faqQuestions).slice(0, 3).map((s) => cleanText(s, 100)),
    },
    aiFilled: {
      name: cleanText(record(x.aiFilled).name, 80),
      segment: pickOrEmpty(record(x.aiFilled).segment, segments.map((s) => s.id)),
      segmentOther: cleanText(record(x.aiFilled).segmentOther, 60),
    },
    sections: orderSections(Array.isArray(x.sections) ? strings(x.sections) : d.sections),
    structureEdited: x.structureEdited === true,
    form: x.form === true,
    gallery: GALLERY_SIZES.includes(x.gallery as number) ? (x.gallery as number) : 8,
    pkg: pick(x.pkg, packageOrder, d.pkg) as PackageId,
    complex,
    identitySet: x.identitySet === true,
    direction: pick(x.direction, directions.map((s) => s.id), d.direction),
    palette: pick(x.palette, palettes.map((s) => s.id), d.palette),
    custom: typeof x.custom === 'string' && /^#[0-9a-f]{6}$/i.test(x.custom) ? x.custom.toLowerCase() : null,
    font: pick(x.font, ['auto', 'sans', 'serif'], 'auto'),
    notes: cleanText(x.notes, 500),
    step: typeof x.step === 'number' && Number.isInteger(x.step) ? Math.max(0, Math.min(STEP_COUNT - 1, x.step)) : 0,
    lead: normalizeLead(x.lead),
  };
  if (p.serviceLater) p.service = '';
  p.pkg = higher(p.pkg, requiredPackage(p) ?? 'completo');
  return p;
}

/* ── Versões anteriores ──────────────────────────────────────────────────── */

/** Etapas da v3 (Seu negócio, Aparência, Conteúdo, Sua prévia) para as atuais. */
const V3_STEP = [0, 2, 3, 3];
/** Etapas da v2 (seis passos) para as da v3. */
const V2_STEP = [0, 0, 2, 1, 2, 3];

/** Projeto da versão 3: objetivos, seções e recursos passam para o modelo de pacotes. */
export function fromV3(input: unknown): Project {
  const x = record(input);
  if (x.version !== 3) return initialProject();
  const features = strings(x.features);
  const objective = ({ agenda: 'agendamento', localizacao: 'empresa' } as Record<string, string>)[x.objective as string] ?? x.objective;
  const list = strings(x.sections).map((s) => (s === 'localizacao' ? 'atendimento' : s));
  if (features.includes('catalogo')) list.push('vitrine');
  const complex = strings(x.complex).map((c) => (c === 'reservas' ? 'agenda' : c));
  if (features.includes('paginaExtra')) complex.push('paginas');
  if (features.includes('agendamento')) complex.push('agenda');
  const step = typeof x.step === 'number' && Number.isInteger(x.step) ? V3_STEP[Math.max(0, Math.min(3, x.step))] : 0;
  return normalizeProject({
    ...x,
    version: 4,
    objective,
    objectiveSet: true,
    services: [],
    sections: list.length ? list : undefined,
    structureEdited: true,
    identitySet: true,
    form: features.includes('formularioWhatsapp') || features.includes('formularioEmail'),
    complex,
    step,
  });
}

/** Projeto salvo pela versão de seis etapas (v2). */
export function fromV2(input: unknown): Project {
  const x = record(input);
  if (x.version !== 2) return initialProject();
  const step = typeof x.step === 'number' && Number.isInteger(x.step) ? V2_STEP[Math.max(0, Math.min(5, x.step))] : 0;
  return fromV3({ ...x, version: 3, step, complex: [] });
}

/** Seleção do configurador original (v1), antes das etapas guiadas. */
export function migrateLegacy(input: unknown): Project {
  const x = record(record(input).selection);
  if (!Object.keys(x).length) return initialProject();
  const features = strings(x.features);
  const sectionOf: Record<string, string> = { galeria: 'galeria', depoimentos: 'depoimentos', faq: 'faq', mapa: 'localizacao' };
  return fromV3({
    version: 3,
    flow: 'configurador-v1',
    name: x.company,
    objective: 'orcamento',
    palette: x.color,
    custom: record(x.customColor).accent,
    features,
    sections: ['apresentacao', 'servicos', 'sobre', ...features.filter((f) => sectionOf[f]).map((f) => sectionOf[f]), 'contato'],
    lead: { name: x.name },
  });
}

/** Lê o que houver salvo, da versão mais nova para a mais antiga. */
export function readStored(get: (key: string) => string | null): { project: Project; source: 'v4' | 'v3' | 'v2' | 'v1' } | null {
  const v4 = get(KEY);
  if (v4) return { project: normalizeProject(JSON.parse(v4)), source: 'v4' };
  const v3 = get(LEGACY_KEYS.v3);
  if (v3) return { project: fromV3(JSON.parse(v3)), source: 'v3' };
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

/* ── Pacotes e preço ─────────────────────────────────────────────────────── */

/**
 * O pacote mínimo que comporta as escolhas — ou null quando nada comporta
 * (mais seções do que o maior pacote permite).
 */
export function requiredPackage(p: Pick<Project, 'sections' | 'form' | 'gallery'>): PackageId | null {
  let need: PackageId = 'essencial';
  for (const id of p.sections) need = higher(need, sectionById(id)?.min ?? 'essencial');
  if (p.form) need = higher(need, packages.find((x) => x.form)!.id);
  if (p.sections.includes('galeria')) need = higher(need, packages.find((x) => x.galleryImages >= p.gallery)?.id ?? 'completo');
  const bySize = packages.find((x) => x.maxSections >= p.sections.length);
  if (!bySize) return null;
  return higher(need, bySize.id);
}

export function currentPackage(p: Project): Package {
  return packageById(p.pkg);
}

/** O projeto tem alguma necessidade fora dos pacotes? */
export function isCustom(p: Project): boolean {
  return p.complex.length > 0;
}

/** Valor do desenvolvimento, ou null quando o projeto é personalizado. */
export function priceOf(p: Project): number | null {
  return isCustom(p) ? null : currentPackage(p).price;
}

/** Texto do preço, igual em toda parte. */
export function investmentLabel(p: Project): string {
  const price = priceOf(p);
  return price === null ? 'Orçamento personalizado' : brl(price);
}

/** "Disponível no Profissional — R$ 750 no total." */
export function packageOffer(id: PackageId): string {
  const pkg = packageById(id);
  return `Disponível no ${pkg.name} — ${brl(pkg.price)} no total.`;
}

export type PackageCheck =
  | { kind: 'ok'; project: Project }
  | { kind: 'upgrade'; to: PackageId; project: Project }
  | { kind: 'custom' };

/**
 * Antes de aplicar uma mudança de escopo: cabe no pacote atual? Se não
 * couber, diz qual pacote comporta — e a mudança só é aplicada depois que
 * o visitante escolher. Nunca troca o pacote sozinho.
 */
export function checkChange(current: Project, patch: Partial<Project>): PackageCheck {
  const list = patch.sections ? [...new Set(patch.sections)] : current.sections;
  const draft = { ...current, ...patch, sections: list };
  const need = requiredPackage(draft);
  if (!need) return { kind: 'custom' };
  if (rank(need) <= rank(current.pkg)) return { kind: 'ok', project: normalizeProject(draft) };
  return { kind: 'upgrade', to: need, project: normalizeProject({ ...draft, pkg: need }) };
}

/**
 * Troca de pacote escolhida pelo visitante. Para um pacote menor, lista o
 * que sai (seções e recursos que ele não comporta) antes de aplicar.
 */
export function switchPackage(p: Project, to: PackageId): { project: Project; removed: string[] } {
  const target = packageById(to);
  const removed: string[] = [];
  let list = p.sections.filter((id) => {
    const keep = rank(sectionById(id)!.min) <= rank(to);
    if (!keep) removed.push(sectionName(p, id));
    return keep;
  });
  const optional = list.filter((id) => !sectionById(id)!.fixed);
  const room = target.maxSections - 2;
  if (optional.length > room) {
    const drop = optional.slice(room);
    drop.forEach((id) => removed.push(sectionName(p, id)));
    list = list.filter((id) => !drop.includes(id));
  }
  const form = p.form && target.form;
  if (p.form && !form) removed.push('Formulário para WhatsApp');
  const gallery = Math.min(p.gallery, Math.max(8, target.galleryImages));
  if (list.includes('galeria') && gallery < p.gallery) removed.push(`Galeria acima de ${gallery} imagens`);
  return { project: normalizeProject({ ...p, pkg: to, sections: list, form, gallery }), removed };
}

/** Pacote recomendado e o motivo, em linguagem simples. */
export function recommendation(p: Project): { pkg: PackageId; reason: string } {
  const need = requiredPackage(p) ?? 'completo';
  const obj = objectiveOf(p);
  if (obj.recommend && rank(obj.recommend.pkg) > rank(need)) return obj.recommend;
  if (need === 'essencial') return { pkg: need, reason: 'As seções escolhidas cabem no Essencial.' };
  return { pkg: need, reason: `As seções e recursos escolhidos pedem o ${packageById(need).name}.` };
}

/* ── Objetivo e estrutura ────────────────────────────────────────────────── */

export function objectiveOf(p: Pick<Project, 'objective'>): Objective {
  return objectives.find((o) => o.id === p.objective) ?? objectives[0];
}

export function segmentOf(p: Pick<Project, 'segment'>): Segment {
  return segments.find((s) => s.id === p.segment) ?? segments[segments.length - 1];
}

/**
 * Troca o objetivo. Sem ajustes próprios nas seções, a estrutura segue o
 * objetivo (mantendo as seções do pacote que já estavam escolhidas). Com
 * ajustes, só o botão e o caminho de contato mudam.
 */
export function withObjective(p: Project, id: string, { chosen = true } = {}): Project {
  const obj = objectives.find((o) => o.id === id) ?? objectives[0];
  if (p.structureEdited) return normalizeProject({ ...p, objective: obj.id, objectiveSet: chosen || p.objectiveSet });
  const kept = p.sections.filter((s) => rank(sectionById(s)!.min) > 0 && !obj.structure.includes(s));
  const list = [...obj.structure.slice(0, -1), ...kept, 'contato'];
  const fits = requiredPackage({ ...p, sections: list });
  return normalizeProject({
    ...p,
    objective: obj.id,
    objectiveSet: chosen || p.objectiveSet,
    sections: fits && rank(fits) <= rank(p.pkg) ? list : obj.structure,
  });
}

/**
 * Textos de apoio gerados pela IA descrevem o negócio e os serviços daquele
 * momento. Quando a pessoa troca o segmento ou o serviço principal, todos
 * saem (a prévia volta aos textos de exemplo do segmento); quando edita um
 * serviço da lista, sai só a descrição daquele serviço.
 */
export function dropStaleCopy(prev: Project, next: Project): Project {
  const copy = next.previewCopy;
  const empty = !copy.about && ![copy.serviceDetails, copy.differentials, copy.processSteps, copy.faqQuestions].some((l) => l.length);
  if (empty) return next;
  const mainService = (x: Project) => (x.serviceLater ? '' : x.service.trim().toLowerCase());
  if (next.segment !== prev.segment || mainService(next) !== mainService(prev)) {
    return { ...next, previewCopy: { about: '', serviceDetails: [], differentials: [], processSteps: [], faqQuestions: [] } };
  }
  const changed = (i: number) => (next.services[i] ?? '').trim() !== (prev.services[i] ?? '').trim();
  if (!copy.serviceDetails.some((_, i) => changed(i))) return next;
  return { ...next, previewCopy: { ...copy, serviceDetails: copy.serviceDetails.map((d, i) => (changed(i) ? '' : d)) } };
}

/** Nome da seção conforme o objetivo ("Serviços", "Produtos em destaque"...). */
export function sectionName(p: Pick<Project, 'objective'>, id: string): string {
  if (id === 'servicos') return p.objective === 'produtos' ? 'Produtos em destaque' : p.objective === 'trabalhos' ? 'Trabalhos em destaque' : 'Serviços';
  return sectionById(id)?.name ?? id;
}

export function selectedSections(p: Project): string[] {
  return p.sections.map((id) => sectionName(p, id));
}

/** Recursos além das seções. */
export function selectedResources(p: Project): string[] {
  const list = ['Botão de WhatsApp', 'Links para as redes sociais'];
  if (p.form) list.push('Formulário que encaminha o pedido ao WhatsApp');
  if (p.sections.includes('galeria')) list.push(`Galeria com até ${p.gallery} imagens suas`);
  if (p.sections.includes('vitrine')) list.push(`Vitrine com até ${currentPackage(p).showcaseItems} itens`);
  return list;
}

/** Move uma seção opcional uma posição para cima (-1) ou para baixo (+1). */
export function moveSection(p: Project, id: string, dir: -1 | 1): Project {
  const middle = p.sections.slice(1, -1);
  const i = middle.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= middle.length) return p;
  [middle[i], middle[j]] = [middle[j], middle[i]];
  return normalizeProject({ ...p, sections: ['apresentacao', ...middle, 'contato'], structureEdited: true });
}

/* ── Conteúdo sugerido ───────────────────────────────────────────────────── */

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function ruleFor(p: Project) {
  const text = `${p.serviceLater ? '' : p.service} ${p.segment === 'outro' ? p.segmentOther : ''}`;
  return text.trim() ? keywordRules.find((r) => r.match.test(text)) : undefined;
}

const titleTemplates: Record<string, (s: string) => string> = {
  orcamento: (s) => `${s} com orçamento pelo WhatsApp.`,
  agendamento: (s) => `${s} com hora marcada.`,
  empresa: (s) => `${s}: conheça nosso trabalho.`,
  servicos: (s) => `${s} e outros serviços para você.`,
  produtos: (s) => `${s} para pedir pelo WhatsApp.`,
  trabalhos: (s) => `${s}: veja nossos trabalhos.`,
};

const introTemplates: Record<string, string> = {
  orcamento: 'Conte o que você precisa e peça seu orçamento pelo WhatsApp.',
  agendamento: 'Escolha o serviço e peça seu horário pelo WhatsApp.',
  servicos: 'Conheça os serviços e fale com a gente pelo WhatsApp.',
  produtos: 'Veja os produtos e faça seu pedido pelo WhatsApp.',
  trabalhos: 'Veja alguns trabalhos e conte o que você imagina.',
};

/** Serviços sugeridos: o principal primeiro, depois os do segmento ou da palavra-chave. */
export function suggestedServices(p: Project): string[] {
  const main = p.serviceLater ? '' : p.service.trim();
  const base = ruleFor(p)?.services ?? segmentOf(p).services;
  const list = [...(main ? [cap(main)] : []), ...base];
  return [...new Map(list.map((s) => [s.toLowerCase(), s])).values()].slice(0, 3);
}

export type SiteContent = {
  name: string;
  segmentName: string;
  title: string;
  titleSuggested: boolean;
  intro: string;
  introSuggested: boolean;
  cta: string;
  services: string[];
  servicesSuggested: boolean;
  /** Nome da ilustração em public/demo (sem extensão). */
  image: string;
  previewCopy: Project['previewCopy'];
};

/** Tudo o que a prévia mostra, derivado das respostas. Sugestões são marcadas como tal. */
export function siteContent(p: Project): SiteContent {
  const seg = segmentOf(p);
  const obj = objectiveOf(p);
  const main = p.serviceLater ? '' : p.service.trim();
  const own = p.services.map((s) => s.trim()).filter(Boolean);
  return {
    name: p.name.trim() || seg.demo,
    segmentName: p.segment === 'outro' && p.segmentOther.trim() ? cap(p.segmentOther.trim()) : seg.name,
    title: p.headline.trim() || (main ? titleTemplates[obj.id](cap(main)) : seg.title),
    titleSuggested: !p.headline.trim(),
    intro: p.description.trim() || (main && introTemplates[obj.id]) || seg.intro,
    introSuggested: !p.description.trim(),
    cta: obj.cta,
    services: own.length ? own : suggestedServices(p),
    servicesSuggested: !own.length,
    image: ruleFor(p)?.image ?? seg.image,
    previewCopy: p.previewCopy,
  };
}

/** Exemplo demonstrativo por segmento, usado na apresentação e como ponto de partida. */
export function exampleProject(id: string): Project {
  const seg = segments.find((s) => s.id === id) ?? segments[0];
  const extras: Record<string, Partial<Project>> = {
    local: {},
    imoveis: { pkg: 'profissional', sections: ['apresentacao', 'servicos', 'galeria', 'processo', 'sobre', 'faq', 'contato'] },
    beleza: { pkg: 'profissional', sections: ['apresentacao', 'servicos', 'atendimento', 'galeria', 'sobre', 'faq', 'contato'] },
    consultoria: { pkg: 'profissional', form: true, sections: ['apresentacao', 'servicos', 'diferenciais', 'processo', 'sobre', 'faq', 'contato'] },
    alimentacao: { pkg: 'completo', sections: ['apresentacao', 'vitrine', 'sobre', 'galeria', 'atendimento', 'faq', 'contato'] },
    criativo: { pkg: 'profissional', sections: ['apresentacao', 'galeria', 'servicos', 'processo', 'sobre', 'contato'] },
    outro: {},
  };
  const base = withObjective({ ...initialProject(), segment: seg.id }, seg.objectives[0], { chosen: false });
  return normalizeProject({
    ...base,
    direction: seg.styles[0],
    palette: seg.palette,
    ...extras[seg.id],
    structureEdited: Boolean(extras[seg.id]?.sections),
    identitySet: true,
  });
}

/** Campos que mudam a estrutura, a identidade ou o preço. */
const CHOICE_FIELDS = ['segment', 'objective', 'sections', 'direction', 'palette', 'custom', 'pkg', 'form'] as const;

/** Lista legível do que mudaria se `next` substituísse `current`. */
export function choiceChanges(current: Project, next: Project): string[] {
  const labels: Record<(typeof CHOICE_FIELDS)[number], string> = {
    segment: 'segmento', objective: 'objetivo', sections: 'seções', direction: 'estilo',
    palette: 'cores', custom: 'cores', pkg: 'pacote', form: 'recursos',
  };
  const changed = CHOICE_FIELDS.filter((f) => JSON.stringify(current[f]) !== JSON.stringify(next[f])).map((f) => labels[f]);
  return [...new Set(changed)];
}

/** O visitante já fez escolhas próprias (além do ponto de partida)? */
export function hasOwnChoices(p: Project): boolean {
  return p.objectiveSet || p.structureEdited || p.identitySet || choiceChanges(initialProject(), p).some((c) => c !== 'segmento' && c !== 'seções');
}

/** Mantém o que o visitante digitou e troca só as escolhas estruturais. */
export function mergeStartingPoint(current: Project, base: Project): Project {
  return normalizeProject({
    ...base,
    id: current.id,
    name: current.name,
    service: current.service,
    serviceLater: current.serviceLater,
    headline: current.headline,
    description: current.description,
    services: current.services,
    segmentOther: base.segment === 'outro' ? current.segmentOther : '',
    complex: current.complex,
    notes: current.notes,
    lead: current.lead,
    step: current.step,
  });
}

/* ── Compartilhamento ────────────────────────────────────────────────────── */

/**
 * Link com as opções de layout. Não leva nome, textos, serviços, logo,
 * observações nem dados de contato — por isso o rótulo diz
 * "Compartilhar opções de layout".
 */
export function shareLink(p: Project): string {
  const n = normalizeProject(p);
  const safe = {
    version: 4,
    segment: n.segment,
    objective: n.objective,
    objectiveSet: n.objectiveSet,
    sections: n.sections,
    structureEdited: n.structureEdited,
    form: n.form,
    gallery: n.gallery,
    pkg: n.pkg,
    complex: n.complex,
    identitySet: n.identitySet,
    direction: n.direction,
    palette: n.palette,
    custom: n.custom,
    font: n.font,
    step: STEP_COUNT - 1,
  };
  return `${contact.siteUrl}/criar/#projeto=${encodeURIComponent(JSON.stringify(safe))}`;
}

const privateless = {
  name: '', description: '', headline: '', service: '', services: [], segmentOther: '', notes: '', lead: emptyLead, id: '',
};

/** Lê links da versão atual e das anteriores. Lança erro se o link não for válido. */
export function fromShare(hash: string): Project | null {
  if (!hash.startsWith('#projeto=')) return null;
  if (hash.length > 6000) throw Error('Link muito longo');
  const data = record(JSON.parse(decodeURIComponent(hash.slice(9))));
  if (data.version === 4) return normalizeProject({ ...data, ...privateless });
  if (data.version === 3) return fromV3({ ...data, ...privateless });
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
  if (!p.segment) return 'A informar';
  const s = segmentOf(p);
  return p.segment === 'outro' && p.segmentOther.trim() ? `Outro: ${p.segmentOther.trim()}` : s.name;
}

export function styleLabel(p: Project): string {
  const dir = directions.find((d) => d.id === p.direction)!.name;
  const color = p.custom ? `cor da marca ${p.custom}` : `cores ${palettes.find((x) => x.id === p.palette)!.name}`;
  return `${dir} · ${color}`;
}

export function serviceLabel(p: Project): string {
  return p.serviceLater || !p.service.trim() ? 'A definir' : p.service.trim();
}

export function customNeedNames(p: Project): string[] {
  return customNeeds.filter((n) => p.complex.includes(n.id)).map((n) => n.name);
}

export const nextStepText =
  'Na conversa, confirmamos o escopo, os materiais e o prazo por escrito. Nada é contratado ou publicado sem a sua aprovação.';

/** Prazo do pacote, com o início da contagem. */
export function deadlineText(p: Project): string {
  if (isCustom(p)) return 'Definido com o orçamento personalizado';
  return `${currentPackage(p).deadline}, ${priceNotes.deadlineStart}`;
}

/**
 * Mensagem do WhatsApp: tudo o que foi escolhido, para o atendimento não
 * precisar perguntar de novo. Usa as mesmas funções da página e do PDF.
 */
export function projectMessage(p: Project, origin?: string, opts: { logo?: boolean } = {}): string {
  const pkg = currentPackage(p);
  const custom = isCustom(p);
  const lines: string[] = [custom ? contact.whatsappPersonalizado : contact.whatsappIntro, ''];

  lines.push(`Empresa: ${p.name.trim() || 'a informar'}`);
  lines.push(`Segmento: ${segmentLabel(p)}`);
  lines.push(`Objetivo: ${objectiveOf(p).name}`);
  lines.push(`Serviço ou produto principal: ${serviceLabel(p)}`);
  lines.push(`Estilo e cores: ${styleLabel(p)}`);
  lines.push(`Logo: ${opts.logo ? 'tenho e envio por aqui' : 'usar o nome da empresa por enquanto'}`);

  lines.push('');
  if (custom) {
    lines.push('Pacote: projeto personalizado (orçamento separado)');
    lines.push(`Preciso de: ${customNeedNames(p).join('; ')}`);
    lines.push(`Pacote de referência na prévia: ${pkg.name} (${brl(pkg.price)})`);
  } else {
    lines.push(`Pacote: ${pkg.name}`);
    lines.push(`Valor do desenvolvimento: ${brl(pkg.price)} — ${priceNotes.payment}`);
  }
  lines.push(`Seções (${p.sections.length} de até ${pkg.maxSections}): ${selectedSections(p).join(', ')}`);
  lines.push(`Recursos: ${selectedResources(p).join('; ')}`);
  lines.push(`Prazo: ${deadlineText(p)}`);
  lines.push(`Ajustes: ${revisionRounds} rodadas antes da publicação`);

  if (p.notes.trim()) lines.push('', `Observações: ${p.notes.trim()}`);

  const lead = p.lead;
  const quando = desiredDeadlines.find((d) => d.id === lead.deadline);
  const decisao = decisionRoles.find((d) => d.id === lead.decision);
  if (lead.name.trim() || quando || decisao) {
    lines.push('');
    if (lead.name.trim()) lines.push(`Meu nome: ${lead.name.trim()}`);
    if (quando) lines.push(`Quando quero começar: ${quando.name}`);
    if (decisao) lines.push(`Decisão: ${decisao.name}`);
  }

  lines.push('', `Opções de layout (o link não leva nome nem textos): ${shareLink(p)}`);
  if (p.id || origin) lines.push(`Ref.: ${[p.id, origin].filter(Boolean).join(' · ')}`);
  return lines.join('\n');
}

/** Mensagem curta para tirar dúvidas no meio do fluxo, sem dados pessoais. */
export function helpMessage(p: Project): string {
  return `Olá! Estou criando a prévia do meu site (etapa: ${steps[p.step]}) e fiquei com uma dúvida.`;
}
