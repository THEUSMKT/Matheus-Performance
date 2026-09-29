/* ==========================================================================
   Plano da prévia: a única seleção visual do projeto.

   A partir do projeto validado (normalizeProject), decide a família, a
   variante, o topo (com imagem ou tipográfico), as imagens do catálogo, a
   fonte, os títulos das seções e as ações. Miniaturas, exemplo aberto,
   prévia do celular e do computador, editor e resumo usam este mesmo
   cálculo — não há versões desenhadas à parte que possam divergir.

   Prioridades: escolha explícita da pessoa > coerência com o negócio e o
   objetivo > recursos do pacote (as seções já vêm validadas) > qualidade
   (sem imagem adequada, topo tipográfico) > padrão seguro do catálogo.
   ========================================================================== */
import { assetsIn, type Asset } from '../config/assets';
import type { Family, LayoutVariant } from '../config/families';
import type { Subsegment } from '../config/subsegments';
import {
  contrastInk,
  displayName,
  familyOf,
  headFont,
  objectiveOf,
  palettes,
  previewTexts,
  siteContent,
  subsegmentOf,
  typographyOf,
  unrecognizedService,
  variantOf,
  type DisplayName,
  type Project,
  type SiteContent,
} from './project';

export type PreviewPlan = {
  family: Family;
  variant: LayoutVariant;
  subsegment: Subsegment;
  /** Topo com imagem ou composição tipográfica. */
  hero: 'imagem' | 'tipografico';
  heroAsset: Asset | null;
  /** Outras imagens permitidas, sem repetir a do topo. */
  pool: Asset[];
  /** Imagens de produtos e objetos (destaques e vitrine). */
  items: Asset[];
  /** Imagens para a galeria: ambientes primeiro, sem repetir as da vitrine nem a do topo. */
  gallery: Asset[];
  /** Imagem de apoio da apresentação (só sem galeria, para não repetir). */
  aside: Asset | null;
  typography: string;
  headStack: string;
  name: DisplayName;
  content: SiteContent;
  texts: Project['previewCopy'];
  /** Ação principal (o mesmo texto no menu, no topo e no contato). */
  cta: string;
  /** Segunda ação, só quando faz outra coisa (ir para uma seção ou abrir a conversa). */
  secondary: string | null;
  /** O botão principal leva a uma seção (ver serviços, produtos...) e não à conversa. */
  ctaNavigates: boolean;
  contactTitle: string;
  contactNote: string;
  /** Seções do meio, na ordem escolhida (já dentro do pacote). */
  sections: string[];
  titles: Record<string, string>;
  /** Serviços apresentados como produtos (com imagem). */
  showcase: boolean;
  accent: string;
  soft: string;
  on: string;
};

const NAVIGATION = new Set(['servicos', 'produtos', 'trabalhos']);

/** Nome curto do conteúdo principal, para "Ver …". */
function contentNoun(p: Project, fam: Family, sub: Subsegment): string {
  if (p.objective === 'produtos') return sub.family === 'alimentacao' ? (sub.id === 'restaurante' || sub.id === 'marmitas' ? 'cardápio' : 'opções') : 'produtos';
  if (p.objective === 'trabalhos') return fam.id === 'imobiliario' ? 'imóveis' : fam.id === 'portfolio' ? 'projetos' : 'trabalhos';
  const bySub: Record<string, string> = {
    'clinica-veterinaria': 'atendimentos',
    'banho-e-tosa': 'cuidados',
    'pet-shop': 'produtos',
    restaurante: 'cardápio',
    marmitas: 'cardápio',
    confeitaria: 'opções',
    buffet: 'opções de buffet',
    corretor: 'como posso ajudar',
    barbearia: 'serviços',
  };
  const byFamily: Record<string, string> = { beleza: 'cuidados', consultoria: 'áreas de atuação', alimentacao: 'opções', imobiliario: 'como ajudamos' };
  return bySub[sub.id] ?? byFamily[fam.id] ?? 'serviços';
}

