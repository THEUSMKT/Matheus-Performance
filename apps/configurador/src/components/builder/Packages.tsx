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
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Check, X } from 'lucide-react';
import { brl, customNeeds, externalCosts, packageById, packageComparison, packageHighlights, packages, priceNotes, rank, type PackageId } from '@/config/packages';
import { currentPackage, investmentLabel, isCustom, recommendation, restorable, sectionName, sections, switchPackage, type PackageSwitch, type Project } from '@/lib/project';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

/** Resumo compacto, sempre à vista: "Profissional · R$ 750 · Alterar pacote". */
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
    </div>
  );
}

/** Comparação curta, alinhada por recurso. */
export function PackageCompare({ current, caption = 'Comparar pacotes' }: { current?: PackageId; caption?: string }) {
  const rows = packageComparison();
  return (
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
                  {c === 'Incluído' ? (
                    <>
                      <Check aria-hidden="true" className={b.compareCheck} /> Incluído
                    </>
                  ) : (
                    c
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Confirm = { to: PackageId; keep: string[]; sw: PackageSwitch };

/**
 * Os três pacotes como opções. O cartão inteiro escolhe (sem botões
 * aninhados); o botão diz o pacote ("Escolher Profissional"). Para um
 * pacote menor, confirma antes, mostrando o que sai e o novo preço.
 */
export function PackageChooser({ p, onApply, headingLevel = 3 }: { p: Project; onApply: (to: PackageId, next: Project) => void; headingLevel?: 2 | 3 }) {
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const rec = recommendation(p);
  const H = `h${headingLevel}` as 'h2' | 'h3';

  function choose(to: PackageId) {
    if (to === p.pkg) return;
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

  const onCard = (to: PackageId) => (ev: MouseEvent) => {
    if ((ev.target as HTMLElement).closest('button, a, input, label, [role=alertdialog]')) return;
    choose(to);
  };

  return (
    <ul className={b.pkgChoose} aria-label="Pacotes">
      {packages.map((pkg) => {
        const current = pkg.id === p.pkg && !isCustom(p);
        const suggested = pkg.id === rec.pkg && !current && rank(rec.pkg) > rank(p.pkg);
        const open = confirm?.to === pkg.id ? confirm : null;
        return (
          <li key={pkg.id} className={b.pkgOption} data-current={current || undefined} onClick={onCard(pkg.id)}>
            <div className={b.pkgHead}>
              <H>{pkg.name}</H>
              <strong>{brl(pkg.price)}</strong>
            </div>
            <p className={b.muted}>{pkg.forWhom}</p>
            <ul className={b.pkgBenefits}>
              {packageHighlights(pkg).map((h) => (
                <li key={h}>
                  <Check aria-hidden="true" /> {h}
                </li>
              ))}
            </ul>
            {suggested && <p className={b.pkgWhy}>{rec.reason}</p>}
            {current ? (
              <p className={b.pkgSelected}>
                <Check aria-hidden="true" /> Selecionado
              </p>
            ) : (
              <button type="button" className={`${s.secondary} ${s.small} ${b.pkgPick}`} onClick={() => choose(pkg.id)} aria-describedby={`preco-${pkg.id}`}>
                Escolher {pkg.name}
              </button>
            )}
            <span id={`preco-${pkg.id}`} className={s.srOnly}>
              {brl(pkg.price)} no total
            </span>
            {open && (
              <div className={s.confirmBox} role="alertdialog" aria-labelledby={`troca-${pkg.id}`}>
                <p id={`troca-${pkg.id}`}>
                  Trocar para o {pkg.name} — {brl(pkg.price)} no total?
                </p>
                {open.sw.overLimit && (
                  <fieldset className={b.keepPick}>
                    <legend>
                      O {pkg.name} comporta até {pkg.maxSections} seções. Escolha até {open.sw.overLimit.room} para manter além de apresentação e contato:
                    </legend>
                    {open.sw.overLimit.optional.map((id) => {
                      const on = open.keep.includes(id);
                      const full = !on && open.keep.length >= open.sw.overLimit!.room;
                      return (
                        <label key={id} className={s.checkRow}>
                          <input type="checkbox" checked={on} disabled={full} onChange={(ev) => setKeep(ev.target.checked ? [...open.keep, id] : open.keep.filter((x) => x !== id))} />
                          <span>
                            <strong>{sectionName(p, id)}</strong>
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>
                )}
                {open.sw.removed.length > 0 && (
                  <>
                    <p className={s.hint}>Saem da versão ativa (ficam guardados no seu rascunho, para restaurar se voltar a um pacote maior):</p>
                    <ul className={b.removed}>
                      {open.sw.removed.map((r) => (
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
                      setConfirm(null);
                      onApply(open.to, open.sw.project);
                    }}
                  >
                    Trocar para o {pkg.name}
                  </button>
                  <button type="button" className={`${s.secondary} ${s.small}`} onClick={() => setConfirm(null)}>
                    Manter o {currentPackage(p).name}
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
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
      <PackageChooser p={p} onApply={onApply} headingLevel={2} />
      <details className={s.details}>
        <summary>Comparar pacotes</summary>
        <div className={s.detailsBody}>
          <PackageCompare current={p.pkg} />
        </div>
      </details>
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
        <details className={s.details}>
          <summary>Comparar pacotes</summary>
          <div className={s.detailsBody}>
            <PackageCompare current={p.pkg} />
          </div>
        </details>
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
