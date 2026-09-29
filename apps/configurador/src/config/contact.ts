/* ==========================================================================
   Marca e contato — EDITE AQUI
   Único lugar do projeto com número de WhatsApp, e-mail e redes.
   ========================================================================== */

export const contact = {
  /** Assinatura da marca: só o nome, sem subtítulo. */
  brand: 'Beck Performance',
  /** Responsável pelo atendimento e pelo desenvolvimento. */
  owner: 'Matheus Beck',
  /** Usada em metadados e dados estruturados. */
  tagline: 'Sites para empresas de todos os portes',

  /** WhatsApp — apenas dígitos, com DDI + DDD, sem +, espaço ou traço. */
  whatsapp: '5551981947979',
  /** Como o número é exibido na tela. */
  whatsappDisplay: '(51) 98194-7979',

  /**
   * Deixe vazio até existir um endereço real. Campo vazio = o item não
   * aparece em lugar nenhum da página (nada de endereço de exemplo).
   */
  email: '',
  instagram: '',
  instagramHandle: '',

  /** Site de gestão de tráfego, publicado na raiz do mesmo repositório. */
  mainSiteUrl: 'https://theusmkt.github.io/Matheus-Performance/',

  /**
   * Deixe `false` enquanto a página estiver em revisão: o link continua
   * aberto para quem tiver o endereço, mas os buscadores não indexam.
   * Troque para `true` quando o conteúdo estiver aprovado.
   */
  indexarNoGoogle: false,

  /** Endereço público, usado em canonical, Open Graph e sitemap. */
  siteUrl: 'https://theusmkt.github.io/Matheus-Performance/configurador',

  /** Abertura da mensagem enviada ao WhatsApp com o briefing montado. */
  whatsappIntro: 'Olá, Matheus! Quero solicitar o desenvolvimento do meu site pela Beck Performance.',
  /** Abertura quando o projeto precisa de orçamento personalizado. */
  whatsappPersonalizado: 'Olá, Matheus! Criei a prévia do meu site e preciso de um projeto personalizado.',
  /** Fechamento da mensagem do pedido. */
  whatsappClosing: 'Gostaria de alinhar os próximos passos para desenvolver este projeto.',
  /** Pedido de projeto fora dos pacotes, a partir da apresentação. */
  whatsappProjetoPersonalizado:
    'Olá! Vi os pacotes de site da Beck Performance e preciso de um projeto personalizado. Posso explicar o que preciso?',

  /** Pedido de um estilo fora dos disponíveis na escolha de estilo. */
  whatsappEstilo: 'Olá! Gostaria de um estilo diferente dos disponíveis no configurador para o meu site.',

  /** Mensagem dos botões genéricos — rodapé e afins. */

  whatsappCurta:
    'Olá! Vi o site da Beck Performance e gostaria de tirar uma dúvida sobre a criação de um site.',

  /** "Conversar sobre meu projeto" (início da página e chamada final): contratação direta, sem prévia. */
  whatsappConversa: 'Olá, Matheus! Vi o site da Beck Performance e quero conversar sobre o site da minha empresa.',
  /** "Conversar sobre um projeto sob medida": necessidades além de uma página. */
  whatsappSobMedida:
    'Olá, Matheus! Vi o site da Beck Performance e meu projeto precisa ir além de uma página. Posso contar o que a minha empresa precisa?',
  /** Abertura de "Conversar sobre esta prévia", seguida do resumo do projeto. */
  whatsappPrevia: 'Olá, Matheus! Criei uma prévia do site da minha empresa no configurador e quero conversar sobre ela.',
  /** Fechamento de "Conversar sobre esta prévia". */
  whatsappPreviaClosing: 'Podemos conversar sobre esta prévia e os próximos passos?',
} as const;

/** "Conversar sobre um projeto assim": leva o nome do projeto real na mensagem. */
export const projectInterestMessage = (projectName: string) =>
  `Olá, Matheus! Vi o projeto “${projectName}” no site da Beck Performance e quero conversar sobre um site assim para a minha empresa.`;

/** "Conversar sobre este pacote": leva o nome e o valor do pacote na mensagem. */
export const packageInterestMessage = (packageName: string, price: string) =>
  `Olá, Matheus! Tenho interesse no pacote ${packageName} (${price}) e quero conversar sobre o site da minha empresa.`;
