/* ==========================================================================
   Preços e prazos — EDITE AQUI
   Nenhum valor monetário deve existir fora deste arquivo.
   O cálculo em si mora em src/lib/estimate.ts.
   ========================================================================== */

export const pricing = {
  /** Projeto base, com o essencial já incluído. */
  base: 500,

  /** A estimativa é exibida como faixa: ±% sobre o valor calculado.
      O piso da faixa nunca fica abaixo de `base`. */
  rangeSpread: 0.1,

  /** Arredondamento da faixa exibida (para não mostrar R$ 673). */
  roundTo: 10,

  /** Acréscimo por tipo de site (chaves = id em siteTypes.ts). */
  byType: {
    landing: 0,
    institucional: 120,
    portfolio: 80,
    profissional: 100,
    catalogo: 150,
    local: 40,
  } as Record<string, number>,

  /** Acréscimo por modelo escolhido (chaves = id em templates.ts). */
  byTemplate: {
    minimal: 0,
    premium: 60,
    bold: 30,
    elegance: 40,
    modern: 30,
    dark: 40,
  } as Record<string, number>,

  /** Acréscimo por estilo visual (chaves = id em styles.ts). */
  byStyle: {
    minimalista: 0,
    elegante: 30,
    moderno: 20,
    tecnologico: 30,
    criativo: 40,
    premium: 50,
    clean: 0,
    dark: 30,
  } as Record<string, number>,

  /** Paleta pronta não custa nada; cores próprias exigem ajuste fino. */
  customColors: 40,

  /** Funcionalidades (chaves = id em features.ts). */
  byFeature: {
    whatsapp: 0,
    formularioWhatsapp: 50,
    formularioEmail: 50,
    galeria: 80,
    depoimentos: 40,
    faq: 40,
    mapa: 40,
    redes: 0,
    animacoes: 80,
    catalogo: 150,
    paginaExtra: 100,
    agendamento: 100,
    instagram: 50,
  } as Record<string, number>,

  /** Faixas de prazo, em dias úteis, por pontos de complexidade. */
  deadlines: [
    { maxComplexity: 5, label: '3–5 dias úteis' },
    { maxComplexity: 11, label: '5–8 dias úteis' },
    { maxComplexity: Infinity, label: '7–12 dias úteis' },
  ],

  /** Peso de complexidade de cada escolha, para calcular o prazo. */
  complexity: {
    perFeature: 1,
    heavyFeatures: ['catalogo', 'paginaExtra', 'agendamento', 'animacoes', 'galeria'],
    heavyFeatureBonus: 1,
    byType: {
      landing: 1,
      local: 1,
      portfolio: 2,
      profissional: 3,
      institucional: 3,
      catalogo: 4,
    } as Record<string, number>,
  },
} as const;

/** Formata um número como Real, sem centavos. */
export function brl(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}
