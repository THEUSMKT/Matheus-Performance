/* ==========================================================================
   Integrações — ativadas por variáveis de ambiente no build.

   Sem NEXT_PUBLIC_LEAD_ENDPOINT, a página funciona em modo WhatsApp: o
   botão prepara a conversa com o resumo e nenhum pedido é dado como
   recebido. Com o endereço de um receptor real, o formulário "Solicitar
   proposta" passa a existir. Tokens e credenciais nunca ficam aqui — só no
   receptor. Ver OPERACAO.md e .env.example.
   ========================================================================== */

export const integrations = {
  /** URL pública do receptor de pedidos (não é segredo). */
  leadEndpoint: process.env.NEXT_PUBLIC_LEAD_ENDPOINT ?? '',
  /**
   * Expectativa de retorno exibida ao visitante. Deixe vazio até que um
   * prazo real esteja combinado — nada é prometido por padrão.
   */
  responseExpectation: process.env.NEXT_PUBLIC_RESPONSE_EXPECTATION ?? '',
  /** 'production' só no build publicado; qualquer outro valor é teste. */
  siteEnv: process.env.NEXT_PUBLIC_SITE_ENV ?? 'development',
} as const;

export const leadMode: 'receptor' | 'whatsapp' = integrations.leadEndpoint ? 'receptor' : 'whatsapp';
export const isProduction = integrations.siteEnv === 'production';
