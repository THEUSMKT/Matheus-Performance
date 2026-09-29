/* ==========================================================================
   Famílias visuais das prévias — EDITE AQUI
   Cada família é uma composição própria (topo, apresentação dos serviços,
   ritmo das seções, comportamento no celular), montada só com componentes
   testados em SitePreview. A IA escolhe a família e a variante por id; a
   página valida e, sem escolha válida, usa a família do subsegmento.

   Os "estilos" (Moderno, Elegante...) continuam existindo: eles mudam tons,
   formas e a fonte dos títulos. A família muda a organização da página.
   Recursos de pacote (galeria, perguntas, vitrine, formulário) só aparecem
   quando o pacote os inclui — a qualidade visual é a mesma em todos.
   ========================================================================== */
import type { PackageId } from './packages';

export type FamilyId = 'local' | 'beleza' | 'consultoria' | 'alimentacao' | 'portfolio' | 'imobiliario' | 'pet' | 'institucional';

export type LayoutVariant = {
  id: string;
  name: string;
  /** Uma frase: o que muda na primeira dobra. */
  description: string;
};

/** Como os serviços (ou produtos) aparecem. */
export type ServiceLayout = 'lista' | 'menu' | 'colunas' | 'produtos' | 'indice' | 'icones' | 'cartoes';

export type Family = {
  id: FamilyId;
  name: string;
  /** Direção em duas palavras ("Clareza e ação"). */
  concept: string;
  description: string;
  /** Segmentos em que a família é a composição natural. */
  segments: string[];
  /** Objetivos que a composição atende bem (todos funcionam; estes são os de origem). */
  objectives: string[];
  /** Duas composições da primeira dobra; a primeira é a padrão. */
  variants: [LayoutVariant, LayoutVariant];
  /** Fonte dos títulos quando a pessoa deixa "Sugerida pelo estilo". */
  typography: 'serif' | 'sans' | 'forte' | 'geometrica';
  /** Paletas recomendadas (todas com contraste AA para texto branco no botão). */
  palettes: string[];
  services: ServiceLayout;
  /** Seções sugeridas por pacote (sem apresentação e contato), dentro dos limites de cada um. */
  structure: Record<PackageId, string[]>;
};

