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
  /** A necessidade que o pacote resolve, antes das quantidades (cartões da página de pacotes e da inicial). */
  purpose: string;
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
    purpose: 'Apresentar a empresa e os serviços.',
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
    purpose: 'Mostrar trabalhos e organizar solicitações.',
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
    purpose: 'Apresentar produtos ou serviços com mais detalhe.',
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

/** Até três benefícios principais de cada pacote (derivados dos limites). */
export function packageHighlights(pkg: Package): string[] {
  return packageDiffs(pkg).slice(0, 3);
}

/** O que todos os pacotes têm — mostrado uma vez, fora dos cartões. */
export const commonBenefits = [
  'página responsiva, pensada primeiro para o celular',
  'sua logo, suas cores e o estilo escolhido',
  'botão de WhatsApp e links para as redes',
  `${revisionRounds} rodadas de ajustes antes de publicar`,
] as const;

/**
 * O que muda de um pacote para outro, em uso (até 4 linhas). O Essencial
 * não ganha lista maior só para parecer completo.
 */
export function packageDiffs(pkg: Package): string[] {
  const list = [pkg.id === 'essencial' ? `Até ${pkg.maxSections} seções: apresentação, serviços, sobre, contato e uma à escolha` : `Até ${pkg.maxSections} seções na página`];
  if (pkg.showcaseItems) list.push(`Vitrine com até ${pkg.showcaseItems} itens, com pedido pelo WhatsApp`);
  if (pkg.galleryImages) list.push(`Galeria com até ${pkg.galleryImages} fotos para apresentar trabalhos`);
  if (pkg.form) list.push(pkg.showcaseItems ? 'Formulário, perguntas frequentes e depoimentos, como no Profissional' : 'Formulário que organiza a solicitação antes do WhatsApp');
  if (pkg.form && !pkg.showcaseItems) list.push('Perguntas frequentes e depoimentos reais');
  return list.slice(0, 4);
}

/**
 * O que o pacote permite fazer, com o benefício antes da quantidade (3 ou 4
 * linhas, derivadas dos limites): parte principal dos cartões de pacote.
 */
export function packageKeyPoints(pkg: Package): string[] {
  const below = packages[packageOrder.indexOf(pkg.id) - 1];
  const list: string[] = [];
  if (!below) {
    list.push(`Apresentação, serviços, sobre e contato (até ${pkg.maxSections} seções)`);
    list.push('Sua logo, suas cores e o estilo escolhido');
    list.push('Botão de WhatsApp e links para as redes');
    return list;
  }
  if (pkg.showcaseItems > below.showcaseItems) list.push(`Vitrine para apresentar produtos ou serviços, com pedido pelo WhatsApp (até ${pkg.showcaseItems} itens)`);
  if (pkg.galleryImages > below.galleryImages)
    list.push(below.galleryImages ? `Galeria maior para mostrar trabalhos (até ${pkg.galleryImages} fotos)` : `Galeria para mostrar seus trabalhos (até ${pkg.galleryImages} fotos)`);
  if (pkg.form && !below.form) {
    list.push('Formulário que organiza as solicitações antes do WhatsApp');
    list.push('Perguntas frequentes e depoimentos reais');
  }
  if (pkg.id === 'completo') list.push('Conteúdo organizado com mais detalhe');
  list.push(`Até ${pkg.maxSections} seções na página${below.form && pkg.form ? ', com formulário, perguntas e depoimentos' : ''}`);
  return list.slice(0, 4);
}

/**
 * Lista completa do que o pacote inclui, sem "Tudo do anterior": cada
 * cartão se explica sozinho. `extra` marca o que este pacote acrescenta ao
 * pacote logo abaixo dele (para destacar o que muda).
 */
export function packageFeatures(pkg: Package): { text: string; extra: boolean }[] {
  const below = packages[packageOrder.indexOf(pkg.id) - 1];
  const list: { text: string; extra: boolean }[] = [
    { text: 'Página única e responsiva, para celular e computador', extra: false },
    {
      text: pkg.id === 'essencial' ? `Até ${pkg.maxSections} seções: apresentação, serviços, sobre, contato e uma complementar` : `Até ${pkg.maxSections} seções na mesma página`,
      extra: Boolean(below),
    },
    { text: 'Aplicação da sua logo e das cores da marca', extra: false },
    { text: 'Escolha entre os estilos disponíveis', extra: false },
    { text: 'Botão de WhatsApp e links para as redes sociais', extra: false },
  ];
  if (pkg.galleryImages) list.push({ text: `Galeria com até ${pkg.galleryImages} fotos fornecidas por você`, extra: !below || below.galleryImages !== pkg.galleryImages });
  if (pkg.form) {
    list.push({ text: 'Formulário que organiza a solicitação e encaminha ao WhatsApp', extra: !below?.form });
    list.push({ text: 'Perguntas frequentes e depoimentos reais, dentro do limite de seções', extra: !below?.form });
  }
  if (pkg.showcaseItems) list.push({ text: `Vitrine de até ${pkg.showcaseItems} produtos ou serviços, com pedido pelo WhatsApp`, extra: !below?.showcaseItems });
  if (pkg.id === 'completo') list.push({ text: 'Organização mais detalhada do conteúdo', extra: true });
  list.push({ text: `${revisionRounds} rodadas de ajustes antes da publicação`, extra: false });
  list.push({ text: 'Acompanhamento da publicação no ambiente combinado', extra: false });
  return list;
}

