/* ==========================================================================
   Tipos compartilhados do configurador.
   ========================================================================== */

/** Paleta que alimenta o preview ao vivo. */
export type Palette = {
  /** Fundo da página miniatura. */
  bg: string;
  /** Cartões e barras sobre o fundo. */
  surface: string;
  /** Texto principal. */
  ink: string;
  /** Texto de apoio. */
  muted: string;
  /** Cor de destaque: botões, marcadores. */
  accent: string;
  /** Texto sobre a cor de destaque. */
  onAccent: string;
  /** Linhas e bordas. */
  line: string;
};

/** Arranjo dos blocos na miniatura de site. */
export type PreviewLayout =
  | 'split'      // texto à esquerda, imagem à direita
  | 'centered'   // tudo centralizado, respiro grande
  | 'editorial'  // título largo, colunas de texto
  | 'stacked'    // faixa cheia + cards em linha
  | 'sidebar'    // menu lateral + conteúdo
  | 'showcase';  // grade de imagens dominante

/** Ajustes de "personalidade" aplicados por cima do modelo. */
export type PreviewSkin = {
  /** Raio dos cantos, em px da escala da miniatura. */
  radius: number;
  /** Respiro entre blocos. */
  density: 'airy' | 'normal' | 'tight';
  /** Mostrar bordas finas nos blocos. */
  borders: boolean;
  /** Peso do título da miniatura. */
  titleWeight: 400 | 500 | 600 | 700 | 800;
  /** Escala do título dentro da miniatura. */
  titleScale: number;
  /** Força o modo escuro independentemente da paleta. */
  forceDark?: boolean;
};

export type SiteType = {
  id: string;
  name: string;
  /** Uma linha, no máximo. */
  pitch: string;
  /** Nome do ícone lucide usado no card. */
  icon: string;
  /** Layout sugerido do preview enquanto nenhum modelo foi escolhido. */
  layout: PreviewLayout;
  /** Headline que aparece dentro da miniatura. */
  previewHeadline: string;
  previewCta: string;
};

export type Template = {
  id: string;
  name: string;
  /** Rótulo curto exibido sobre a miniatura. */
  family: string;
  pitch: string;
  layout: PreviewLayout;
  skin: PreviewSkin;
  /** Paleta usada só na vitrine de modelos, antes de o usuário escolher cores. */
  demoPalette: Palette;
};

export type VisualStyle = {
  id: string;
  name: string;
  pitch: string;
  skin: PreviewSkin;
  /** Três cores para o selo do card (não é a paleta do site). */
  swatch: [string, string, string];
};

export type ColorScheme = {
  id: string;
  name: string;
  pitch: string;
  palette: Palette;
  /** Cores mostradas como pastilhas no card. */
  chips: string[];
};

export type FontPairing = {
  id: string;
  name: string;
  pitch: string;
  /** Nomes legíveis, usados na mensagem do WhatsApp. */
  headingName: string;
  bodyName: string;
  /** Variáveis CSS registradas em layout.tsx. */
  headingVar: string;
  bodyVar: string;
  /** Peso usado na amostra "Aa". */
  specimenWeight: number;
  /** Ajuste de tracking da amostra. */
  specimenTracking: string;
};

export type Feature = {
  id: string;
  name: string;
  pitch: string;
  icon: string;
  /** Linha extra, menor que o pitch. Hoje só as opções de formulário usam. */
  hint?: string;
};

/** Tudo que o usuário escolheu. */
export type Selection = {
  type: string | null;
  template: string | null;
  style: string | null;
  color: string | null;
  /** Cores próprias, quando o usuário escolhe "já tenho minhas cores". */
  customColor: { accent: string; bg: string } | null;
  font: string | null;
  features: string[];
  /** Volume estimado de contatos, respondido dentro da própria opção. */
  emailVolume: string | null;
  name: string;
  company: string;
};

export const emptySelection: Selection = {
  type: null,
  template: null,
  style: null,
  color: null,
  customColor: null,
  font: null,
  features: [],
  emailVolume: null,
  name: '',
  company: '',
};
