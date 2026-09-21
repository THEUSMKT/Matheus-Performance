'use client';

/* ==========================================================================
   Casca de seleção: cuida só do estado (borda, marca de confirmação,
   acessibilidade). O miolo de cada etapa é livre — é o que impede a página
   de virar uma sequência de cards idênticos.
   ========================================================================== */
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

type Props = {
  selected: boolean;
  onSelect: () => void;
  /** 'radio' para escolha única, 'checkbox' para múltipla. */
  role?: 'radio' | 'checkbox';
  label: string;
  children: ReactNode;
  className?: string;
  /** Posição da marca de confirmação. */
  checkClass?: string;
};

export function SelectCard({
  selected,
  onSelect,
  role = 'radio',
  label,
  children,
  className = '',
  checkClass = 'right-3 top-3',
}: Props) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-md border text-left transition-[border-color,background-color,box-shadow] duration-200 ${
        selected
          ? 'border-brand bg-brand-soft/55 shadow-soft'
          : 'border-line bg-surface hover:border-line-strong hover:shadow-soft'
      } ${className}`}
    >
      {children}
      <span
        className={`pointer-events-none absolute grid size-6 place-items-center rounded-full bg-brand text-white ${checkClass} ${
          selected ? 'anim-pop' : 'hidden'
        }`}
      >
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </span>
    </button>
  );
}
