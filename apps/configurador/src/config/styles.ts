/* ==========================================================================
   Etapa 3 — personalidade visual. EDITE AQUI.
   O `skin` sobrescreve o do modelo escolhido na etapa anterior.
   ========================================================================== */
import type { VisualStyle } from '@/lib/types';

export const visualStyles: VisualStyle[] = [
  {
    id: 'minimalista',
    name: 'Minimalista',
    pitch: 'Só o essencial, com muito ar.',
    skin: { radius: 3, density: 'airy', borders: false, titleWeight: 500, titleScale: 0.98 },
    swatch: ['#FFFFFF', '#EDEDEB', '#1A1A1A'],
  },
  {
    id: 'elegante',
    name: 'Elegante',
    pitch: 'Ritmo calmo e acabamento fino.',
    skin: { radius: 2, density: 'airy', borders: true, titleWeight: 500, titleScale: 1.1 },
    swatch: ['#F7F3EC', '#D8CBB5', '#33291F'],
  },
  {
    id: 'moderno',
    name: 'Moderno',
    pitch: 'Blocos claros e leitura direta.',
    skin: { radius: 12, density: 'normal', borders: false, titleWeight: 700, titleScale: 1.02 },
    swatch: ['#EAF1FE', '#3B82F6', '#0F172A'],
  },
  {
    id: 'tecnologico',
    name: 'Tecnológico',
    pitch: 'Precisão, grade, sensação de produto.',
    skin: { radius: 8, density: 'tight', borders: true, titleWeight: 600, titleScale: 1 },
    swatch: ['#0F172A', '#22D3EE', '#94A3B8'],
  },
  {
    id: 'criativo',
    name: 'Criativo',
    pitch: 'Assimetria e cor com coragem.',
    skin: { radius: 18, density: 'normal', borders: false, titleWeight: 700, titleScale: 1.16 },
    swatch: ['#FDE68A', '#F97316', '#7C3AED'],
  },
  {
    id: 'premium',
    name: 'Premium',
    pitch: 'Poucos elementos, cada um impecável.',
    skin: { radius: 6, density: 'airy', borders: true, titleWeight: 600, titleScale: 1.08 },
    swatch: ['#111111', '#B99A62', '#F4F1EA'],
  },
  {
    id: 'clean',
    name: 'Clean',
    pitch: 'Organizado, claro, fácil de usar.',
    skin: { radius: 10, density: 'normal', borders: true, titleWeight: 600, titleScale: 1 },
    swatch: ['#FFFFFF', '#E2E8F0', '#334155'],
  },
  {
    id: 'dark',
    name: 'Dark',
    pitch: 'Fundo escuro, foco no conteúdo.',
    skin: { radius: 10, density: 'normal', borders: true, titleWeight: 600, titleScale: 1.04, forceDark: true },
    swatch: ['#0B0B0D', '#2A2A31', '#E4E4E7'],
  },
];
