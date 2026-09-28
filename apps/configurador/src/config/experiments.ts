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

/**
 * Textos que cada variante troca. O controle é o texto aprovado. `short` é o
 * título no celular (o longo continua disponível para leitores de tela).
 * Sem promessa de tempo: "em poucos passos", nunca "em X minutos".
 */
export const heroVariants = {
  a: {
    title: 'Um site profissional para apresentar sua empresa e facilitar novos contatos.',
    short: 'Um site profissional para o seu negócio.',
  },
  b: {
    title: 'Veja o site da sua empresa antes de contratar.',
    short: 'Veja seu site antes de contratar.',
  },
} as const;

/** Rótulo do botão principal para quem ainda não tem prévia salva. */
export const ctaVariants = {
  a: { primary: 'Criar minha prévia grátis' },
  b: { primary: 'Ver meu site em poucos passos' },
} as const;
