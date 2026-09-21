/* ==========================================================================
   Traduz as escolhas do usuário no que a miniatura de site deve desenhar.
   ========================================================================== */
import { colorSchemes, isDark, paletteFromCustom } from '@/config/colors';
import { fontPairings } from '@/config/fonts';
import { siteTypes } from '@/config/siteTypes';
import { templates } from '@/config/templates';
import { visualStyles } from '@/config/styles';
import type { Palette, PreviewLayout, PreviewSkin, Selection } from './types';

export type PreviewSpec = {
  palette: Palette;
  skin: PreviewSkin;
  layout: PreviewLayout;
  headline: string;
  cta: string;
  headingFont: string;
  bodyFont: string;
  features: string[];
};

const defaultPalette: Palette = {
  bg: '#FFFFFF',
  surface: '#F4F5F8',
  ink: '#15161A',
  muted: '#8A8F9A',
  accent: '#4F46E5',
  onAccent: '#FFFFFF',
  line: 'rgba(21,22,26,.10)',
};

const defaultSkin: PreviewSkin = {
  radius: 8,
  density: 'normal',
  borders: false,
  titleWeight: 600,
  titleScale: 1,
};

/** Escurece uma paleta clara quando o estilo ou o modelo pede fundo escuro. */
export function toDark(palette: Palette): Palette {
  if (isDark(palette.bg)) return palette;
  return {
    bg: '#0C0D10',
    surface: '#17191F',
    ink: '#F4F4F5',
    muted: 'rgba(244,244,245,.58)',
    accent: palette.accent,
    onAccent: isDark(palette.accent) ? '#FFFFFF' : '#0C0D10',
    line: 'rgba(244,244,245,.14)',
  };
}

export function resolvePreview(selection: Selection): PreviewSpec {
  const type = siteTypes.find((t) => t.id === selection.type);
  const template = templates.find((t) => t.id === selection.template);
  const style = visualStyles.find((s) => s.id === selection.style);
  const scheme = colorSchemes.find((c) => c.id === selection.color);
  const pairing = fontPairings.find((f) => f.id === selection.font);

  let palette: Palette = selection.customColor
    ? paletteFromCustom(selection.customColor.accent, selection.customColor.bg)
    : scheme?.palette ?? template?.demoPalette ?? defaultPalette;

  const skin: PreviewSkin = { ...defaultSkin, ...template?.skin, ...style?.skin };
  if (skin.forceDark) palette = toDark(palette);

  return {
    palette,
    skin,
    layout: template?.layout ?? type?.layout ?? 'split',
    headline: type?.previewHeadline ?? 'Seu negócio, do jeito certo',
    cta: type?.previewCta ?? 'Fale comigo',
    headingFont: pairing?.headingVar ?? 'var(--font-jakarta)',
    bodyFont: pairing?.bodyVar ?? 'var(--font-jakarta)',
    features: selection.features,
  };
}
