'use client';

import { visualStyles } from '@/config/styles';
import { SelectCard } from '@/components/ui/SelectCard';
import type { StepProps } from './shared';

export function StyleSelector({ selection, update }: StepProps) {
  return (
    <div role="radiogroup" aria-label="Personalidade visual" className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {visualStyles.map((style) => (
        <SelectCard
          key={style.id}
          selected={selection.style === style.id}
          onSelect={() => update({ style: style.id })}
          label={`${style.name}. ${style.pitch}`}
          checkClass="right-2.5 top-2.5"
        >
          {/* O selo é a amostra do estilo: três faixas na diagonal. */}
          <span
            className="block h-20 w-full"
            style={{
              backgroundImage: `linear-gradient(115deg, ${style.swatch[0]} 0 38%, ${style.swatch[1]} 38% 68%, ${style.swatch[2]} 68% 100%)`,
              borderRadius: `${style.skin.radius}px ${style.skin.radius}px 0 0`,
            }}
          />
          <span className="block px-4 pb-4 pt-3">
            <span className="block hyphens-auto break-words text-[0.9375rem] font-semibold tracking-[-0.015em]">
              {style.name}
            </span>
            <span className="mt-0.5 block hyphens-auto break-words text-[0.8125rem] leading-snug text-muted">
              {style.pitch}
            </span>
          </span>
        </SelectCard>
      ))}
    </div>
  );
}
