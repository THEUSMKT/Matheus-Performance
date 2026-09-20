'use client';

import { useEffect, useState } from 'react';
import { templates } from '@/config/templates';
import { fontPairings } from '@/config/fonts';
import { siteTypes } from '@/config/siteTypes';
import { SitePreview } from '@/components/SitePreview';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toDark } from '@/lib/preview';
import type { PreviewSpec } from '@/lib/preview';
import type { Template } from '@/lib/types';
import type { StepProps } from './shared';

/** Monta o spec da miniatura de um modelo, já com o tipo e a fonte escolhidos. */
function specFor(template: Template, typeId: string | null, fontId: string | null): PreviewSpec {
  const type = siteTypes.find((t) => t.id === typeId);
  const pairing = fontPairings.find((f) => f.id === fontId);
  const palette = template.skin.forceDark ? toDark(template.demoPalette) : template.demoPalette;

  return {
    palette,
    skin: template.skin,
    layout: template.layout,
    headline: type?.previewHeadline ?? 'Seu negócio, do jeito certo',
    cta: type?.previewCta ?? 'Fale comigo',
    headingFont: pairing?.headingVar ?? 'var(--font-jakarta)',
    bodyFont: pairing?.bodyVar ?? 'var(--font-jakarta)',
    features: [],
  };
}

export function ModelSelector({ selection, update }: StepProps) {
  const [zoom, setZoom] = useState<Template | null>(null);

  return (
    <>
      <div role="radiogroup" aria-label="Modelo de layout" className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => {
          const selected = selection.template === template.id;
          return (
            <div
              key={template.id}
              className={`group overflow-hidden rounded-md border bg-surface transition-[border-color,box-shadow] duration-200 ${
                selected ? 'border-brand shadow-soft' : 'border-line hover:border-line-strong hover:shadow-soft'
              }`}
            >
              {/* A miniatura é o site de verdade, desenhado em CSS. */}
              <div className="relative overflow-hidden bg-sunken p-3 pb-0">
                <div className="origin-top transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.035]">
                  <SitePreview
                    spec={specFor(template, selection.type, selection.font)}
                    bare
                    className="h-[220px] [&_.pv-page]:max-h-[220px]"
                  />
                </div>
                {selected && (
                  <span className="anim-pop absolute right-5 top-5 grid size-6 place-items-center rounded-full bg-brand text-white">
                    <Icon name="Check" className="size-3.5" strokeWidth={3} />
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[1.0625rem] font-semibold tracking-[-0.02em]">{template.name}</h3>
                  <span className="tnum text-[0.75rem] text-faint">{template.family}</span>
                </div>
                <p className="mt-1 text-sm leading-snug text-muted">{template.pitch}</p>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={selected ? 'secondary' : 'primary'}
                    className="flex-1"
                    onClick={() => update({ template: template.id })}
                    aria-pressed={selected}
                  >
                    {selected ? 'Selecionado' : 'Selecionar modelo'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setZoom(template)}
                    aria-label={`Visualizar o modelo ${template.name} em tamanho maior`}
                  >
                    Visualizar
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {zoom && (
        <PreviewDialog
          template={zoom}
          spec={specFor(zoom, selection.type, selection.font)}
          selected={selection.template === zoom.id}
          onSelect={() => {
            update({ template: zoom.id });
            setZoom(null);
          }}
          onClose={() => setZoom(null)}
        />
      )}
    </>
  );
}

function PreviewDialog({
  template,
  spec,
  selected,
  onSelect,
  onClose,
}: {
  template: Template;
  spec: PreviewSpec;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Prévia do modelo ${template.name}`}
      onClick={onClose}
    >
      <div
        className="anim-step max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-xl bg-canvas p-4 sm:rounded-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-[-0.03em]">{template.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{template.pitch}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar prévia"
            className="grid size-10 flex-none cursor-pointer place-items-center rounded-sm border border-line bg-surface text-muted transition-colors hover:text-ink"
          >
            <Icon name="X" className="size-5" />
          </button>
        </div>

        <SitePreview spec={spec} url={`${template.name.toLowerCase()}.suamarca.com.br`} />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={onSelect}>
            {selected ? 'Manter este modelo' : `Usar o modelo ${template.name}`}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Ver outros
          </Button>
        </div>
      </div>
    </div>
  );
}
