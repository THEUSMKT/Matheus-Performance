'use client';
/* ==========================================================================
   Pacotes no configurador. Uma só peça de escolha (PackageChooser) aparece
   na etapa "Escolha o pacote do seu site" e na janela "Alterar pacote"; a
   comparação (PackageCompare) é a mesma da apresentação. Tudo vem de
   config/packages.ts.

   Trocar de pacote é sempre uma escolha do visitante. Para um pacote menor,
   a caixa mostra o que sai da versão ativa e o novo preço antes de aplicar;
   o que sai fica guardado no rascunho (ParkedNote) para ser restaurado.
   Com mais seções do que o limite, o visitante escolhe quais manter.
   ========================================================================== */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';
import { brl, customNeeds, externalCosts, packageById, packageComparison, packageDiffs, packages, priceNotes, rank, type PackageId } from '@/config/packages';
import { currentPackage, investmentLabel, isCustom, recommendation, restorable, sectionName, sections, switchPackage, type PackageSwitch, type Project } from '@/lib/project';
import s from '../landing/Landing.module.css';
import { LazyDetails } from '../landing/Controls';
import b from './Builder.module.css';

/**
 * Resumo compacto, sempre à vista: "Profissional · R$ 750 · Alterar pacote".
 * Enquanto a pessoa não escolheu, diz que é o pacote inicial, sem contratação.
 */
export function PriceBar({ p, onChange }: { p: Project; onChange: () => void }) {
  const custom = isCustom(p);
  return (
    <div className={b.priceBar}>
      <span className={b.priceMain}>
        <span className={b.pricePkg}>{custom ? 'Projeto personalizado' : currentPackage(p).name}</span>
        <span aria-hidden="true"> · </span>
        <strong data-testid="preco">{investmentLabel(p)}</strong>
      </span>
      <button type="button" className={b.textButton} onClick={onChange}>
        Alterar pacote
      </button>
      {!p.pkgChosen && !custom && <span className={b.pkgInitial}>Pacote inicial: você pode mudar, e nada é contratado agora.</span>}
    </div>
  );
}

/**
 * Comparação curta, alinhada por recurso. No computador, uma tabela; no
 * celular, um bloco por recurso com os três pacotes um embaixo do outro
 * (mesmas informações, sem tabela larga para deslizar).
 */
