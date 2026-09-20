'use client';

import { features } from '@/config/features';
import { Icon } from '@/components/ui/Icon';
import { SelectCard } from '@/components/ui/SelectCard';
import type { StepProps } from './shared';

export function FeatureSelector({ selection, update }: StepProps) {
  const toggle = (id: string) => {
    const next = selection.features.includes(id)
      ? selection.features.filter((f) => f !== id)
      : [...selection.features, id];
    update({ features: next });
  };

  return (
    <div>
      <div role="group" aria-label="Funcionalidades do site" className="grid gap-2.5 sm:grid-cols-2">
        {features.map((feature) => {
          const selected = selection.features.includes(feature.id);
          return (
            <SelectCard
              key={feature.id}
              role="checkbox"
              selected={selected}
              onSelect={() => toggle(feature.id)}
              label={`${feature.name}. ${feature.pitch}`}
              className="flex items-center gap-3.5 p-3.5 pr-11"
              checkClass="right-3 top-1/2 -translate-y-1/2"
            >
              <span
                className={`grid size-10 flex-none place-items-center rounded-xs transition-colors duration-200 ${
                  selected ? 'bg-brand text-white' : 'bg-sunken text-muted group-hover:text-ink'
                }`}
              >
                <Icon name={feature.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.9375rem] font-semibold leading-snug tracking-[-0.015em]">
                  {feature.name}
                </span>
                <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted">{feature.pitch}</span>
              </span>
            </SelectCard>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">
        Escolha quantas quiser. Dá para incluir outras depois, na conversa.
      </p>
    </div>
  );
}