/** Títulos das seções: do tipo de negócio, depois da família, depois os padrões. */
function sectionTitles(p: Project, fam: Family, sub: Subsegment, name: DisplayName): Record<string, string> {
  const own = !name.provisional;
  const services: Record<string, string> = {
    'clinica-veterinaria': 'Atendimentos',
    'banho-e-tosa': 'Cuidados',
    'pet-shop': 'Produtos',
    confeitaria: 'Para encomendar',
    buffet: 'Para o seu evento',
    marmitas: 'Cardápio da semana',
    padaria: 'Do nosso forno',
    restaurante: 'Destaques da casa',
    corretor: 'Como posso ajudar',
    imobiliaria: 'Como ajudamos',
    barbearia: 'Serviços',
    juridico: 'Áreas de atuação',
  };
  const servicesByFamily: Record<string, string> = { local: p.objective === 'orcamento' ? 'O que fazemos' : 'Serviços', beleza: 'Cuidados', consultoria: 'Áreas de atuação', alimentacao: 'Destaques', portfolio: 'Serviços', imobiliario: 'Como ajudamos', pet: 'Serviços', institucional: 'Serviços' };
  const servicesTitle =
    p.objective === 'produtos' && fam.id !== 'alimentacao' ? 'Produtos em destaque' : p.objective === 'trabalhos' && fam.id !== 'portfolio' ? 'Trabalhos em destaque' : services[sub.id] ?? servicesByFamily[fam.id];
  const process: Record<string, string> = {
    consultoria: 'Etapas do atendimento',
    portfolio: 'Como trabalhamos',
    imobiliario: 'Como funciona a busca',
  };
  const processTitle =
    process[fam.id] ??
    (p.objective === 'orcamento'
      ? 'Como pedir seu orçamento'
      : p.objective === 'agendamento'
        ? sub.id === 'clinica-veterinaria' ? 'Como funciona a consulta' : 'Como pedir seu horário'
        : p.objective === 'produtos'
          ? sub.id === 'confeitaria' ? 'Como encomendar' : 'Como fazer seu pedido'
          : 'Como funciona');
  const about = fam.id === 'imobiliario' || fam.id === 'consultoria' ? 'Apresentação' : own ? `Sobre ${name.text}` : 'Sobre nós';
  const diff = fam.id === 'beleza' ? 'Nosso jeito de cuidar' : fam.id === 'pet' ? 'Nosso cuidado' : own ? `Por que escolher ${name.text}` : 'Por que escolher a gente';
  const showcase: Record<string, string> = { imobiliario: 'Imóveis em destaque', alimentacao: sub.id === 'confeitaria' ? 'Encomendas' : 'Cardápio', pet: 'Produtos' };
  const gallery = fam.id === 'portfolio' ? 'Galeria de projetos' : fam.id === 'imobiliario' ? 'Fotos' : 'Galeria';
  return {
    servicos: servicesTitle,
    sobre: about,
    diferenciais: diff,
    atendimento: fam.id === 'beleza' ? 'Horários e atendimento' : 'Atendimento',
    processo: processTitle,
    galeria: gallery,
    faq: 'Perguntas frequentes',
    depoimentos: 'Depoimentos',
    vitrine: showcase[fam.id] ?? (p.objective === 'produtos' ? 'Vitrine' : 'Escolha o seu'),
  };
}

