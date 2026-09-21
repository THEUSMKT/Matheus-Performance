/* ==========================================================================
   Etapa 2 — modelos. EDITE AQUI para trocar a vitrine de layouts.
   `layout` e `skin` desenham a miniatura em <SitePreview />.
   ========================================================================== */
import type { Template } from '@/lib/types';

export const templates: Template[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    family: 'Modelo 01',
    pitch: 'Espaço em branco e uma única mensagem.',
    layout: 'centered',
    skin: { radius: 4, density: 'airy', borders: false, titleWeight: 500, titleScale: 1 },
    demoPalette: {
      bg: '#FBFBFA', surface: '#FFFFFF', ink: '#17181B', muted: '#8A8C93',
      accent: '#17181B', onAccent: '#FFFFFF', line: 'rgba(23,24,27,.09)',
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    family: 'Modelo 02',
    pitch: 'Detalhes finos e sensação de marca cara.',
    layout: 'split',
    skin: { radius: 8, density: 'airy', borders: true, titleWeight: 600, titleScale: 1.05 },
    demoPalette: {
      bg: '#F7F5F0', surface: '#FFFFFF', ink: '#1C1A16', muted: '#7C7467',
      accent: '#8A6B33', onAccent: '#FFFFFF', line: 'rgba(28,26,22,.12)',
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    family: 'Modelo 03',
    pitch: 'Tipografia grande, contraste alto.',
    layout: 'stacked',
    skin: { radius: 2, density: 'tight', borders: false, titleWeight: 800, titleScale: 1.3 },
    demoPalette: {
      bg: '#FFFFFF', surface: '#F2F2F0', ink: '#0A0A0A', muted: '#6E6E6E',
      accent: '#FF4D1F', onAccent: '#FFFFFF', line: 'rgba(10,10,10,.12)',
    },
  },
  {
    id: 'elegance',
    name: 'Elegance',
    family: 'Modelo 04',
    pitch: 'Editorial, com ritmo de revista.',
    layout: 'editorial',
    skin: { radius: 0, density: 'airy', borders: true, titleWeight: 500, titleScale: 1.12 },
    demoPalette: {
      bg: '#FAF7F2', surface: '#FFFFFF', ink: '#241D1A', muted: '#7E7069',
      accent: '#3F5D52', onAccent: '#FFFFFF', line: 'rgba(36,29,26,.14)',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    family: 'Modelo 05',
    pitch: 'Cards, cor e leitura rápida.',
    layout: 'split',
    skin: { radius: 12, density: 'normal', borders: false, titleWeight: 700, titleScale: 1.02 },
    demoPalette: {
      bg: '#F4F7FB', surface: '#FFFFFF', ink: '#111827', muted: '#6B7280',
      accent: '#2563EB', onAccent: '#FFFFFF', line: 'rgba(17,24,39,.09)',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    family: 'Modelo 06',
    pitch: 'Fundo escuro e imagens em destaque.',
    layout: 'showcase',
    skin: { radius: 10, density: 'normal', borders: true, titleWeight: 600, titleScale: 1.06, forceDark: true },
    demoPalette: {
      bg: '#0C0D10', surface: '#16181D', ink: '#F4F4F5', muted: '#9BA0AA',
      accent: '#22D3EE', onAccent: '#0C0D10', line: 'rgba(244,244,245,.14)',
    },
  },
];