export const families: Family[] = [
  {
    id: 'local',
    name: 'Serviços locais',
    concept: 'Clareza e ação',
    description: 'Oferta compreensível logo no topo, serviços fáceis de comparar e um pedido de orçamento simples.',
    segments: ['local'],
    objectives: ['orcamento', 'servicos', 'agendamento'],
    variants: [
      { id: 'oferta', name: 'Oferta direta', description: 'Título, botão e lista de serviços logo no topo, com a imagem ao lado.' },
      { id: 'faixa', name: 'Imagem em faixa', description: 'Faixa de imagem no topo e a oferta num cartão logo abaixo.' },
    ],
    typography: 'sans',
    palettes: ['azul', 'petroleo', 'grafite', 'verde'],
    services: 'lista',
    structure: {
      essencial: ['servicos', 'processo', 'diferenciais'],
      profissional: ['servicos', 'processo', 'diferenciais', 'galeria', 'faq'],
      completo: ['servicos', 'processo', 'diferenciais', 'galeria', 'faq', 'atendimento'],
    },
  },
  {
    id: 'beleza',
    name: 'Beleza e estética',
    concept: 'Editorial e acolhedora',
    description: 'Imagem com protagonismo, títulos expressivos e serviços apresentados como um cardápio de cuidados.',
    segments: ['beleza'],
    objectives: ['agendamento', 'servicos', 'trabalhos'],
    variants: [
      { id: 'editorial', name: 'Capa editorial', description: 'Imagem de ponta a ponta com o título sobre ela, como uma capa de revista.' },
      { id: 'retrato', name: 'Retrato em arco', description: 'Imagem vertical em arco ao lado de um título grande.' },
    ],
    typography: 'serif',
    palettes: ['terracota', 'verde', 'vinho', 'grafite', 'roxo'],
    services: 'menu',
    structure: {
      essencial: ['servicos', 'sobre', 'atendimento'],
      profissional: ['servicos', 'galeria', 'sobre', 'atendimento', 'faq'],
      completo: ['servicos', 'galeria', 'sobre', 'atendimento', 'faq', 'depoimentos'],
    },
  },
  {
    id: 'consultoria',
    name: 'Consultoria',
    concept: 'Autoridade e clareza',
    description: 'Proposta de valor em destaque, áreas de atuação numeradas e as etapas do atendimento em linha do tempo.',
    segments: ['consultoria'],
    objectives: ['orcamento', 'empresa', 'agendamento', 'servicos'],
    variants: [
      { id: 'declaracao', name: 'Declaração', description: 'Título grande, sem foto: a proposta de valor é a imagem.' },
      { id: 'painel', name: 'Painel', description: 'Texto de um lado e um painel ilustrativo do outro.' },
    ],
    typography: 'geometrica',
    palettes: ['grafite', 'azul', 'petroleo', 'vinho'],
    services: 'colunas',
    structure: {
      essencial: ['servicos', 'processo', 'sobre'],
      profissional: ['servicos', 'processo', 'sobre', 'diferenciais', 'faq'],
      completo: ['servicos', 'processo', 'sobre', 'diferenciais', 'faq', 'depoimentos'],
    },
  },
  {
    id: 'alimentacao',
    name: 'Alimentação',
    concept: 'Produto e desejo',
    description: 'Imagens de comida em destaque, categorias claras e pedido pelo WhatsApp — sem carrinho nem pagamento online.',
    segments: ['alimentacao'],
    objectives: ['produtos', 'orcamento', 'empresa'],
    variants: [
      { id: 'mesa', name: 'Mesa posta', description: 'Imagem grande no topo e um cartão com o título e o pedido.' },
      { id: 'cardapio', name: 'Cardápio', description: 'Título ao lado de um prato em destaque e as categorias logo abaixo.' },
    ],
    typography: 'serif',
    palettes: ['terracota', 'verde', 'vinho', 'grafite'],
    services: 'produtos',
    structure: {
      essencial: ['servicos', 'sobre', 'atendimento'],
      profissional: ['servicos', 'galeria', 'sobre', 'atendimento', 'faq'],
      completo: ['vitrine', 'sobre', 'galeria', 'atendimento', 'faq', 'depoimentos'],
    },
  },
  {
    id: 'portfolio',
    name: 'Arquitetura e portfólio',
    concept: 'Visual e autoral',
    description: 'Imagens grandes, muito respiro, legendas discretas e projetos com hierarquia.',
    segments: ['criativo'],
    objectives: ['trabalhos', 'orcamento', 'empresa'],
    variants: [
      { id: 'galeria', name: 'Imagem de abertura', description: 'Uma imagem ampla abre o site, com título e legenda abaixo.' },
      { id: 'indice', name: 'Índice', description: 'Título grande e a lista de serviços como índice, com a imagem em faixa.' },
    ],
    typography: 'geometrica',
    palettes: ['grafite', 'terracota', 'verde', 'azul'],
    services: 'indice',
    structure: {
      essencial: ['servicos', 'processo', 'sobre'],
      profissional: ['galeria', 'servicos', 'processo', 'sobre', 'faq'],
      completo: ['galeria', 'servicos', 'processo', 'sobre', 'faq', 'depoimentos'],
    },
  },
  {
    id: 'imobiliario',
    name: 'Imobiliário',
    concept: 'Apresentação e orientação',
    description: 'Apresentação do profissional separada dos imóveis; vitrine só quando o pacote e os dados permitem.',
    segments: ['imoveis'],
    objectives: ['agendamento', 'orcamento', 'trabalhos', 'empresa'],
    variants: [
      { id: 'apresentacao', name: 'Apresentação', description: 'Quem atende e como ajuda, com a imagem ao lado.' },
      { id: 'orientacao', name: 'Orientação', description: 'Imagem em faixa com um cartão que explica como começar a busca.' },
    ],
    typography: 'geometrica',
    palettes: ['azul', 'grafite', 'petroleo', 'verde'],
    services: 'cartoes',
    structure: {
      essencial: ['servicos', 'processo', 'sobre'],
      profissional: ['servicos', 'processo', 'sobre', 'galeria', 'faq'],
      completo: ['servicos', 'vitrine', 'processo', 'sobre', 'faq', 'depoimentos'],
    },
  },
  {
    id: 'pet',
    name: 'Veterinária e cuidados pet',
    concept: 'Acolhimento e precisão',
    description: 'Cuidado e organização sem linguagem infantil; clínica, banho e tosa e pet shop com imagens próprias.',
    segments: ['pet'],
    objectives: ['agendamento', 'servicos', 'produtos'],
    variants: [
      { id: 'acolhimento', name: 'Acolhimento', description: 'Imagem com cantos suaves ao lado do título e do pedido de horário.' },
      { id: 'cuidados', name: 'Cuidados em destaque', description: 'Título e os serviços em blocos com ícones logo no topo.' },
    ],
    typography: 'geometrica',
    palettes: ['petroleo', 'azul', 'verde', 'terracota'],
    services: 'icones',
    structure: {
      essencial: ['servicos', 'processo', 'sobre'],
      profissional: ['servicos', 'processo', 'sobre', 'atendimento', 'faq'],
      completo: ['servicos', 'processo', 'sobre', 'atendimento', 'faq', 'depoimentos'],
    },
  },
  {
    id: 'institucional',
    name: 'Institucional versátil',
    concept: 'Identidade sem nicho forçado',
    description: 'Composição equilibrada e hierarquia forte, com imagem neutra ou uma solução tipográfica.',
    segments: ['outro'],
    objectives: ['empresa', 'orcamento', 'agendamento', 'servicos', 'produtos', 'trabalhos'],
    variants: [
      { id: 'equilibrio', name: 'Equilíbrio', description: 'Texto e imagem lado a lado, com os serviços em cartões.' },
      { id: 'tipografico', name: 'Monograma', description: 'A inicial da marca num bloco de cor, sem foto.' },
    ],
    typography: 'sans',
    palettes: ['azul', 'grafite', 'roxo', 'petroleo', 'verde'],
    services: 'cartoes',
    structure: {
      essencial: ['servicos', 'sobre', 'diferenciais'],
      profissional: ['servicos', 'sobre', 'diferenciais', 'processo', 'faq'],
      completo: ['servicos', 'sobre', 'diferenciais', 'processo', 'faq', 'depoimentos'],
    },
  },
];

export const familyIds = families.map((f) => f.id);
/** Todas as variantes (ids únicos entre as famílias). */
export const layoutIds = families.flatMap((f) => f.variants.map((v) => v.id));
export const heroIds = ['imagem', 'tipografico'] as const;

export function familyById(id: string): Family | undefined {
  return families.find((f) => f.id === id);
}
