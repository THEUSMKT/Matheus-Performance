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
    title: 'Um site profissional para apresentar sua empresa e facilitar novos pedidos de orçamento.',
    description:
      'Veja uma prévia, conheça a estimativa de investimento e receba orientação para publicar um site alinhado ao seu negócio.',
  },
  b: {
    title: 'Mostre o que sua empresa faz e receba pedidos de orçamento com mais clareza.',
    description:
      'Monte a prévia do seu site, veja quanto custa e converse com quem vai desenvolver antes de decidir.',
  },
} as const;

export const ctaVariants = {
  a: { primary: 'Ver a prévia do meu site' },
  b: { primary: 'Montar a prévia do meu site' },
} as const;
