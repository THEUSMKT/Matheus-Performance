'use client';

/* ==========================================================================
   A única animação que roda sozinha na página: o preview do topo passeia
   por quatro direções visuais, mostrando do que o configurador é capaz.
   ========================================================================== */
import { useEffect, useState } from 'react';
import { colorSchemes } from '@/config/colors';
import { templates } from '@/config/templates';
import { visualStyles } from '@/config/styles';
import { fontPairings } from '@/config/fonts';
import { toDark } from '@/lib/preview';
import type { PreviewSpec } from '@/lib/preview';
import { SitePreview } from './SitePreview';

const showcase = [
  { label: 'Minimalista', template: 'minimal', style: 'minimalista', color: 'bege', font: 'minimal', headline: 'Um espaço para respirar' },
  { label: 'Premium', template: 'premium', style: 'premium', color: 'preto', font: 'elegante', headline: 'Feito para quem cobra caro' },
  { label: 'Moderno', template: 'modern', style: 'moderno', color: 'azul', font: 'moderno', headline: 'Clientes chegando todo dia' },
  { label: 'Dark', template: 'dark', style: 'dark', color: 'roxo', font: 'marcante', headline: 'Seu trabalho em primeiro plano' },
];

function specFor(index: number): PreviewSpec {
  const item = showcase[index];
  const template = templates.find((t) => t.id === item.template)!;
  const style = visualStyles.find((s) => s.id === item.style)!;
  const scheme = colorSchemes.find((c) => c.id === item.color)!;
  const pairing = fontPairings.find((f) => f.id === item.font)!;
  const skin = { ...template.skin, ...style.skin };

  return {
    palette: skin.forceDark ? toDark(scheme.palette) : scheme.palette,
    skin,
    layout: template.layout,
    headline: item.headline,
    cta: 'Falar agora',
    headingFont: pairing.headingVar,
    bodyFont: pairing.bodyVar,
    features: ['whatsapp'],
  };
}

export function HeroPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % showcase.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <div key={index} className="anim-step">
        <SitePreview spec={specFor(index)} url="suamarca.com.br" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
        {showcase.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-[0.8125rem] font-medium transition-colors duration-200 ${
              i === index ? 'bg-ink text-canvas' : 'text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
