'use client';

import { useState } from 'react';
import { colorSchemes } from '@/config/colors';
import { Icon } from '@/components/ui/Icon';
import { SelectCard } from '@/components/ui/SelectCard';
import type { StepProps } from './shared';

const DEFAULT_CUSTOM = { accent: '#4F46E5', bg: '#FFFFFF' };

export function ColorSelector({ selection, update }: StepProps) {
  const [openCustom, setOpenCustom] = useState(Boolean(selection.customColor));
  const custom = selection.customColor ?? DEFAULT_CUSTOM;

  const useCustom = () => {
    setOpenCustom(true);
    update({ color: null, customColor: custom });
  };

  return (
    <div>
      <div role="radiogroup" aria-label="Paleta de cores" className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {colorSchemes.map((scheme) => (
          <SelectCard
            key={scheme.id}
            selected={selection.color === scheme.id}
            onSelect={() => {
              setOpenCustom(false);
              update({ color: scheme.id, customColor: null });
            }}
            label={`${scheme.name}. ${scheme.pitch}`}
            checkClass="right-3 top-3"
          >
            <span className="flex h-16 w-full">
              {scheme.chips.map((chip) => (
                <span key={chip} className="h-full flex-1" style={{ background: chip }} />
              ))}
            </span>
            <span className="block px-4 pb-4 pt-3">
              <span className="block text-[0.9375rem] font-semibold tracking-[-0.015em]">{scheme.name}</span>
              <span className="mt-0.5 block text-[0.8125rem] text-muted">{scheme.pitch}</span>
            </span>
          </SelectCard>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-line bg-surface p-4 sm:p-5">
        <button
          type="button"
          onClick={useCustom}
          aria-expanded={openCustom}
          className={`flex w-full cursor-pointer items-center gap-3 text-left transition-colors ${
            openCustom ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          <span
            className={`grid size-9 flex-none place-items-center rounded-xs ${
              openCustom ? 'bg-brand text-white' : 'bg-sunken'
            }`}
          >
            <Icon name="Palette" className="size-[18px]" />
          </span>
          <span>
            <span className="block text-[0.9375rem] font-semibold tracking-[-0.015em] text-ink">
              Já tenho minhas cores
            </span>
            <span className="block text-[0.8125rem] text-muted">Use as cores da sua marca.</span>
          </span>
        </button>

        {openCustom && (
          <div className="anim-step mt-4 flex flex-wrap gap-6 border-t border-line pt-4">
            <Swatch
              id="cor-destaque"
              label="Cor de destaque"
              hint="Botões e detalhes"
              value={custom.accent}
              onChange={(accent) => update({ color: null, customColor: { ...custom, accent } })}
            />
            <Swatch
              id="cor-fundo"
              label="Cor de fundo"
              hint="Base das páginas"
              value={custom.bg}
              onChange={(bg) => update({ color: null, customColor: { ...custom, bg } })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Swatch({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="size-12 cursor-pointer rounded-xs border border-line-strong"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold tracking-[-0.01em]">{label}</span>
        <span className="tnum block text-[0.8125rem] text-muted">
          {hint} · {value.toUpperCase()}
        </span>
      </label>
    </div>
  );
}