/**
 * O que a diferença de preço para o pacote de baixo compra, em uma frase
 * derivada dos limites. Nulo no primeiro pacote.
 */
export function upgradeNote(pkg: Package): { diff: number; from: string; gains: string[] } | null {
  const below = packages[packageOrder.indexOf(pkg.id) - 1];
  if (!below) return null;
  const gains: string[] = [];
  if (pkg.maxSections > below.maxSections) gains.push(`${pkg.maxSections - below.maxSections} ${pkg.maxSections - below.maxSections === 1 ? 'seção' : 'seções'} a mais (até ${pkg.maxSections})`);
  if (pkg.galleryImages > below.galleryImages) gains.push(below.galleryImages ? `galeria com até ${pkg.galleryImages} fotos (no ${below.name}, até ${below.galleryImages})` : `galeria com até ${pkg.galleryImages} fotos`);
  if (pkg.form && !below.form) gains.push('formulário que organiza a solicitação', 'perguntas frequentes e depoimentos reais');
  if (pkg.showcaseItems > below.showcaseItems) gains.push(`vitrine com até ${pkg.showcaseItems} produtos ou serviços`);
  return { diff: pkg.price - below.price, from: below.name, gains };
}

/**
 * Comparação curta, alinhada por recurso. Cada célula é derivada dos
 * limites do pacote. `from` diz a partir de qual pacote o recurso existe.
 */
export function packageComparison(): { label: string; cells: string[] }[] {
  const first = (test: (p: Package) => boolean) => packages.find(test)?.name ?? '';
  const cell = (on: boolean, text: string, from: string) => (on ? text : `A partir do ${from}`);
  return [
    { label: 'Valor total', cells: packages.map((p) => brl(p.price)) },
    { label: 'Seções na página', cells: packages.map((p) => `Até ${p.maxSections}`) },
    { label: 'Estilo, cores e logo', cells: packages.map(() => 'Incluído') },
    { label: 'Botão de WhatsApp', cells: packages.map(() => 'Incluído') },
    { label: 'Galeria de fotos', cells: packages.map((p) => cell(p.galleryImages > 0, `Até ${p.galleryImages} fotos`, first((x) => x.galleryImages > 0))) },
    { label: 'Formulário para WhatsApp', cells: packages.map((p) => cell(p.form, 'Incluído', first((x) => x.form))) },
    { label: 'Perguntas frequentes e depoimentos', cells: packages.map((p) => cell(p.form, 'Incluído', first((x) => x.form))) },
    { label: 'Vitrine de produtos', cells: packages.map((p) => cell(p.showcaseItems > 0, `Até ${p.showcaseItems} itens`, first((x) => x.showcaseItems > 0))) },
    { label: 'Prazo', cells: packages.map((p) => p.deadline) },
    { label: 'Ajustes antes de publicar', cells: packages.map(() => `${revisionRounds} rodadas`) },
  ];
}
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

/**
 * Regras comerciais em linguagem simples, lidas pela página inicial, pela de
 * pacotes e pelas perguntas frequentes. Só o que já está definido; o que
 * ainda não tem regra (limite da revisão de textos, o que conta como uma
 * rodada, valor de alterações depois da entrega) fica em aberto no
 * UPGRADE.md, sem virar promessa aqui.
 */
export const serviceTerms = {
  textReview:
    'Os textos sugeridos na prévia, inclusive os da IA, são um ponto de partida: antes de entrarem no site, são revisados com você a partir das informações da sua empresa.',
  contentProduction: 'Produção de conteúdo — escrever textos novos, fotografar ou gravar vídeos — não está incluída nos pacotes e é combinada à parte.',
  revisions: `${revisionRounds} rodadas de ajustes antes da publicação, em todos os pacotes. Mudanças de escopo depois da aprovação são orçadas à parte.`,
  afterDelivery: 'Depois da publicação, alterações e manutenção são pedidas pelo WhatsApp e orçadas à parte, antes de serem feitas. Não há mensalidade de desenvolvimento.',
  domainHosting: 'Domínio e hospedagem não entram no valor do desenvolvimento: são pagos à parte, direto aos fornecedores.',
} as const;

/** Custos que nunca entram no valor do desenvolvimento. */
export const externalCosts = [
  'Domínio (endereço do site)',
  'Hospedagem',
  'E-mail profissional, se desejar',
  'Ferramentas ou plataformas externas, se combinadas',
] as const;
