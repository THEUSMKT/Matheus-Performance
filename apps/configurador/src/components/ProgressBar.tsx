'use client';

import { Icon } from './ui/Icon';

type Props = {
  step: number;
  total: number;
  /** Índices já respondidos — habilitam o clique para voltar. */
  answered: boolean[];
  onJump: (index: number) => void;
  onReset: () => void;
  /** Substitui o "Etapa X de Y" — usado na tela de resumo. */
  label?: string;
};

export function ProgressBar({ step, total, answered, onJump, onReset, label }: Props) {
  const done = answered.filter(Boolean).length;

  return (
    <div className="border-b border-line bg-surface/80 px-5 py-4 backdrop-blur-sm sm:px-7">
      <div className="flex items-center justify-between gap-4">
        <p className="tnum text-sm font-semibold tracking-[-0.01em]">
          {label ?? `Etapa ${step + 1} de ${total}`}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="-my-3 inline-flex cursor-pointer items-center gap-1.5 py-3 text-[0.8125rem] text-muted transition-colors hover:text-ink"
        >
          <Icon name="RotateCcw" className="size-3.5" />
          Começar de novo
        </button>
      </div>

      <div
        className="mt-3 flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-label={`Etapa ${step + 1} de ${total}, ${done} respondidas`}
      >
        {Array.from({ length: total }, (_, i) => {
          const reachable = i <= step || answered[i];
          return (
            <button
              key={i}
              type="button"
              disabled={!reachable}
              onClick={() => onJump(i)}
              aria-label={`Ir para a etapa ${i + 1}`}
              className={`relative h-1.5 flex-1 rounded-full transition-[background-color,opacity] duration-300 before:absolute before:inset-x-0 before:-inset-y-5 before:content-[''] ${
                reachable ? 'cursor-pointer' : 'cursor-default'
              } ${i < step ? 'bg-brand/45' : i === step ? 'bg-brand' : 'bg-line'}`}
            />
          );
        })}
      </div>
    </div>
  );
}