export function previewPlan(p: Project, { demo = false } = {}): PreviewPlan {
  const sub = subsegmentOf(p);
  const family = familyOf(p);
  const variant = variantOf(p);
  const content = siteContent(p, { demo });
  const name = displayName(p, { demo });
  // Categoria sugerida (IA ou pessoa) só vale se for permitida para o tipo de negócio.
  const categories = unrecognizedService(p) ? [] : p.imagery && sub.assets.includes(p.imagery) ? [p.imagery, ...sub.assets.filter((c) => c !== p.imagery)] : sub.assets;
  const all = assetsIn(categories, sub.id);
  const heroAsset = p.hero === 'tipografico' ? null : (all[0] ?? null);
  const pool = all.filter((x) => x !== heroAsset);
  const middleIds = p.sections.filter((id) => id !== 'apresentacao' && id !== 'contato');
  const showcase = p.objective === 'produtos' || (p.objective === 'trabalhos' && familyOf(p).id !== 'portfolio');
  const items = pool.filter((x) => x.role === 'item');
  // O que a vitrine ou os destaques já mostram não volta na galeria.
  const shownItems = new Set([...(middleIds.includes('vitrine') ? items.slice(0, 6) : []), ...(showcase && middleIds.includes('servicos') ? items.slice(0, 3) : [])]);
  const scenes = pool.filter((x) => x.role === 'cena');
  // Primeiro o que ainda não apareceu; com pouca coisa, completa com as imagens já mostradas. A do topo só volta se sobraria uma imagem sozinha.
  let gallery = [...scenes, ...items.filter((x) => !shownItems.has(x))];
  if (gallery.length < 3) gallery = [...gallery, ...items.filter((x) => shownItems.has(x))];
  if (gallery.length === 1 && heroAsset) gallery = [...gallery, heroAsset];
  // Grade sem buracos: portfólio 1 grande + 4; demais, 6 ou 3.
  const wanted = familyOf(p).id === 'portfolio' ? 5 : gallery.length >= 6 ? 6 : 3;
  gallery = gallery.slice(0, Math.min(wanted, gallery.length));
  const aside = middleIds.includes('galeria') ? null : (scenes.find((x) => !shownItems.has(x)) ?? null);
  const typography = typographyOf(p.font, p.direction, family.typography);
  const palette = palettes.find((x) => x.id === p.palette) ?? palettes[0];
  const accent = p.custom ?? palette.accent;
  const obj = objectiveOf(p);
  const cta = content.cta;
  const ctaNavigates = NAVIGATION.has(p.objective) && /^ver\b/i.test(cta);
  const middle = p.sections.filter((id) => id !== 'apresentacao' && id !== 'contato');
  const hasContent = middle.includes('servicos') || middle.includes('vitrine') || middle.includes('galeria');
  const noun = contentNoun(p, family, sub);
  const secondary = ctaNavigates ? 'Falar pelo WhatsApp' : hasContent ? `Ver ${noun}` : null;
  // Título do contato: do tipo de negócio e da família antes do genérico do objetivo.
  const contactBySub: Record<string, string> = {
    confeitaria: 'Faça sua encomenda',
    buffet: 'Peça o orçamento do seu evento',
    'clinica-veterinaria': p.objective === 'agendamento' ? 'Agende a consulta do seu pet' : 'Fale com a clínica',
    'banho-e-tosa': 'Agende o banho e tosa',
    aulas: p.objective === 'agendamento' ? 'Agende sua aula experimental' : 'Fale com a escola',
    academia: p.objective === 'agendamento' ? 'Agende sua aula experimental' : 'Fale com o estúdio',
  };
  const contactByFamily: Record<string, string> = {
    consultoria: 'Vamos conversar sobre o seu contexto?',
    imobiliario: 'Vamos conversar sobre a sua busca?',
    portfolio: 'Vamos conversar sobre o seu projeto?',
  };
  const contactTitle =
    contactBySub[sub.id] ??
    contactByFamily[family.id] ??
    { orcamento: 'Peça seu orçamento', agendamento: 'Peça seu horário', produtos: 'Faça seu pedido' }[p.objective] ??
    'Vamos conversar?';
  return {
    family,
    variant,
    subsegment: sub,
    hero: heroAsset ? 'imagem' : 'tipografico',
    heroAsset,
    pool,
    items,
    gallery,
    aside,
    typography,
    headStack: headFont(p.font, p.direction, family.typography),
    name,
    content,
    texts: previewTexts(p),
    cta,
    secondary,
    ctaNavigates,
    contactTitle,
    contactNote: `${obj.contactPath}.`,
    sections: middle,
    titles: sectionTitles(p, family, sub, name),
    showcase,
    accent,
    soft: p.custom ? '' : palette.bg,
    on: contrastInk(accent),
  };
}
