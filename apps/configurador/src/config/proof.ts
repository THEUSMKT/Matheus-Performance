/* ==========================================================================
   Projetos reais e depoimentos — EDITE AQUI (só com autorização)
   Os projetos abaixo aparecem na página inicial ("Da ideia ao ar") e na
   página de exemplos ("Projetos reais"). Nunca coloque exemplos fictícios,
   textos de preenchimento, logos de terceiros, resultados ou números sem
   comprovação, nem associe um projeto a pacote ou preço sem confirmação.
   Capturas em public/projetos/ (origem e data no README.md de lá).
   ========================================================================== */

import { contact } from './contact';

export type RealProject = {
  id: string;
  /** Nome como aparece no cartão. */
  name: string;
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
    id: 'matheus-beck',
    name: 'Matheus Beck — Gestão de Tráfego e Posicionamento Digital',
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

export const testimonials: Testimonial[] = [];
