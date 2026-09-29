'use client';
/* ==========================================================================
   Carrossel com rolagem nativa (scroll-snap): o índice segue a rolagem real
   (dedo, trackpad, teclado, setas ou bolinhas), o gesto vertical continua
   rolando a página e "reduzir movimento" troca a rolagem suave por salto.
   No computador, o mouse também arrasta (clicar e puxar para o lado).
   Um arraste de mais de ~8 px cancela o clique que viria depois — arrastar
   em cima de uma captura não abre o link.
   ========================================================================== */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const DRAG_THRESHOLD = 8;

export function useCarousel<T extends HTMLElement>(list: RefObject<T | null>) {
  const [index, setIndex] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  /** Houve arraste desde o último pointerdown: o clique seguinte é descartado. */
  const dragged = useRef(false);

  const items = () => [...(list.current?.children ?? [])] as HTMLElement[];

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const all = [...el.children] as HTMLElement[];
      if (!all.length) return;
      setScrollable(el.scrollWidth > el.clientWidth + 4);
      const start = all[0].offsetLeft;
      let best = 0;
      all.forEach((it, i) => {
        if (Math.abs(it.offsetLeft - start - el.scrollLeft) < Math.abs(all[best].offsetLeft - start - el.scrollLeft)) best = i;
      });
      // No fim da rolagem, o último é o visível mesmo que não chegue ao início.
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = all.length - 1;
      setIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [list]);

  const go = useCallback(
    (to: number) => {
      const el = list.current;
      const all = items();
      if (!el || !all.length) return;
      const target = all[Math.max(0, Math.min(all.length - 1, to))];
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ left: target.offsetLeft - all[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list],
  );

  // Arraste: mede o deslocamento de qualquer ponteiro (para cancelar o clique)
  // e, só com o mouse, move a rolagem (toque e caneta já rolam nativamente).
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let startScroll = 0;
    let mouse = false;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(ev.clientY - startY) > DRAG_THRESHOLD) dragged.current = true;
      if (mouse && dragged.current) {
        el.style.scrollSnapType = 'none';
        el.scrollLeft = startScroll - dx;
      }
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (!mouse) return;
      el.removeAttribute('data-dragging');
      if (el.style.scrollSnapType) {
        // Solta: encaixa no slide mais próximo.
        const all = [...el.children] as HTMLElement[];
        const start = all[0]?.offsetLeft ?? 0;
        let best = 0;
        all.forEach((it, i) => {
          if (Math.abs(it.offsetLeft - start - el.scrollLeft) < Math.abs(all[best].offsetLeft - start - el.scrollLeft)) best = i;
        });
        el.style.scrollSnapType = '';
        go(best);
      }
    };
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      dragged.current = false;
      startX = ev.clientX;
      startY = ev.clientY;
      startScroll = el.scrollLeft;
      mouse = ev.pointerType === 'mouse';
      if (mouse) el.setAttribute('data-dragging', '');
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
    // Captura: o clique que termina um arraste não chega aos links.
    const onClick = (ev: MouseEvent) => {
      if (!dragged.current) return;
      ev.preventDefault();
      ev.stopPropagation();
      dragged.current = false;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('click', onClick, true);
      onUp();
    };
  }, [list, go]);

  return { index, scrollable, go };
}
