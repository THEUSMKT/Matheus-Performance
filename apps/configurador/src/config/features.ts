/* ==========================================================================
   Etapa 6 — funcionalidades. EDITE AQUI.
   Os ids precisam existir em pricing.ts (byFeature).
   ========================================================================== */
import type { Feature } from '@/lib/types';

export const features: Feature[] = [
  { id: 'whatsapp', name: 'Botão de WhatsApp', pitch: 'Flutuante, em toda a página.', icon: 'MessageCircle' },
  { id: 'formulario', name: 'Formulário de contato', pitch: 'As mensagens chegam no seu e-mail.', icon: 'Mail' },
  { id: 'galeria', name: 'Galeria de fotos', pitch: 'Seus trabalhos em grade, com zoom.', icon: 'Images' },
  { id: 'depoimentos', name: 'Depoimentos', pitch: 'Prova de quem já é seu cliente.', icon: 'Quote' },
  { id: 'faq', name: 'Perguntas frequentes', pitch: 'Responde antes de o cliente perguntar.', icon: 'CircleHelp' },
  { id: 'mapa', name: 'Mapa e endereço', pitch: 'Localização com rota em um toque.', icon: 'Map' },
  { id: 'redes', name: 'Redes sociais', pitch: 'Links para seus perfis.', icon: 'Share2' },
  { id: 'animacoes', name: 'Animações', pitch: 'Movimentos suaves ao rolar a página.', icon: 'Sparkles' },
  { id: 'catalogo', name: 'Catálogo de produtos', pitch: 'Itens com foto, descrição e preço.', icon: 'Package' },
  { id: 'paginaExtra', name: 'Página adicional', pitch: 'Blog, sobre, serviços — você escolhe.', icon: 'FilePlus2' },
  { id: 'agendamento', name: 'Agendamento', pitch: 'O cliente marca horário direto no site.', icon: 'CalendarCheck' },
  { id: 'instagram', name: 'Feed do Instagram', pitch: 'Seus posts recentes, sempre atualizados.', icon: 'Camera' },
];
