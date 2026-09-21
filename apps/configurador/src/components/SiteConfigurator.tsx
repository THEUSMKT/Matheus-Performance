'use client';

/* ==========================================================================
   O configurador. Seis escolhas, uma de cada vez, com o preview ao vivo
   sempre à vista — no desktop ao lado, no celular logo acima.
   ========================================================================== */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { estimate } from '@/lib/estimate';
import { resolvePreview } from '@/lib/preview';
import { usePersistedConfig, usePresetListener } from '@/lib/storage';
import type { Selection } from '@/lib/types';
import { EstimateCard } from './EstimateCard';
import { ProgressBar } from './ProgressBar';
import { ProjectSummary } from './ProjectSummary';
import { SitePreview } from './SitePreview';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { ColorSelector } from './steps/ColorSelector';
import { FeatureSelector } from './steps/FeatureSelector';
import { FontSelector } from './steps/FontSelector';
import { ModelSelector } from './steps/ModelSelector';
import { StyleSelector } from './steps/StyleSelector';
import { TypeSelector } from './steps/TypeSelector';
import type { StepProps } from './steps/shared';

type Step = {
  id: string;
  title: string;
  support?: string;
  Component: (props: StepProps) => React.JSX.Element;
  answered: (s: Selection) => boolean;
};

const STEPS: Step[] = [
  {
    id: 'tipo',
    title: 'O que você quer criar?',
    support: 'Comece pelo formato do projeto.',
    Component: TypeSelector,
    answered: (s) => Boolean(s.type),
  },
  {
    id: 'modelo',
    title: 'Qual estrutura combina com você?',
    support: 'As miniaturas são desenhadas de verdade — não são fotos.',
    Component: ModelSelector,
    answered: (s) => Boolean(s.template),
  },
  {
    id: 'estilo',
    title: 'Escolha a personalidade.',
    Component: StyleSelector,
    answered: (s) => Boolean(s.style),
  },
  {
    id: 'cores',
    title: 'Qual é a cara da sua marca?',
    Component: ColorSelector,
    answered: (s) => Boolean(s.color || s.customColor),
  },
  {
    id: 'tipografia',
    title: 'Escolha a sensação da sua marca.',
    Component: FontSelector,
    answered: (s) => Boolean(s.font),
  },
  {
    id: 'funcionalidades',
    title: 'O que seu site precisa fazer?',
    support: 'Cada item escolhido aparece na prévia.',
    Component: FeatureSelector,
    answered: (s) => s.features.length > 0,
  },
];

const SUMMARY = STEPS.length;

/** Frase de incentivo conforme o progresso. */
function encouragement(done: number): string {
  if (done === 0) return 'Leva menos de 3 minutos.';
  if (done < 3) return 'Seu site está tomando forma.';
  if (done < SUMMARY) return 'Falta pouco.';
  return 'Pronto para o orçamento.';
}

