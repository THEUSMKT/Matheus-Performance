/* ==========================================================================
   Etapa 1 — tipos de site. EDITE AQUI para incluir ou remover opções.
   Os ids precisam existir em pricing.ts (byType e complexity.byType).
   ========================================================================== */
import type { SiteType } from '@/lib/types';

export const siteTypes: SiteType[] = [
  {
    id: 'landing',
    name: 'Landing page',
    pitch: 'Uma página só, feita para vender um serviço.',
    icon: 'MousePointerClick',
    layout: 'centered',
    previewHeadline: 'Sua consultoria começa aqui',
    previewCta: 'Falar agora',
  },
  {
    id: 'institucional',
    name: 'Site institucional',
    pitch: 'Sua empresa apresentada com credibilidade.',
    icon: 'Building2',
    layout: 'split',
    previewHeadline: 'Soluções que sua empresa precisa',
    previewCta: 'Conheça',
  },
  {
    id: 'portfolio',
    name: 'Portfólio',
    pitch: 'Seu trabalho no centro da atenção.',
    icon: 'Images',
    layout: 'showcase',
    previewHeadline: 'Trabalhos selecionados',
    previewCta: 'Ver projetos',
  },
  {
    id: 'profissional',
    name: 'Site profissional',
    pitch: 'Para quem atende clientes com hora marcada.',
    icon: 'BriefcaseBusiness',
    layout: 'editorial',
    previewHeadline: 'Atendimento com hora marcada',
    previewCta: 'Agendar',
  },
  {
    id: 'catalogo',
    name: 'Catálogo de serviços',
    pitch: 'Tudo que você oferece, organizado.',
    icon: 'LayoutGrid',
    layout: 'stacked',
    previewHeadline: 'Nossos serviços',
    previewCta: 'Pedir orçamento',
  },
  {
    id: 'local',
    name: 'Negócio local',
    pitch: 'Endereço, horário e contato à mão.',
    icon: 'MapPin',
    layout: 'sidebar',
    previewHeadline: 'Perto de você, todo dia',
    previewCta: 'Como chegar',
  },
];
