'use client';
/* ==========================================================================
   Controles acessíveis reutilizados no configurador.
   Grupo de opções: padrão ARIA radiogroup (setas movem e escolhem, Tab
   entra e sai do grupo). Confirmação: caixa inline, sem janela surpresa.
   ========================================================================== */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
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
  hideLabel = false,
}: {
  label: string;
  /** Título já exibido por fora (ex.: na sanfona); o grupo continua rotulado. */
  hideLabel?: boolean;
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
    <div className={hideLabel ? undefined : s.block}>
      <span className={hideLabel ? s.srOnly : s.blockTitle} id={groupId}>
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

/**
 * Bloco do momento 3. No computador é um bloco com título; no celular vira
 * sanfona (uma aberta por vez) e o cabeçalho fechado mostra a escolha atual.
 */
export function Fold({
  id,
  title,
  short,
  value,
  note,
  narrow,
  open,
  onToggle,
  desktopTitle = true,
  children,
}: {
  id: string;
  title: string;
  /** Título mais curto para o cabeçalho da sanfona no celular. */
  short?: string;
  value: string;
  note?: string;
  narrow: boolean;
  open: boolean;
  onToggle: () => void;
  desktopTitle?: boolean;
  children: ReactNode;
}) {
  if (!narrow) {
    if (!desktopTitle) return <>{children}</>;
    return (
      <div className={s.block}>
        <span className={s.blockTitle}>
          {title}
          {note && <small>{note}</small>}
        </span>
        {children}
      </div>
    );
  }
  const headId = `dobra-${id}`;
  const panelId = `painel-${id}`;
  return (
    <div className={s.fold} data-open={open}>
      <h4 className={s.foldHead}>
        <button type="button" id={headId} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          <span>
            <span className={s.foldTitle}>{short ?? title}</span>
            <span className={s.foldValue}> · {value}</span>
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
      </h4>
      <div id={panelId} role="region" aria-labelledby={headId} hidden={!open} className={s.foldBody}>
        {note && <p className={s.hint}>{note}</p>}
        {children}
      </div>
    </div>
  );
}