export function SiteConfigurator() {
  const { selection, setSelection, step, setStep, reset, restored, dismissRestored } = usePersistedConfig();
  const panelRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const result = useMemo(() => estimate(selection), [selection]);
  const spec = useMemo(() => resolvePreview(selection), [selection]);
  const answered = useMemo(() => STEPS.map((s) => s.answered(selection)), [selection]);
  const done = answered.filter(Boolean).length;

  const update = useCallback(
    (patch: Partial<Selection>) => setSelection((prev) => ({ ...prev, ...patch })),
    [setSelection],
  );

  const goTo = useCallback(
    (next: number) => {
      setStep(next);
      // Traz o topo do painel de volta, mas só quando ele já saiu da tela.
      requestAnimationFrame(() => {
        // No celular a prévia fica acima das opções, então o alvo é a coluna
        // das escolhas — é onde a pessoa precisa estar para continuar.
        const node = stepsRef.current;
        if (!node) return;
        const top = node.getBoundingClientRect().top;
        if (top < -40 || top > window.innerHeight * 0.6) {
          node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    [setStep],
  );

  // A vitrine de modelos pode empurrar uma combinação pronta para cá.
  usePresetListener((patch) => {
    setSelection((prev) => {
      const merged = { ...prev, ...patch };
      const next = STEPS.findIndex((s) => !s.answered(merged));
      setStep(next === -1 ? SUMMARY : next);
      return merged;
    });
  });

  // A barra fixa do celular só existe enquanto o configurador está na tela.
  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '-80px 0px -120px 0px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isSummary = step >= SUMMARY;
  const barraVisivel = inView && done > 0 && !isSummary;
  const current = STEPS[Math.min(step, SUMMARY - 1)];
  const canAdvance = isSummary || answered[step];

  return (
    <section id="configurador" className="pb-16 pt-8 sm:pb-24 sm:pt-12">
      <div className="wrap">
        <header className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold tracking-[-0.01em] text-brand">Monte seu site</p>
          <h2 className="mt-2 text-section font-bold">
            Escolha como ele deve ser. O preço aparece na hora.
          </h2>
          <p className="mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-muted">
            Seis escolhas rápidas. A prévia acompanha cada uma delas.
          </p>
        </header>

        <div
          ref={panelRef}
          className="grid overflow-hidden rounded-lg border border-line bg-canvas shadow-soft lg:grid-cols-[minmax(0,1fr)_400px]"
        >
          {/* ── coluna das escolhas ─────────────────────────────────── */}
          <div ref={stepsRef} className="flex min-w-0 flex-col bg-surface">
            <ProgressBar
              step={Math.min(step, SUMMARY - 1)}
              total={SUMMARY}
              answered={answered}
              onJump={goTo}
              onReset={reset}
              label={isSummary ? 'Resumo do projeto' : undefined}
            />

            {restored && (
              <div className="flex items-center gap-3 border-b border-brand-line bg-brand-soft px-5 py-3 text-sm sm:px-7">
                <Icon name="RotateCcw" className="size-4 flex-none text-brand" />
                <p className="flex-1 text-ink">Recuperamos as escolhas da sua última visita.</p>
                <button
                  type="button"
                  onClick={dismissRestored}
                  aria-label="Dispensar aviso"
                  className="-m-3.5 cursor-pointer p-3.5 text-muted transition-colors hover:text-ink"
                >
                  <Icon name="X" className="size-4" />
                </button>
              </div>
            )}

            <div className="flex-1 px-5 py-6 sm:px-7 sm:py-8">
              <h3 className="text-2xl font-bold tracking-[-0.03em] sm:text-[1.75rem]">
                {isSummary ? 'Seu projeto está pronto para orçamento.' : current.title}
              </h3>
              {!isSummary && current.support && (
                <p className="mt-1.5 text-[0.9375rem] text-muted">{current.support}</p>
              )}
              {isSummary && (
                <p className="mt-1.5 text-[0.9375rem] text-muted">
                  Confira o resumo e envie. Eu respondo pelo WhatsApp.
                </p>
              )}

              <div key={isSummary ? 'resumo' : current.id} className="anim-step mt-6">
                {isSummary ? (
                  <ProjectSummary selection={selection} update={update} result={result} onEdit={goTo} />
                ) : (
                  <current.Component selection={selection} update={update} />
                )}
              </div>
            </div>

            {/* ── navegação ────────────────────────────────────────── */}
            <div className="flex items-center gap-3 border-t border-line bg-surface px-5 py-4 sm:px-7">
              {step > 0 && (
                <Button variant="secondary" onClick={() => goTo(step - 1)}>
                  <Icon name="ArrowLeft" className="size-4" />
                  Voltar
                </Button>
              )}
              <p className="ml-auto hidden text-sm text-muted sm:block">{encouragement(done)}</p>
              {!isSummary && (
                <Button onClick={() => goTo(step + 1)} disabled={!canAdvance} className="max-sm:ml-auto">
                  {step === SUMMARY - 1 ? 'Ver resumo' : 'Continuar'}
                  <Icon name="ArrowRight" className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* ── coluna do preview ───────────────────────────────────── */}
          <aside className="border-t border-line bg-sunken p-5 lg:border-t-0 lg:border-l lg:p-7">
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold tracking-[-0.01em]">Prévia do seu site</p>
                <p className="tnum text-[0.8125rem] text-muted">
                  {done} de {SUMMARY}
                </p>
              </div>

              <SitePreview spec={spec} className="max-lg:mx-auto max-lg:max-w-sm" />

              {!isSummary && (
                <>
                  <div className="mt-4 max-lg:hidden">
                    <EstimateCard result={result} />
                  </div>

                  {/* No celular a estimativa vive na barra fixa; aqui fica só o prazo. */}
                  <p className="mt-3 text-[0.8125rem] leading-snug text-muted lg:hidden">
                    Prazo estimado: <strong className="font-semibold text-ink">{result.deadline}</strong>
                  </p>
                </>
              )}
            </div>

            {/* Enquanto a barra fixa está visível, ela precisa de chão — a
                altura dela mais a área segura do aparelho. */}
            {barraVisivel && (
              <div
                className="h-[5.5rem] lg:hidden"
                style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
                aria-hidden
              />
            )}
          </aside>
        </div>
      </div>

      {/* ── barra fixa do celular ─────────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-[var(--ease-out)] lg:hidden ${
          barraVisivel ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-hidden={!barraVisivel}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.75rem] leading-none text-muted">Estimativa</p>
            <div className="mt-1">
              <EstimateCard result={result} compact />
            </div>
          </div>
          {!isSummary && (
            <Button size="sm" onClick={() => goTo(step + 1)} disabled={!canAdvance} tabIndex={barraVisivel ? 0 : -1}>
              {step === SUMMARY - 1 ? 'Ver resumo' : 'Continuar'}
              <Icon name="ArrowRight" className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
