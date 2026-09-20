'use client';

import { siteTypes } from '@/config/siteTypes';
import { Icon } from '@/components/ui/Icon';
import { SelectCard } from '@/components/ui/SelectCard';
import type { StepProps } from './shared';

export function TypeSelector({ selection, update }: StepProps) {
  return (
    <div role="radiogroup" aria-label="Tipo de site" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {siteTypes.map((type) => {
        const selected = selection.type === type.id;
        return (
          <SelectCard
            key={type.id}
            selected={selected}
            onSelect={() => update({ type: type.id })}
            label={`${type.name}. ${type.pitch}`}
            checkClass="right-3 top-1/2 -translate-y-1/2 sm:top-3 sm:translate-y-0"
            className="flex items-center gap-4 p-4 pr-11 sm:block sm:p-5"
          >
            <span
              className={`grid size-11 flex-none place-items-center rounded-sm transition-colors duration-200 sm:mb-4 ${
                selected ? 'bg-brand text-white' : 'bg-sunken text-muted group-hover:text-ink'
              }`}
            >
              <Icon name={type.icon} className="size-[22px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:pr-7">
                {type.name}
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-muted">{type.pitch}</span>
            </span>
          </SelectCard>
        );
      })}
    </div>
  );
}
