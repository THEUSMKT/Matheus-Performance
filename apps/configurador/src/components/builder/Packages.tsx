'use client';
/* ==========================================================================
   Preço sempre à vista ("Desenvolvimento: R$ 750") e a janela "Ver o que
   está incluído", com os três pacotes. Trocar de pacote é sempre uma
   escolha do visitante: para um pacote menor, a janela mostra o que sai
   antes de aplicar.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { brl, customNeeds, externalCosts, packages, priceNotes, rank, type PackageId } from '@/config/packages';
import { currentPackage, investmentLabel, isCustom, recommendation, switchPackage, type Project } from '@/lib/project';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

export function PriceBar({ p, onIncluded }: { p: Project; onIncluded: () => void }) {
  return (
    <div className={b.priceBar}>
      <span className={b.priceMain}>
        Desenvolvimento: <strong data-testid="preco">{investmentLabel(p)}</strong>
      </span>
      <span className={b.pricePkg}>{isCustom(p) ? 'Projeto personalizado' : `Pacote ${currentPackage(p).name}`}</span>
      <button type="button" className={b.textButton} onClick={onIncluded}>
        Ver o que está incluído
      </button>
    </div>
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
  const [confirm, setConfirm] = useState<{ to: PackageId; project: Project; removed: string[] } | null>(null);
  const rec = recommendation(p);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (!open) setConfirm(null);
  }, [open]);

  function choose(to: PackageId) {
    const next = switchPackage(p, to);
    if (rank(to) < rank(p.pkg) && next.removed.length) setConfirm({ to, ...next });
    else onChoose(to, next.project);
  }

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
          <h2 id="incluido-titulo">O que está incluído</h2>
          <p>{priceNotes.payment}</p>
        </div>
        <button type="button" className={s.closeButton} onClick={onClose} aria-label="Fechar" autoFocus>
          <X aria-hidden="true" />
        </button>
      </div>
      <div className={b.pkgBody}>
        <ul className={b.pkgList}>
          {packages.map((pkg) => {
            const current = pkg.id === p.pkg;
            return (
              <li key={pkg.id} className={b.pkgCard} data-current={current || undefined}>
                <div className={b.pkgHead}>
                  <h3>{pkg.name}</h3>
                  <strong>{brl(pkg.price)}</strong>
                </div>
                <p className={b.muted}>{pkg.forWhom}</p>
                {(current || pkg.id === rec.pkg) && (
                  <p className={b.pkgFlags}>
                    {current && <span className={b.flagCurrent}>Seu pacote</span>}
                    {pkg.id === rec.pkg && !current && <span className={b.flagRec}>Sugerido para o seu site</span>}
                  </p>
                )}
                <ul className={s.checkList}>
                  {pkg.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={b.muted} style={{ marginTop: 8 }}>
                  Prazo: {pkg.deadline}, {priceNotes.deadlineStart}.
                </p>
                {!current && (
                  <button type="button" className={`${s.secondary} ${s.small} ${b.pkgChoose}`} onClick={() => choose(pkg.id)}>
                    Escolher o {pkg.name} — {brl(pkg.price)} no total
                  </button>
                )}
                {confirm?.to === pkg.id && (
                  <div className={s.confirmBox} role="alertdialog" aria-labelledby="troca-titulo">
                    <p id="troca-titulo">No {pkg.name}, saem da sua prévia:</p>
                    <ul className={b.removed}>
                      {confirm.removed.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <div className={s.actionRow}>
                      <button type="button" className={`${s.primary} ${s.small}`} autoFocus onClick={() => onChoose(confirm.to, confirm.project)}>
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
        {rec.pkg !== p.pkg && <p className={b.recReason}>{rec.reason}</p>}

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
