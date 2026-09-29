"use client";
/* ==========================================================================
   "Começar novamente": confirmação antes de apagar a prévia.
   Diálogo nativo (showModal): fundo inerte, Esc fecha, foco preso dentro.
   Celular: painel na parte de baixo da tela. Computador: centralizado.
   Abrir não apaga nada; cancelar, fechar e Esc devolvem a pessoa ao mesmo
   ponto (etapa, dados e rolagem). O botão destrutivo nunca recebe o foco
   inicial, e um segundo toque em "Apagar" não repete a ação.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import s from "../landing/Landing.module.css";
import r from "./ResetDialog.module.css";

export function ResetDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  /** Confirmado: o fechamento que vem depois não conta como "cancelar". */
  const confirmed = useRef(false);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const root = document.documentElement;
    if (open && !d.open) {
      confirmed.current = false;
      d.showModal();
      // Trava a rolagem do fundo sem mudar a posição (nada de pular para o topo).
      root.setAttribute("data-modal-open", "");
      keep.current?.focus({ preventScroll: true });
    }
    if (!open && d.open) d.close();
    if (!open) root.removeAttribute("data-modal-open");
    return () => root.removeAttribute("data-modal-open");
  }, [open]);

  function confirm() {
    if (confirmed.current) return;
    confirmed.current = true;
    setErasing(true);
    onConfirm();
  }

  return (
    <dialog
      ref={ref}
      className={r.sheet}
      aria-labelledby="recomecar-titulo"
      aria-describedby="recomecar-texto"
      onClose={() => {
        setErasing(false);
        if (!confirmed.current) onCancel();
      }}
      onClick={(ev) => ev.target === ref.current && ref.current?.close()}
    >
      <div className={r.body}>
        <div className={r.head}>
          <h2 id="recomecar-titulo">Começar uma nova prévia?</h2>
          <button
            type="button"
            className={r.close}
            onClick={() => ref.current?.close()}
            aria-label="Fechar e continuar editando"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <p id="recomecar-texto" className={r.text}>
          Isso apaga as escolhas, os textos, a descrição e o logo desta prévia
          salvos neste aparelho. Não dá para desfazer.
        </p>
        <div className={r.actions}>
          <button
            type="button"
            ref={keep}
            className={s.primary}
            onClick={() => ref.current?.close()}
          >
            Continuar editando
          </button>
          <button
            type="button"
            className={r.erase}
            onClick={confirm}
            disabled={erasing}
            aria-disabled={erasing || undefined}
          >
            Apagar escolhas e recomeçar
          </button>
        </div>
      </div>
    </dialog>
  );
}
