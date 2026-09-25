'use client';
/* ==========================================================================
   Controles acessíveis reutilizados no configurador.
   Grupo de opções: padrão ARIA radiogroup (setas movem e escolhem, Tab
   entra e sai do grupo). Confirmação: caixa inline, sem janela surpresa.
   ========================================================================== */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import s from './Landing.module.css';

export type RadioOption = { id: string; label: string; hint?: ReactNode; aside?: ReactNode; lead?: ReactNode };

export function Radios({
  label,
  hint,
  value,
  options,
  onChange,
  variant = 'option',
  columns = false,
}: {
  label: string;
  hint?: string;
  value: string;
  options: RadioOption[];
  onChange: (id: string) => void;
  variant?: 'option' | 'chip';
  columns?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = options.findIndex((o) => o.id === value);

  function onKey(e: KeyboardEvent, i: number) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = -1;
    if (e.key in keys) next = (i + keys[e.key] + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(options[next].id);
  }

  const groupId = `g-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className={s.block}>
      <span className={s.blockTitle} id={groupId}>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <div role="radiogroup" aria-labelledby={groupId} className={variant === 'chip' ? s.chips : `${s.options} ${columns ? s.twoCol : ''}`}>
        {options.map((o, i) => {
          const checked = o.id === value;
          return (
            <button
              key={o.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (current < 0 && i === 0) ? 0 : -1}
              className={variant === 'chip' ? s.chip : s.option}
              onClick={() => onChange(o.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {variant === 'chip' ? (
                o.label
              ) : (
                <>
                  <span className={s.radioDot} aria-hidden="true" />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {o.lead}
                    <strong>{o.label}</strong>
                    {o.hint && <small>{o.hint}</small>}
                  </span>
                  {o.aside && <span className={s.price}>{o.aside}</span>}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Check({
  checked,
  onChange,
  title,
  hint,
  aside,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  hint?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={s.checkRow}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>{title}</strong>
        {hint && <small>{hint}</small>}
      </span>
      {aside && <b className={s.price}>{aside}</b>}
    </label>
  );
}

export type Pending = { title: string; changes: string[]; confirmLabel: string; apply: () => void };

export function ConfirmBox({ pending, onCancel }: { pending: Pending; onCancel: () => void }) {
  return (
    <div className={s.confirmBox} role="alertdialog" aria-labelledby="confirmar-titulo" aria-describedby="confirmar-detalhe">
      <p id="confirmar-titulo">{pending.title}</p>
      <p id="confirmar-detalhe" className={s.hint}>
        Isso substitui: {pending.changes.join(', ')}. Nome, textos, orçamento e contato continuam como estão.
      </p>
      <div className={s.actionRow}>
        <button
          type="button"
          className={`${s.primary} ${s.small}`}
          autoFocus
          onClick={() => {
            pending.apply();
            onCancel();
          }}
        >
          {pending.confirmLabel}
        </button>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={onCancel}>
          Manter minhas escolhas
        </button>
      </div>
    </div>
  );
}
