'use client';

import { fontPairings } from '@/config/fonts';
import { SelectCard } from '@/components/ui/SelectCard';
import type { StepProps } from './shared';

export function FontSelector({ selection, update }: StepProps) {
  return (
    <div role="radiogroup" aria-label="Tipografia" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {fontPairings.map((pairing) => {
        const sameFamily = pairing.headingName === pairing.bodyName;
        return (
          <SelectCard
            key={pairing.id}
            selected={selection.font === pairing.id}
            onSelect={() => update({ font: pairing.id })}
            label={`${pairing.name}: ${pairing.headingName}`}
            className="p-5"
          >
            <span
              className="block leading-none text-ink"
              style={{
                fontFamily: pairing.headingVar,
                fontWeight: pairing.specimenWeight,
                letterSpacing: pairing.specimenTracking,
                fontSize: '3.25rem',
              }}
            >
              Aa
            </span>
            <span className="mt-4 block text-[0.9375rem] font-semibold tracking-[-0.015em]">{pairing.name}</span>
            <span className="mt-0.5 block text-[0.8125rem] text-muted">
              {sameFamily ? pairing.headingName : `${pairing.headingName} + ${pairing.bodyName}`}
            </span>
            <span
              className="mt-3 block border-t border-line pt-3 text-sm leading-snug text-muted"
              style={{ fontFamily: pairing.bodyVar }}
            >
              {pairing.pitch}
            </span>
          </SelectCard>
        );
      })}
    </div>
  );
}
