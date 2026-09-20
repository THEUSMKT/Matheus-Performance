'use client';

import { features } from '@/config/features';
import {
  FORM_EMAIL,
  emailFormNotice,
  volumeOptions,
  volumeQuestion,
} from '@/config/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectCard } from '@/components/ui/SelectCard';
import type { StepProps } from './shared';

export function FeatureSelector({ selection, update }: StepProps) {
  const toggle = (id: string) => {
    const marcada = selection.features.includes(id);
    const next = marcada
      ? selection.features.filter((f) => f !== id)
      : [...selection.features, id];
    // Desmarcar o formulário por e-mail também limpa o volume estimado.
    update({ features: next, ...(id === FORM_EMAIL && marcada ? { emailVolume: null } : {}) });
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
                {feature.hint && (
                  <span className="mt-1 block text-[0.75rem] leading-snug text-faint">{feature.hint}</span>
                )}
              </span>
            </SelectCard>
          );
        })}
      </div>

      {selection.features.includes(FORM_EMAIL) && <EmailFormNotice selection={selection} update={update} />}

      <p className="mt-4 text-sm text-muted">
        Escolha quantas quiser. Dá para incluir outras depois, na conversa.
      </p>
    </div>
  );
}

/** Caixa discreta: só existe enquanto o recebimento por e-mail está marcado. */
function EmailFormNotice({ selection, update }: StepProps) {
  const escolhida = volumeOptions.find((v) => v.id === selection.emailVolume);

  return (
    <aside className="anim-step mt-3 rounded-md border border-brand-line bg-brand-soft/60 p-4 sm:p-5">
      <div className="flex gap-3">
        <Icon name="Info" className="mt-0.5 size-[18px] flex-none text-brand" strokeWidth={2} />
        <div className="min-w-0">
          <h4 className="text-[0.9375rem] font-semibold tracking-[-0.015em]">{emailFormNotice.title}</h4>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{emailFormNotice.body}</p>
          <p className="mt-2 text-[0.8125rem] font-medium">{emailFormNotice.limit}</p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{emailFormNotice.separateCost}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-brand-line/70 pt-4">
        <p className="text-[0.8125rem] font-medium">{volumeQuestion}</p>
        <div role="radiogroup" aria-label={volumeQuestion} className="mt-2.5 flex flex-wrap gap-2">
          {volumeOptions.map((opcao) => {
            const marcada = selection.emailVolume === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                role="radio"
                aria-checked={marcada}
                onClick={() => update({ emailVolume: marcada ? null : opcao.id })}
                className={`h-10 cursor-pointer rounded-sm border px-4 text-[0.8125rem] font-medium transition-[background-color,border-color,color] duration-200 ${
                  marcada
                    ? 'border-brand bg-brand text-white'
                    : 'border-line-strong bg-surface text-ink hover:border-ink/25'
                }`}
              >
                {opcao.label}
              </button>
            );
          })}
        </div>

        {escolhida && (
          <p key={escolhida.id} className="anim-step mt-3 text-[0.8125rem] leading-relaxed text-muted">
            {escolhida.answer}
          </p>
        )}
      </div>

      <p className="mt-4 border-t border-brand-line/70 pt-3 text-[0.75rem] leading-relaxed text-faint">
        {emailFormNotice.firstMonth}
      </p>
    </aside>
  );
}
