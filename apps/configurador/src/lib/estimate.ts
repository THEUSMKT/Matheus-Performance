/* ==========================================================================
   Cálculo da estimativa. Toda tabela de preço mora em config/pricing.ts.
   ========================================================================== */
import { pricing } from '@/config/pricing';
import type { Selection } from './types';

export type Estimate = {
  /** Valor central, antes de virar faixa. */
  total: number;
  min: number;
  max: number;
  /** Pontos de complexidade, usados para o prazo. */
  complexity: number;
  deadline: string;
  /** Quantas das seis etapas já foram respondidas. */
  answered: number;
};

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function estimate(selection: Selection): Estimate {
  let total = pricing.base;

  if (selection.type) total += pricing.byType[selection.type] ?? 0;
  if (selection.template) total += pricing.byTemplate[selection.template] ?? 0;
  if (selection.style) total += pricing.byStyle[selection.style] ?? 0;
  if (selection.customColor) total += pricing.customColors;

  for (const id of selection.features) {
    total += pricing.byFeature[id] ?? 0;
  }

  const { perFeature, heavyFeatures, heavyFeatureBonus, byType } = pricing.complexity;
  let complexity = selection.type ? byType[selection.type] ?? 1 : 1;
  for (const id of selection.features) {
    complexity += perFeature;
    if ((heavyFeatures as readonly string[]).includes(id)) complexity += heavyFeatureBonus;
  }

  const deadline =
    pricing.deadlines.find((tier) => complexity <= tier.maxComplexity)?.label ??
    pricing.deadlines[pricing.deadlines.length - 1].label;

  const spread = total * pricing.rangeSpread;

  return {
    total,
    // O piso da faixa é o valor do projeto base: nunca anunciamos menos que isso.
    min: Math.max(pricing.base, roundTo(total - spread, pricing.roundTo)),
    max: roundTo(total + spread, pricing.roundTo),
    complexity,
    deadline,
    answered: countAnswered(selection),
  };
}

export function countAnswered(selection: Selection): number {
  return [
    selection.type,
    selection.template,
    selection.style,
    selection.color ?? selection.customColor,
    selection.font,
    selection.features.length > 0 ? 'ok' : null,
  ].filter(Boolean).length;
}
