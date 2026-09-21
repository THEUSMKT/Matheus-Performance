'use client';

/* ==========================================================================
   Estimativa de investimento e prazo. Os números sobem suavemente quando
   mudam, para que a pessoa perceba o efeito da escolha que acabou de fazer.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { brl } from '@/config/pricing';
import type { Estimate } from '@/lib/estimate';

export function EstimateCard({
  result,
  compact = false,
  externalCost,
}: {
  result: Estimate;
  compact?: boolean;
  /** Custo de terceiros, mostrado à parte do valor do desenvolvimento. */
  externalCost?: string;
}) {
  const min = useAnimatedNumber(result.min);
  const max = useAnimatedNumber(result.max);

  if (compact) {
    return (
      <span className="tnum text-[0.9375rem] font-semibold tracking-[-0.02em]">
        {brl(min)} – {brl(max).replace('R$ ', '')}
      </span>
    );
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <p className="text-sm text-muted">Estimativa do projeto</p>
      <p className="tnum mt-1 text-[2rem] font-bold leading-none tracking-[-0.04em]">
        {brl(min)} <span className="text-faint">–</span> {brl(max).replace('R$ ', '')}
      </p>

      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm text-muted">Prazo estimado</span>
        <span key={result.deadline} className="anim-price text-[0.9375rem] font-semibold tracking-[-0.015em]">
          {result.deadline}
        </span>
      </div>

      <p className="mt-3 text-[0.8125rem] leading-snug text-faint">
        Valor aproximado, confirmado depois da análise. O prazo conta a partir do envio dos materiais.
      </p>

      {externalCost && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm text-muted">Possíveis custos externos</p>
          <p className="mt-1 text-[0.9375rem] leading-snug">{externalCost}</p>
        </div>
      )}
    </div>
  );
}

/** Interpola até o novo valor em ~380ms. Respeita "reduzir movimento". */
function useAnimatedNumber(target: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || from.current === target) {
      from.current = target;
      setValue(target);
      return;
    }

    const start = performance.now();
    const origin = from.current;
    const duration = 380;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(origin + (target - origin) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else from.current = target;
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      from.current = target;
    };
  }, [target]);

  return value;
}
