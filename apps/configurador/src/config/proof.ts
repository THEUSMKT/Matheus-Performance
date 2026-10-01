/* ==========================================================================
   Projetos reais e depoimentos — EDITE AQUI (só com autorização)
   Os projetos abaixo aparecem no carrossel do topo da página inicial
   (HeroProjects) e na página de exemplos ("Projetos reais"). O site da
   própria marca é sempre identificado como tal ("marca própria"). Nunca coloque exemplos fictícios,
   textos de preenchimento, logos de terceiros, resultados ou números sem
   comprovação, nem associe um projeto a pacote ou preço sem confirmação.
   Capturas em public/projetos/ (origem e data no README.md de lá).
   ========================================================================== */

import { contact } from './contact';

export type RealProject = {
  id: string;
  /** Nome como aparece no cartão. */
  name: string;
  /** Nome curto, para o selo do carrossel do topo (opcional; sem ele, vale `name`). */
  shortName?: string;
  category: string;
  /** Uma frase: o que o site apresenta (sem resultados nem métricas). */
  description: string;
  /** A necessidade que o site atende, em uma frase (sem resultados nem métricas). */
  need: string;
  /** Endereço publicado; abre em nova aba. */
  url: string;
  /** Domínio exibido na barra da captura. */
  domain: string;
  /** Projeto da própria marca (não é cliente externo). */
  ownBrand?: boolean;
  /** Prefixo das capturas em public/projetos/ (-640/-1280 e -celular-300/-600 .webp). */
  image: string;
  /** Texto alternativo da captura. */
  alt: string;
  /** Data do pedido de exibição / autorização (controle interno). */
  authorizedAt: string;
};

export type Testimonial = {
  name: string;
  company?: string;
  text: string;
  authorizedAt: string;
};

export const realProjects: RealProject[] = [
  {
    id: 'schay-corretora',
    name: 'Schay Corretora',
    category: 'Mercado imobiliário',
    description: 'Site imobiliário com apresentação profissional, vitrine de imóveis e caminhos de contato pelo WhatsApp.',
    need: 'Apresentar a corretora e os imóveis com credibilidade e levar quem procura um imóvel direto para a conversa.',
    url: 'https://schaycorretora.com.br/',
    domain: 'schaycorretora.com.br',
    image: '/projetos/schay-corretora',
    alt: 'Página inicial do site da Schay Corretora',
    authorizedAt: '2026-09-28',
  },
  {
    id: 'julia-studio',
    name: 'Julia Studio Makeup',
    category: 'Beleza e maquiagem',
    description: 'Site de maquiagem profissional com portfólio, serviços por ocasião e pedido de horário montado direto no WhatsApp.',
    need: 'Apresentar o trabalho da maquiadora e facilitar o agendamento de noivas, madrinhas, formandas e festas pelo WhatsApp.',
    url: 'https://theusmkt.github.io/LANDING-PAGE-JULIA/',
    domain: 'theusmkt.github.io/LANDING-PAGE-JULIA',
    image: '/projetos/julia-studio',
    alt: 'Página inicial do site Julia Studio Makeup',
    authorizedAt: '2026-09-30',
  },
  {
    id: 'pablo-design',
    name: 'Pablo Cavalheiro · Design Gráfico',
    shortName: 'Pablo Cavalheiro · Design',
    category: 'Design gráfico',
    description: 'Portfólio de design gráfico autoral com apresentação profissional, galeria de trabalhos, serviços e contato pelo WhatsApp.',
    need: 'Mostrar o trabalho autoral do designer e facilitar o pedido de orçamento para identidade visual, social media e materiais gráficos.',
    url: 'https://theusmkt.github.io/DESIGN-GRAFICO-PABLO/',
    domain: 'theusmkt.github.io/DESIGN-GRAFICO-PABLO',
    image: '/projetos/pablo-design',
    alt: 'Página inicial do site Pablo Cavalheiro — Design Gráfico',
    authorizedAt: '2026-09-30',
  },
  {
    id: 'matheus-beck',
    name: 'Matheus Beck — Gestão de Tráfego e Posicionamento Digital',
    shortName: 'Matheus Beck · Gestão de Tráfego',
    category: 'Marketing e serviços profissionais',
    description: 'Site de serviços com apresentação da marca, metodologia de trabalho, pacotes e chamadas para atendimento.',
    need: 'Explicar os serviços de gestão de tráfego e o método de trabalho, com caminhos claros para pedir atendimento.',
    // O mesmo endereço do site de tráfego (contact.ts): muda junto com o domínio.
    url: contact.mainSiteUrl,
    domain: contact.mainSiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    ownBrand: true,
    image: '/projetos/matheus-beck',
    alt: 'Página inicial do site Matheus Beck — Gestão de Tráfego e Posicionamento Digital',
    authorizedAt: '2026-09-28',
  },
];

// TODO: substituir pelo depoimento real — seção oculta até ter conteúdo aprovado
export const testimonials: Testimonial[] = [
  // { name: 'Schay Corretora', company: 'Schay Corretora', text: 'TODO: substituir pelo depoimento real', authorizedAt: '' },
  // { name: 'Julia Studio Makeup', company: 'Julia Studio Makeup', text: 'TODO: substituir pelo depoimento real', authorizedAt: '' },
  // { name: 'Pablo Cavalheiro', company: 'Pablo Cavalheiro · Design Gráfico', text: 'TODO: substituir pelo depoimento real', authorizedAt: '' },
];

export const SHOW_TESTIMONIALS = false;
