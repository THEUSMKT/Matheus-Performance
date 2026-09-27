'use client';
/* ==========================================================================
   Controles acessíveis reutilizados no configurador.
   Grupo de opções: padrão ARIA radiogroup (setas movem e escolhem, Tab
   entra e sai do grupo). Confirmação: caixa inline, sem janela surpresa.
   ========================================================================== */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import s from './Landing.module.css';

export type RadioOption = {
  id: string;
  label: string;
  hint?: ReactNode;
  aside?: ReactNode;
  lead?: ReactNode;
  /** Selo curto ao lado do rótulo, ex.: "Sugerido para seu objetivo". */
  badge?: string;
};

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
  /** Título já exibido por fora; o grupo continua rotulado. */
  hideLabel?: boolean;
  hint?: string;
  value: string;
  options: RadioOption[];
  onChange: (id: string) => void;
  /** option = linha com marcador; chip = pílula; tile = bloco com ícone (grade 2 colunas). */
  variant?: 'option' | 'chip' | 'tile';
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
  const groupClass = variant === 'chip' ? s.chips : variant === 'tile' ? s.tiles : `${s.options} ${columns ? s.twoCol : ''}`;
  const itemClass = variant === 'chip' ? s.chip : variant === 'tile' ? s.tileOpt : s.option;
  return (
    <div className={hideLabel ? undefined : s.block}>
      <span className={hideLabel ? s.srOnly : s.blockTitle} id={groupId}>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <div role="radiogroup" aria-labelledby={groupId} className={groupClass}>
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
              className={itemClass}
              onClick={() => onChange(o.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {variant === 'chip' ? (
                o.label
              ) : variant === 'tile' ? (
                <>
                  {o.lead}
                  <span>
                    {o.label}
                    {o.badge && <small className={s.tileBadge}>{o.badge}</small>}
                  </span>
                </>
              ) : (
                <>
                  <span className={s.radioDot} aria-hidden="true" />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {o.lead}
                    <strong>
                      {o.label}
                      {o.badge && <span className={s.suggest}>{o.badge}</span>}
                    </strong>
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
  badge,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  hint?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <label className={s.checkRow}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>
          {title}
          {badge && <span className={s.suggest}>{badge}</span>}
        </strong>
        {hint && <small>{hint}</small>}
      </span>
      {aside && <b className={s.price}>{aside}</b>}
    </label>
  );
}

export type Pending = {
  title: string;
  /** Explicação curta. Sem ela, lista o que muda em `changes`. */
  detail?: string;
  changes?: string[];
  confirmLabel: string;
  cancelLabel?: string;
  apply: () => void;
  /** Onde a caixa aparece (perto do controle que a abriu). */
  anchor?: string;
};

export function ConfirmBox({ pending, onCancel }: { pending: Pending; onCancel: () => void }) {
  return (
    <div className={s.confirmBox} role="alertdialog" aria-labelledby="confirmar-titulo" aria-describedby="confirmar-detalhe">
      <p id="confirmar-titulo">{pending.title}</p>
      <p id="confirmar-detalhe" className={s.hint}>
        {pending.detail ?? `Isso substitui: ${(pending.changes ?? []).join(', ')}. Nome, textos e observações continuam como estão.`}
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
          {pending.cancelLabel ?? 'Manter minhas escolhas'}
        </button>
      </div>
    </div>
  );
}
