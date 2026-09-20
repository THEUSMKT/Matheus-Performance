'use client';

/* ==========================================================================
   Vitrine. Cada peça é desenhada pelo mesmo motor do configurador, então
   clicar em uma delas já leva as escolhas para dentro do fluxo.
   ========================================================================== */
import { colorSchemes } from '@/config/colors';
import { fontPairings } from '@/config/fonts';
import { portfolio } from '@/config/portfolio';
import { templates } from '@/config/templates';
import { toDark } from '@/lib/preview';
import { applyPreset } from '@/lib/storage';
import type { PreviewSpec } from '@/lib/preview';
import { SitePreview } from './SitePreview';
import { Icon } from './ui/Icon';

type Item = (typeof portfolio)[number];

function specFor(item: Item): PreviewSpec {
  const template = templates.find((t) => t.id === item.template)!;
  const scheme = colorSchemes.find((c) => c.id === item.color)!;
  const pairing = fontPairings.find((f) => f.id === item.font)!;

  return {
    palette: template.skin.forceDark ? toDark(scheme.palette) : scheme.palette,
    skin: template.skin,
    layout: template.layout,
    headline: item.name,
    cta: 'Falar agora',
    headingFont: pairing.headingVar,
    bodyFont: pairing.bodyVar,
    features: [],
  };
}

export function Portfolio() {
  const start = (item: Item) => {
    applyPreset({ template: item.template, color: item.color, font: item.font });
    document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="modelos" className="scroll-mt-20 border-t border-line bg-surface py-16 sm:py-24">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-md text-section font-bold">Veja o que dá para criar.</h2>
          <p className="max-w-xs text-[0.9375rem] leading-snug text-muted">
            Clique em uma direção e ela entra no configurador já escolhida.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => start(item)}
                className="group w-full cursor-pointer text-left"
              >
                <span className="relative block overflow-hidden rounded-md border border-line bg-sunken p-3 pb-0 transition-[border-color,box-shadow] duration-200 group-hover:border-line-strong group-hover:shadow-soft">
                  <span className="block origin-top transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.04]">
                    <SitePreview
                      spec={specFor(item)}
                      bare
                      className="h-[210px] [&_.pv-page]:max-h-[210px]"
                    />
                  </span>
                  <span className="absolute inset-0 flex items-end justify-center bg-ink/55 pb-8 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-sm bg-surface px-4 py-2.5 text-sm font-semibold tracking-[-0.01em]">
                      Começar com este estilo
                      <Icon name="ArrowRight" className="size-4" />
                    </span>
                  </span>
                </span>

                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">{item.name}</span>
                  <span className="text-[0.8125rem] text-muted">{item.category}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
