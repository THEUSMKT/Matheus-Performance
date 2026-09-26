'use client';
/* ==========================================================================
   Pequenos hooks de apresentação compartilhados pela página e pela
   criação da prévia.
   ========================================================================== */
import { useEffect, useState } from 'react';

/** Visitante prefere menos movimento. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Algum campo de texto está em edição — o teclado virtual pode estar aberto. */
export function useTyping(): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    let timer: number | undefined;
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches('input:not([type=checkbox]):not([type=radio]):not([type=color]), textarea, select');
    const onIn = (ev: FocusEvent) => {
      if (!isField(ev.target)) return;
      window.clearTimeout(timer);
      setTyping(true);
    };
    // Espera um instante: o toque que tirou o foco do campo termina antes de a
    // barra voltar para baixo do dedo.
    const onOut = (ev: FocusEvent) => {
      if (!isField(ev.target)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTyping(isField(document.activeElement)), 300);
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}
