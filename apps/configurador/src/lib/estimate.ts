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

export type BreakdownLine = {
  kind: 'base' | 'type' | 'identity' | 'colors' | 'feature';
  /** Id da opção de origem (tipo, modelo/estilo ou recurso). */
  id: string;
  value: number;
};

/**
 * A composição é a fonte do cálculo: o total da estimativa é exatamente a
 * soma destas linhas. Página, PDF, mensagem e proposta usam a mesma função,
 * então não há como divergirem. Recursos repetidos entram uma vez só.
 */
export function breakdown(selection: Selection): BreakdownLine[] {
  const lines: BreakdownLine[] = [{ kind: 'base', id: 'base', value: pricing.base }];

  if (selection.type) {
    lines.push({ kind: 'type', id: selection.type, value: pricing.byType[selection.type] ?? 0 });
  }

  const identityIncluded = pricing.identity.mode === 'incluida';
  const identity =
    (selection.template ? pricing.byTemplate[selection.template] ?? 0 : 0) +
    (selection.style ? pricing.byStyle[selection.style] ?? 0 : 0);
  if (selection.template || selection.style) {
    lines.push({
      kind: 'identity',
      id: `${selection.template ?? ''}/${selection.style ?? ''}`,
      value: identityIncluded ? 0 : identity,
    });
  }

  if (selection.customColor) lines.push({ kind: 'colors', id: 'custom', value: pricing.customColors });

  for (const id of new Set(selection.features)) {
    lines.push({ kind: 'feature', id, value: pricing.byFeature[id] ?? 0 });
  }
  return lines;
}

export function estimate(selection: Selection): Estimate {
  const total = breakdown(selection).reduce((sum, line) => sum + line.value, 0);

  const { perFeature, heavyFeatures, heavyFeatureBonus, byType } = pricing.complexity;
  let complexity = selection.type ? byType[selection.type] ?? 1 : 1;
  for (const id of new Set(selection.features)) {
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
