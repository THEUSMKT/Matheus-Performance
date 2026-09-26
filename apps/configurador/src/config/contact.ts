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
  whatsappIntro:
    'Olá! Montei a prévia do meu site e gostaria de solicitar um orçamento.',
  /** Fechamento da mensagem. */
  whatsappOutro: 'Gostaria de conversar sobre o projeto.',

  /**
   * Mensagem dos CTAs genéricos — rodapé e afins. Não se mistura com o
   * briefing do configurador, que é montado em src/lib/whatsapp.ts.
   */
  /** Pedido de um estilo fora dos disponíveis na etapa Aparência. */
  whatsappEstilo: 'Olá! Gostaria de um estilo diferente dos disponíveis no configurador para o meu site.',

  whatsappCurta:
    'Olá! Vi o site da Beck Performance e gostaria de tirar uma dúvida sobre a criação de um site.',
} as const;
