/* ==========================================================================
   Formulário de contato — EDITE AQUI.
   Textos e limites do recebimento por e-mail. A plataforma externa pode
   mudar seus limites, então nada disso fica escrito dentro de componente.
   ========================================================================== */

/** Envios mensais que o plano gratuito costuma cobrir. */
export const FORM_FREE_MONTHLY_LIMIT = 50;

/** Ids das duas funcionalidades de formulário (também usados em features.ts). */
export const FORM_WHATSAPP = 'formularioWhatsapp';
export const FORM_EMAIL = 'formularioEmail';

/** Caixa informativa que aparece ao escolher o recebimento por e-mail. */
export const emailFormNotice = {
  title: 'Sobre o recebimento por e-mail',
  body:
    'O formulário utiliza um serviço externo para receber e encaminhar as mensagens ao seu e-mail. ' +
    'O plano gratuito possui um limite mensal de envios e, dependendo do volume de contatos da empresa, ' +
    'pode ser necessário contratar um plano pago.',
  limit:
    `Plano gratuito: aproximadamente ${FORM_FREE_MONTHLY_LIMIT} envios por mês, ` +
    'conforme as condições atuais da plataforma.',
  separateCost: 'A assinatura da plataforma é um custo separado do valor de criação do site.',
  firstMonth:
    'Caso seja necessário um plano pago, o primeiro mês pode ser incluído na configuração inicial. ' +
    'Após esse período, a mensalidade da plataforma é de responsabilidade do cliente.',
} as const;

/** Pergunta de volume, respondida dentro da própria funcionalidade. */
export const volumeQuestion = 'Quantos contatos você imagina receber pelo site por mês?';

export type VolumeOption = {
  id: string;
  /** Rótulo do botão. */
  label: string;
  /** Resposta mostrada logo abaixo, sempre com "pode" — nunca como certeza. */
  answer: string;
  /** Como o volume aparece na mensagem do WhatsApp. */
  messageLabel: string;
  /** Como a plataforma externa aparece na mensagem do WhatsApp. */
  messagePlatform: string;
  /** Frase extra no resumo, quando o volume passa do limite gratuito. */
  summaryWarning?: string;
};

export const volumeOptions: VolumeOption[] = [
  {
    id: 'ate50',
    label: `Até ${FORM_FREE_MONTHLY_LIMIT}`,
    answer: 'O plano gratuito pode ser suficiente para começar.',
    messageLabel: `Até ${FORM_FREE_MONTHLY_LIMIT} contatos/mês`,
    messagePlatform: 'plano gratuito pode ser suficiente',
  },
  {
    id: 'mais50',
    label: `Mais de ${FORM_FREE_MONTHLY_LIMIT}`,
    answer: 'Pelo volume estimado, pode ser necessário um plano pago da plataforma de formulários.',
    messageLabel: `Mais de ${FORM_FREE_MONTHLY_LIMIT} contatos/mês`,
    messagePlatform: 'pode necessitar plano pago',
    summaryWarning: 'Volume estimado acima do limite gratuito — pode ser necessário plano pago.',
  },
  {
    id: 'naoSei',
    label: 'Não sei ainda',
    answer: 'Você pode começar acompanhando o volume de mensagens e ajustar depois.',
    messageLabel: 'ainda não estimado',
    messagePlatform: 'plano conforme o volume de mensagens',
  },
];

/** Como cada escolha de formulário aparece no resumo do projeto. */
export const formSummary = {
  [FORM_WHATSAPP]: {
    value: 'WhatsApp',
    note: 'Sem mensalidade de plataforma de formulário.',
  },
  [FORM_EMAIL]: {
    value: 'Recebimento por e-mail',
    note:
      'Configuração incluída. Plataforma externa pode possuir cobrança própria ' +
      'dependendo do volume de mensagens.',
  },
} as const;

/** Linha de custos externos, separada da estimativa do desenvolvimento. */
export const externalCost = 'Plataforma de formulário por e-mail — conforme plano contratado.';

/** Observação geral de transparência, perto do resumo. */
export const externalServicesNote =
  'Serviços externos como domínio, hospedagem, e-mail profissional e plataformas de formulário ' +
  'podem possuir cobranças próprias e não estão incluídos no valor do desenvolvimento, ' +
  'salvo quando informado.';
