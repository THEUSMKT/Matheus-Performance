/* ==========================================================================
   Oferta comercial — EDITE AQUI
   Caminhos de contratação, necessidades que exigem diagnóstico e regras de
   escopo. Nenhum valor monetário mora aqui: todo preço sai de pricing.ts,
   calculado pela mesma função usada na página, no PDF e na mensagem.
   ========================================================================== */

export type PlanConfig = {
  type: string;
  sections: string[];
  features: string[];
};

export type Plan = {
  id: 'presenca' | 'captacao' | 'empresarial';
  name: string;
  /** Uma frase: para quem este caminho serve. */
  forWhom: string;
  /** Entregas incluídas na estimativa. */
  includes: string[];
  /** O que fica fora da estimativa de desenvolvimento. */
  extras: string[];
  next: string;
  /** Estrutura aplicada ao configurador quando o caminho é escolhido. */
  config: PlanConfig;
  /**
   * Quando verdadeiro, a faixa é só um ponto de partida: conteúdo, páginas e
   * integrações são avaliados antes da proposta final.
   */
  needsAssessment?: boolean;
};

const externosComuns = [
  'Domínio, hospedagem e e-mail profissional',
  'Produção de textos, fotos e vídeos',
];

export const plans: Plan[] = [
  {
    id: 'presenca',
    name: 'Presença profissional',
    forWhom: 'Para apresentar a empresa e os serviços com clareza, com um caminho direto para o contato.',
    includes: [
      'Página principal com apresentação, serviços, sobre e contato',
      'Botão de WhatsApp e links para as redes sociais',
      'Layout responsivo para celular e computador',
      'Duas rodadas de ajustes antes da publicação',
      'Acompanhamento até a publicação',
    ],
    extras: [...externosComuns, 'Páginas e recursos adicionais'],
    next: 'Revisar a estrutura e confirmar o escopo pelo WhatsApp.',
    config: {
      type: 'landing',
      sections: ['apresentacao', 'servicos', 'sobre', 'contato'],
      features: ['whatsapp', 'redes'],
    },
  },
  {
    id: 'captacao',
    name: 'Captação de orçamentos',
    forWhom: 'Para quem quer receber pedidos de orçamento mais organizados a partir de uma oferta principal.',
    includes: [
      'Tudo o que está em Presença profissional',
      'Estrutura orientada a uma oferta principal',
      'Formulário que organiza o pedido e abre a conversa no WhatsApp',
      'Perguntas frequentes para esclarecer dúvidas antes do contato',
      'Medição de cliques e pedidos, quando combinada no escopo',
    ],
    extras: [...externosComuns, 'Ferramentas de análise pagas e verba de anúncios'],
    next: 'Confirmar a oferta principal e o que o formulário deve perguntar.',
    config: {
      type: 'landing',
      sections: ['apresentacao', 'servicos', 'sobre', 'faq', 'contato'],
      features: ['whatsapp', 'redes', 'formularioWhatsapp', 'faq'],
    },
  },
  {
    id: 'empresarial',
    name: 'Projeto empresarial',
    forWhom: 'Para empresas com mais conteúdo, mais de uma página, integrações ou aprovação interna.',
    includes: [
      'Estrutura institucional com uma página adicional',
      'Levantamento de conteúdo, páginas e integrações antes da proposta',
      'Formulário para WhatsApp e perguntas frequentes',
      'Etapas de aprovação combinadas com quem decide',
    ],
    extras: [...externosComuns, 'Integrações e plataformas externas, após avaliação'],
    next: 'Agendar a conversa de levantamento antes da proposta final.',
    needsAssessment: true,
    config: {
      type: 'institucional',
      sections: ['apresentacao', 'servicos', 'sobre', 'faq', 'contato'],
      features: ['whatsapp', 'redes', 'formularioWhatsapp', 'faq', 'paginaExtra'],
    },
  },
];

/**
 * Necessidades que não cabem numa estimativa automática. Qualquer uma delas
 * leva o projeto para diagnóstico: a página deixa de mostrar faixa de preço
 * e explica por quê, em vez de sugerir um valor que não se sustenta.
 */
export const complexNeeds = [
  { id: 'unidades', name: 'Várias unidades ou filiais com informações próprias' },
  { id: 'loja', name: 'Loja virtual com carrinho e pagamento online' },
  { id: 'reservas', name: 'Sistema de reservas próprio ou regras de agenda específicas' },
  { id: 'integracao', name: 'Integração com sistema interno (ERP, CRM, estoque)' },
  { id: 'sistema', name: 'Área de login, cadastro de clientes ou sistema sob medida' },
  { id: 'idiomas', name: 'Site em mais de um idioma' },
] as const;

/** Regras de escopo mostradas ao lado das opções que costumam confundir. */
export const scopeRules = {
  catalogo:
    'O catálogo apresenta itens e encaminha o pedido pelo contato. Não inclui carrinho, estoque nem pagamento online — loja virtual passa por diagnóstico.',
  agendaSolicitacao:
    'O visitante pede um horário pelo WhatsApp e você confirma. Não há agenda com disponibilidade automática.',
  agendaIntegrada:
    'Incorpora uma plataforma de agendamento externa. A assinatura dela é um custo separado e a compatibilidade é avaliada antes.',
  paginaExtra: 'Uma página com endereço próprio, além da principal.',
  categoria:
    'A categoria ajusta a organização do conteúdo. Ela não adiciona páginas: páginas extras aparecem como item próprio.',
} as const;

/** Rodadas de ajustes incluídas, conforme os termos vigentes. */
export const revisionRounds = 2;