export function PackageCompare({ current, caption = 'Comparar pacotes' }: { current?: PackageId; caption?: string }) {
  const rows = packageComparison();
  const cellText = (c: string) =>
    c === 'Incluído' ? (
      <>
        <Check aria-hidden="true" className={b.compareCheck} /> Incluído
      </>
    ) : (
      c
    );
  return (
    <>
      <div className={b.compareWrap}>
        <table className={b.compare}>
          <caption className={s.srOnly}>{caption}</caption>
          <thead>
            <tr>
              <td />
              {packages.map((pkg) => (
                <th key={pkg.id} scope="col" data-current={pkg.id === current || undefined}>
                  {pkg.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {r.cells.map((c, i) => (
                  <td key={i} data-current={packages[i].id === current || undefined} data-off={c.startsWith('A partir') || undefined}>
                    {cellText(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className={b.compareBlocks} aria-label={caption}>
        {rows.map((r) => (
          <div key={r.label} className={b.compareBlock}>
            <dt>{r.label}</dt>
            {r.cells.map((c, i) => (
              <dd key={i} data-current={packages[i].id === current || undefined} data-off={c.startsWith('A partir') || undefined}>
                <span>{packages[i].name}</span>
                <b>{cellText(c)}</b>
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </>
  );
}

type Confirm = { to: PackageId; keep: string[]; sw: PackageSwitch };

/**
 * Escolha compacta: os três pacotes lado a lado (nome e preço, estado
 * selecionado inequívoco) e, abaixo, os detalhes só do selecionado — nada de
 * três listas longas ao mesmo tempo. Tocar escolhe (com desfazer); para um
 * pacote menor, confirma antes, mostrando o que sai e o novo preço.
 */
export function PackageChooser({ p, onApply }: { p: Project; onApply: (to: PackageId, next: Project) => void; headingLevel?: 2 | 3 }) {
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const rec = recommendation(p);
  const selected = currentPackage(p);
  const shown = confirm ? packageById(confirm.to) : selected;

  function choose(to: PackageId) {
    if (to === p.pkg) return setConfirm(null);
    const sw = switchPackage(p, to);
    const down = rank(to) < rank(p.pkg);
    if (down && (sw.removed.length || sw.overLimit)) setConfirm({ to, keep: sw.overLimit ? sw.overLimit.optional.slice(0, sw.overLimit.room) : [], sw });
    else {
      setConfirm(null);
      onApply(to, sw.project);
    }
  }

  function setKeep(keep: string[]) {
    if (!confirm) return;
    setConfirm({ ...confirm, keep, sw: switchPackage(p, confirm.to, keep) });
  }

  function onKey(e: KeyboardEvent, i: number) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const j = (i + step + packages.length) % packages.length;
    refs.current[j]?.focus();
    choose(packages[j].id);
  }

  return (
    <div className={b.pkgPicker}>
      <div role="radiogroup" aria-label="Pacote" className={b.pkgSeg}>
        {packages.map((pkg, i) => {
          const on = pkg.id === p.pkg && !isCustom(p);
          return (
            <button
              key={pkg.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (isCustom(p) && i === 0) ? 0 : -1}
              data-pending={confirm?.to === pkg.id || undefined}
              onClick={() => choose(pkg.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className={b.pkgSegName}>{pkg.name}</span>
              <span className={b.pkgSegPrice}>{brl(pkg.price)}</span>
              {on && (
                <span className={b.pkgSegCheck}>
                  <Check aria-hidden="true" /> Selecionado
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={b.pkgDetail} aria-live="polite">
        <p className={b.pkgDetailFor}>
          <strong>{shown.name}</strong> — {shown.forWhom}
        </p>
        <ul className={b.pkgBenefits}>
          {packageDiffs(shown).map((h) => (
            <li key={h}>
              <Check aria-hidden="true" /> {h}
            </li>
          ))}
        </ul>
        <p className={b.muted}>
          Prazo: {shown.deadline}, {priceNotes.deadlineStart}.
        </p>
        {!confirm && rec.pkg !== p.pkg && rank(rec.pkg) > rank(p.pkg) && <p className={b.pkgWhy}>{rec.reason}</p>}

        {confirm && (
          <div className={s.confirmBox} role="alertdialog" aria-labelledby="troca-pacote">
            <p id="troca-pacote">
              Trocar para o {shown.name} — {brl(shown.price)} no total?
            </p>
            {confirm.sw.overLimit && (
              <fieldset className={b.keepPick}>
                <legend>
                  O {shown.name} comporta até {shown.maxSections} seções. Escolha até {confirm.sw.overLimit.room} para manter além de apresentação e contato:
                </legend>
                {confirm.sw.overLimit.optional.map((id) => {
                  const on = confirm.keep.includes(id);
                  const full = !on && confirm.keep.length >= confirm.sw.overLimit!.room;
                  return (
                    <label key={id} className={s.checkRow}>
                      <input type="checkbox" checked={on} disabled={full} onChange={(ev) => setKeep(ev.target.checked ? [...confirm.keep, id] : confirm.keep.filter((x) => x !== id))} />
                      <span>
                        <strong>{sectionName(p, id)}</strong>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            )}
            {confirm.sw.removed.length > 0 && (
              <>
                <p className={s.hint}>Saem da versão ativa (ficam guardados no seu rascunho, para restaurar se voltar a um pacote maior):</p>
                <ul className={b.removed}>
                  {confirm.sw.removed.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            )}
            <div className={s.actionRow}>
              <button
                type="button"
                className={`${s.primary} ${s.small}`}
                autoFocus
                onClick={() => {
                  const c = confirm;
                  setConfirm(null);
                  onApply(c.to, c.sw.project);
                }}
              >
                Trocar para o {shown.name}
              </button>
              <button type="button" className={`${s.secondary} ${s.small}`} onClick={() => setConfirm(null)}>
                Manter o {selected.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * O que ficou guardado numa troca para um pacote menor: restaura quando o
 * pacote atual comporta; senão, diz a partir de qual pacote volta.
 */
export function ParkedNote({ p, onRestore }: { p: Project; onRestore: () => void }) {
  const fits = restorable(p);
  const parkedNames = [...p.parked.sections.map((id) => sectionName(p, id)), ...(p.parked.form ? ['Formulário para WhatsApp'] : [])];
  if (!parkedNames.length && !fits.length) return null;
  if (fits.length)
    return (
      <div className={b.parked} role="status">
        <p>
          Guardamos do pacote anterior: <strong>{fits.join(', ')}</strong>.
        </p>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={onRestore}>
          Restaurar no {currentPackage(p).name}
        </button>
      </div>
    );
  const needs = p.parked.sections.map((id) => sections.find((x) => x.id === id)!.min).concat(p.parked.form ? ['profissional'] : []);
  const from = packageById(needs.reduce((a, c) => (rank(c) > rank(a) ? c : a), 'essencial'));
  return (
    <p className={b.parkedQuiet}>
      Guardados no rascunho, fora do pacote atual: {parkedNames.join(', ')}. {rank(from.id) > rank(p.pkg) ? `Voltam a partir do ${from.name}.` : 'Desmarque uma seção para abrir espaço.'}
    </p>
  );
}

/** Etapa "Escolha o pacote do seu site". */
export function StepPackage({ p, onApply, onRestore, onCustom }: { p: Project; onApply: (to: PackageId, next: Project) => void; onRestore: () => void; onCustom: () => void }) {
  return (
    <>
      <p className={b.hint}>Todos os pacotes têm aparência profissional. O valor é o total do desenvolvimento. Você pode mudar depois.</p>
      <p className={b.currentPick} aria-live="polite">
        {isCustom(p) ? (
          <>Seu projeto pede orçamento personalizado. O pacote abaixo é a referência da prévia.</>
        ) : (
          <>
            Sua prévia está no <strong>{currentPackage(p).name}</strong> — {brl(currentPackage(p).price)} no total.
          </>
        )}
      </p>
      <ParkedNote p={p} onRestore={onRestore} />
      <PackageChooser p={p} onApply={onApply} />
      <LazyDetails className={s.details} summary="Comparar pacotes">
        <PackageCompare current={p.pkg} />
      </LazyDetails>
      <p className={b.muted} style={{ marginTop: 12 }}>
        {priceNotes.payment}{' '}
        <button type="button" className={b.textButton} onClick={onCustom}>
          Preciso de algo fora dos pacotes
        </button>
      </p>
    </>
  );
}

export function PackageDialog({
  p,
  open,
  onClose,
  onChoose,
  onCustom,
}: {
  p: Project;
  open: boolean;
  onClose: () => void;
  onChoose: (to: PackageId, project: Project) => void;
  onCustom: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${s.dialog} ${b.pkgDialog}`}
      aria-labelledby="incluido-titulo"
      onClose={onClose}
      onClick={(ev) => ev.target === ref.current && onClose()}
    >
      <div className={s.demoHead}>
        <div>
          <h2 id="incluido-titulo">Alterar pacote</h2>
          <p>{priceNotes.payment}</p>
        </div>
        <button type="button" className={s.closeButton} onClick={onClose} aria-label="Fechar" autoFocus>
          <X aria-hidden="true" />
        </button>
      </div>
      <div className={b.pkgBody}>
        {open && <PackageChooser p={p} onApply={onChoose} />}
        <LazyDetails className={s.details} summary="Comparar pacotes">
          <PackageCompare current={p.pkg} />
        </LazyDetails>
        <div className={b.pkgExtra}>
          <h3>O que cada pacote inclui</h3>
          {packages.map((pkg) => (
            <details key={pkg.id} className={s.details}>
              <summary>
                {pkg.name} — {brl(pkg.price)}
              </summary>
              <div className={s.detailsBody}>
                <ul className={s.checkList}>
                  {pkg.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={b.muted} style={{ marginTop: 8 }}>
                  Prazo: {pkg.deadline}, {priceNotes.deadlineStart}.
                </p>
              </div>
            </details>
          ))}
        </div>
        <div className={b.pkgExtra}>
          <h3>Pago à parte, direto aos fornecedores</h3>
          <p className={b.muted}>{externalCosts.join(' · ')}.</p>
        </div>
        <div className={b.pkgExtra}>
          <h3>Fora dos pacotes (orçamento separado)</h3>
          <p className={b.muted}>{customNeeds.map((n) => n.name).join(' · ')}.</p>
          <button type="button" className={`${s.secondary} ${s.small}`} style={{ marginTop: 10 }} onClick={onCustom}>
            Preciso de um projeto personalizado
          </button>
        </div>
      </div>
    </dialog>
  );
}
