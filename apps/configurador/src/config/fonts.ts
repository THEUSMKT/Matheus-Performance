/* ==========================================================================
   Etapa 5 — tipografia. EDITE AQUI.
   As variáveis CSS (`headingVar`/`bodyVar`) são registradas em app/layout.tsx.
   Para incluir uma fonte nova, carregue-a lá antes de citá-la aqui.
   ========================================================================== */
import type { FontPairing } from '@/lib/types';

export const fontPairings: FontPairing[] = [
  {
    id: 'moderno',
    name: 'Moderno',
    pitch: 'Direto, atual, fácil de ler em qualquer tela.',
    headingName: 'Plus Jakarta Sans',
    bodyName: 'Plus Jakarta Sans',
    headingVar: 'var(--font-jakarta)',
    bodyVar: 'var(--font-jakarta)',
    specimenWeight: 700,
    specimenTracking: '-0.03em',
  },
  {
    id: 'elegante',
    name: 'Elegante',
    pitch: 'Serifa clássica com um corpo neutro.',
    headingName: 'Playfair Display',
    bodyName: 'Inter',
    headingVar: 'var(--font-playfair)',
    bodyVar: 'var(--font-inter)',
    specimenWeight: 600,
    specimenTracking: '-0.01em',
  },
  {
    id: 'marcante',
    name: 'Marcante',
    pitch: 'Títulos que ocupam espaço e se fazem notar.',
    headingName: 'Space Grotesk',
    bodyName: 'Inter',
    headingVar: 'var(--font-grotesk)',
    bodyVar: 'var(--font-inter)',
    specimenWeight: 700,
    specimenTracking: '-0.04em',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    pitch: 'Uma família só, do título ao rodapé.',
    headingName: 'Inter',
    bodyName: 'Inter',
    headingVar: 'var(--font-inter)',
    bodyVar: 'var(--font-inter)',
    specimenWeight: 500,
    specimenTracking: '-0.02em',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    pitch: 'Ar de revista, com títulos longos e leves.',
    headingName: 'Instrument Serif',
    bodyName: 'Inter',
    headingVar: 'var(--font-instrument)',
    bodyVar: 'var(--font-inter)',
    specimenWeight: 400,
    specimenTracking: '0em',
  },
];
