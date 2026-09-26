/* ==========================================================================
   Testes de mensagem, fluxo e CTA — EDITE AQUI
   Todos começam inativos: cada visitante vê o controle ('a') e a versão é
   registrada nos eventos. Ativar um teste é mudar `active` para true.
   Não declare vencedor com poucos dados — ver OPERACAO.md.
   ========================================================================== */

export type Experiment = {
  id: string;
  active: boolean;
  /** Variantes possíveis; a primeira é o controle. */
  variants: readonly string[];
};

export const experiments = {
  hero: { id: 'hero', active: false, variants: ['a', 'b'] },
  fluxo: { id: 'fluxo', active: false, variants: ['a'] },
  cta: { id: 'cta', active: false, variants: ['a', 'b'] },
} as const satisfies Record<string, Experiment>;

export type ExperimentId = keyof typeof experiments;

/** Textos que cada variante troca. O controle é o texto aprovado. */
export const heroVariants = {
  a: {
    eyebrow: 'Sites para empresas de todos os portes',
    title: 'Estruture seu site profissional em até 5 minutos.',
    description: 'Monte uma prévia personalizada em poucos passos.',
  },
  b: {
    eyebrow: 'Sites para empresas de todos os portes',
    title: 'Veja o site da sua empresa antes de contratar.',
    description: 'Monte uma prévia personalizada em poucos passos.',
  },
} as const;

/** Rótulo do botão principal para quem ainda não tem prévia salva. */
export const ctaVariants = {
  a: { primary: 'Criar minha prévia' },
  b: { primary: 'Montar minha prévia' },
} as const;
