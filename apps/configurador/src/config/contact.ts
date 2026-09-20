/* ==========================================================================
   Marca e contato — EDITE AQUI
   Único lugar do projeto com número de WhatsApp, e-mail e redes.
   ========================================================================== */

export const contact = {
  /** Assinatura da página. */
  brand: 'Matheus Beck',
  /** Aparece no rodapé, abaixo da marca. */
  tagline: 'Criação de sites sob medida',

  /** WhatsApp — apenas dígitos, com DDI + DDD, sem +, espaço ou traço. */
  whatsapp: '5551981947979',
  /** Como o número é exibido na tela. */
  whatsappDisplay: '(51) 98194-7979',

  email: 'contato@seudominio.com.br',
  instagram: 'https://instagram.com/seuinstagram',
  instagramHandle: '@seuinstagram',

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
    'Olá! Montei uma ideia de site pelo configurador e gostaria de solicitar um orçamento.',
  /** Fechamento da mensagem. */
  whatsappOutro: 'Gostaria de conversar sobre o projeto.',

  /**
   * Mensagem dos CTAs genéricos — rodapé e afins. Não se mistura com o
   * briefing do configurador, que é montado em src/lib/whatsapp.ts.
   */
  whatsappCurta:
    'Olá! Vi o configurador de sites e gostaria de saber mais sobre a criação de um site.',
} as const;
