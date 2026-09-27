/* ==========================================================================
   Pacotes de desenvolvimento — EDITE AQUI
   Único lugar com valores, limites e o que cada pacote inclui. Página de
   apresentação, configurador, resumo, PDF, mensagem do WhatsApp e receptor
   de pedidos leem daqui: mudar um número aqui muda em todos eles.

   O teto de R$ 1.000 não é um corte na soma: é o preço do maior pacote.
   O que não cabe em nenhum pacote vai para "projeto personalizado", com
   orçamento separado.
   ========================================================================== */

export type PackageId = 'essencial' | 'profissional' | 'completo';

export type Package = {
  id: PackageId;
  name: string;
  /** Valor total do desenvolvimento, pagamento único. */
  price: number;
  /** Uma frase: para quem o pacote serve. */
  forWhom: string;
  /** Blocos principais da página (cada um conta como seção). */
  maxSections: number;
  /** Imagens fornecidas pelo cliente na galeria (0 = sem galeria). */
  galleryImages: number;
  /** Itens na vitrine com pedido pelo WhatsApp (0 = sem vitrine). */
  showcaseItems: number;
  /** Formulário que organiza o pedido e encaminha ao WhatsApp. */
  form: boolean;
  /** Prazo de desenvolvimento, contado após o recebimento dos materiais. */
  deadline: string;
  /** O que o pacote inclui, na ordem em que aparece nas listas. */
  includes: string[];
};

/** Rodadas de ajustes antes da publicação, iguais em todos os pacotes. */
export const revisionRounds = 2;

export const packages: Package[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 500,
    forWhom: 'Para apresentar a empresa e os serviços com clareza.',
    maxSections: 5,
    galleryImages: 0,
    showcaseItems: 0,
    form: false,
    deadline: '3–5 dias úteis',
    includes: [
      'Uma página responsiva, para celular e computador',
      'Até 5 seções: apresentação, serviços, sobre, contato e uma complementar',
      'Aplicação da sua logo e das cores da marca',
      'Escolha entre os estilos disponíveis',
      'Botão de WhatsApp e links para as redes sociais',
      `${revisionRounds} rodadas de ajustes antes da publicação`,
      'Acompanhamento da publicação no ambiente combinado',
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 750,
    forWhom: 'Para receber pedidos mais organizados e mostrar mais do seu trabalho.',
    maxSections: 7,
    galleryImages: 8,
    showcaseItems: 0,
    form: true,
    deadline: '5–8 dias úteis',
    includes: [
      'Tudo do Essencial',
      'Até 7 seções na mesma página',
      'Galeria com até 8 imagens fornecidas por você',
      'Formulário que organiza o pedido e encaminha ao WhatsApp',
      'Perguntas frequentes e depoimentos reais, dentro do limite de seções',
    ],
  },
  {
    id: 'completo',
    name: 'Completo',
    price: 1000,
    forWhom: 'Para apresentar produtos ou muitos serviços com mais detalhe.',
    maxSections: 8,
    galleryImages: 15,
    showcaseItems: 10,
    form: true,
    deadline: '7–12 dias úteis',
    includes: [
      'Tudo do Profissional',
      'Até 8 seções na mesma página',
      'Galeria com até 15 imagens fornecidas por você',
      'Vitrine de até 10 produtos ou serviços, com pedido pelo WhatsApp',
      'Organização mais detalhada do conteúdo',
    ],
  },
];

export const packageOrder: PackageId[] = packages.map((p) => p.id);
export const minPrice = packages[0].price;
export const maxPrice = packages[packages.length - 1].price;

export function packageById(id: PackageId): Package {
  return packages.find((p) => p.id === id) ?? packages[0];
}

/** Posição do pacote (0 = mais simples). */
export const rank = (id: PackageId) => packageOrder.indexOf(id);
export const higher = (a: PackageId, b: PackageId): PackageId => (rank(a) >= rank(b) ? a : b);

/** Formata um número como Real, sem centavos. */
export function brl(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

/** Textos curtos repetidos junto de todo preço. */
export const priceNotes = {
  /** Junto do preço no configurador, no resumo e no PDF. */
  payment: 'Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte.',
  /** Junto da faixa de preço na apresentação. */
  landing: 'Valor do desenvolvimento. Domínio e hospedagem à parte.',
  /** O prazo só começa com os materiais em mãos. */
  deadlineStart: 'contados após o recebimento de textos, imagens e logo',
} as const;

/** Faixa anunciada, sempre derivada dos pacotes. */
export const priceRange = `${brl(minPrice)} a ${brl(maxPrice)}`;

/**
 * Fora dos pacotes: qualquer um destes leva a "projeto personalizado", com
 * orçamento separado. A prévia continua salva.
 */
export const customNeeds = [
  { id: 'loja', name: 'Loja virtual com carrinho e pagamento online' },
  { id: 'estoque', name: 'Controle de estoque' },
  { id: 'sistema', name: 'Sistema interno ou sob medida' },
  { id: 'login', name: 'Área de login ou cadastro de clientes' },
  { id: 'integracao', name: 'Integração com outros sistemas (ERP, CRM…)' },
  { id: 'agenda', name: 'Agenda própria com horários em tempo real' },
  { id: 'paginas', name: 'Mais de uma página' },
  { id: 'unidades', name: 'Várias unidades com informações próprias' },
  { id: 'idiomas', name: 'Site em mais de um idioma' },
  { id: 'producao', name: 'Produção de fotos, vídeos ou textos' },
] as const;

/** Custos que nunca entram no valor do desenvolvimento. */
export const externalCosts = [
  'Domínio (endereço do site)',
  'Hospedagem',
  'E-mail profissional, se desejar',
  'Ferramentas ou plataformas externas, se combinadas',
] as const;
