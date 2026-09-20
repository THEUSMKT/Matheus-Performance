/* ==========================================================================
   Etapa 4 — paletas. EDITE AQUI para trocar as combinações oferecidas.
   Cada paleta alimenta diretamente o preview ao vivo.
   ========================================================================== */
import type { ColorScheme } from '@/lib/types';

export const colorSchemes: ColorScheme[] = [
  {
    id: 'azul',
    name: 'Azul moderno',
    pitch: 'Confiança e tecnologia.',
    palette: {
      bg: '#F6F8FC', surface: '#FFFFFF', ink: '#0F172A', muted: '#64748B',
      accent: '#2563EB', onAccent: '#FFFFFF', line: 'rgba(15,23,42,.10)',
    },
    chips: ['#2563EB', '#60A5FA', '#0F172A', '#F6F8FC'],
  },
  {
    id: 'preto',
    name: 'Preto premium',
    pitch: 'Sofisticação sem ruído.',
    palette: {
      bg: '#0B0B0D', surface: '#17171B', ink: '#F5F5F4', muted: '#A1A1AA',
      accent: '#FAFAF9', onAccent: '#0B0B0D', line: 'rgba(245,245,244,.14)',
    },
    chips: ['#0B0B0D', '#17171B', '#A1A1AA', '#FAFAF9'],
  },
  {
    id: 'rosa',
    name: 'Rosa sofisticado',
    pitch: 'Delicado, mas com presença.',
    palette: {
      bg: '#FDF5F8', surface: '#FFFFFF', ink: '#2C1420', muted: '#8A6377',
      accent: '#BE185D', onAccent: '#FFFFFF', line: 'rgba(44,20,32,.10)',
    },
    chips: ['#BE185D', '#F9A8D4', '#2C1420', '#FDF5F8'],
  },
  {
    id: 'bege',
    name: 'Bege minimalista',
    pitch: 'Calmo, artesanal, atemporal.',
    palette: {
      bg: '#F5F1E9', surface: '#FFFDF8', ink: '#241F17', muted: '#7A6E5C',
      accent: '#77613C', onAccent: '#FFFDF8', line: 'rgba(36,31,23,.12)',
    },
    chips: ['#77613C', '#C9B68F', '#241F17', '#F5F1E9'],
  },
  {
    id: 'verde',
    name: 'Verde natural',
    pitch: 'Saúde, cuidado, bem-estar.',
    palette: {
      bg: '#F2F7F3', surface: '#FFFFFF', ink: '#0F2419', muted: '#5C7A68',
      accent: '#15795A', onAccent: '#FFFFFF', line: 'rgba(15,36,25,.10)',
    },
    chips: ['#15795A', '#6EE7B7', '#0F2419', '#F2F7F3'],
  },
  {
    id: 'roxo',
    name: 'Roxo tecnológico',
    pitch: 'Inovação e energia.',
    palette: {
      bg: '#F8F7FD', surface: '#FFFFFF', ink: '#1B1233', muted: '#6B6191',
      accent: '#6D28D9', onAccent: '#FFFFFF', line: 'rgba(27,18,51,.10)',
    },
    chips: ['#6D28D9', '#C4B5FD', '#1B1233', '#F8F7FD'],
  },
];

/** Paleta usada quando o cliente traz as cores da própria marca. */
export function paletteFromCustom(accent: string, bg: string) {
  const dark = isDark(bg);
  return {
    bg,
    surface: dark ? lighten(bg, 0.07) : '#FFFFFF',
    ink: dark ? '#F6F6F5' : '#15161A',
    muted: dark ? 'rgba(246,246,245,.62)' : 'rgba(21,22,26,.58)',
    accent,
    onAccent: isDark(accent) ? '#FFFFFF' : '#15161A',
    line: dark ? 'rgba(246,246,245,.16)' : 'rgba(21,22,26,.11)',
  };
}

function toRgb(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

/** Luminância relativa simplificada, para decidir texto claro ou escuro. */
export function isDark(hex: string): boolean {
  const [r, g, b] = toRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55;
}

function lighten(hex: string, amount: number): string {
  const rgb = toRgb(hex).map((c) => Math.round(c + (255 - c) * amount));
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
