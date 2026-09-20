'use client';

/* ==========================================================================
   Miniatura de site que se redesenha a cada escolha do configurador.
   Tudo é desenhado em CSS — nenhuma imagem é carregada.
   A escala interna sai de --pv (font-size da raiz do preview); os blocos
   usam `em`, então a peça inteira cresce junto com o container.
   ========================================================================== */

import type { CSSProperties, ReactNode } from 'react';
import type { PreviewSpec } from '@/lib/preview';

type Props = {
  spec: PreviewSpec;
  /** Texto da barra de endereço. */
  url?: string;
  /** Some com a moldura de navegador (usado na vitrine de modelos). */
  bare?: boolean;
  className?: string;
};

const gapFor = { airy: '1.5em', normal: '1.1em', tight: '0.75em' } as const;

export function SitePreview({ spec, url = 'suamarca.com.br', bare = false, className = '' }: Props) {
  const { palette: p, skin } = spec;
  const r = `${skin.radius}px`;
  const border = skin.borders ? `1px solid ${p.line}` : '1px solid transparent';

  const vars = {
    '--pv-bg': p.bg,
    '--pv-surface': p.surface,
    '--pv-ink': p.ink,
    '--pv-muted': p.muted,
    '--pv-accent': p.accent,
    '--pv-on-accent': p.onAccent,
    '--pv-line': p.line,
    '--pv-r': r,
    '--pv-border': border,
    '--pv-gap': gapFor[skin.density],
    fontFamily: spec.bodyFont,
  } as CSSProperties;

  const body = (
    <div className="pv-page" style={vars}>
      <Chrome spec={spec} />
      <div className="pv-body">{renderLayout(spec)}</div>
      <Extras spec={spec} />
      {spec.features.includes('whatsapp') && <span className="pv-bubble" aria-hidden />}
    </div>
  );

  if (bare) return <div className={`pv-frame pv-frame--bare ${className}`}>{body}</div>;

  return (
    <div className={`pv-frame ${className}`} role="img" aria-label="Prévia do site montado com as suas escolhas">
      <div className="pv-chrome">
        <span className="pv-dot" /> <span className="pv-dot" /> <span className="pv-dot" />
        <span className="pv-url">{url}</span>
      </div>
      {body}
    </div>
  );
}

/* ── barra de navegação da miniatura ─────────────────────────────────────── */
function Chrome({ spec }: { spec: PreviewSpec }) {
  return (
    <div className="pv-nav">
      <span className="pv-logo" style={{ fontFamily: spec.headingFont, fontWeight: spec.skin.titleWeight }}>
        marca
      </span>
      <span className="pv-links">
        <i /> <i /> <i />
      </span>
      <span className="pv-navcta" />
    </div>
  );
}

/* ── peças reutilizáveis ─────────────────────────────────────────────────── */
function Title({ spec, children }: { spec: PreviewSpec; children: ReactNode }) {
  return (
    <h4
      className="pv-title"
      style={{
        fontFamily: spec.headingFont,
        fontWeight: spec.skin.titleWeight,
        fontSize: `${1.55 * spec.skin.titleScale}em`,
      }}
    >
      {children}
    </h4>
  );
}

const Lines = ({ n = 2, w = '100%' }: { n?: number; w?: string }) => (
  <span className="pv-lines" style={{ width: w }}>
    {Array.from({ length: n }, (_, i) => (
      <i key={i} style={{ width: i === n - 1 ? '62%' : '100%' }} />
    ))}
  </span>
);

const Cta = ({ spec }: { spec: PreviewSpec }) => (
  <span className="pv-cta" style={{ fontFamily: spec.headingFont }}>
    {spec.cta}
  </span>
);

const Media = ({ h = '5.4em', tint = false }: { h?: string; tint?: boolean }) => (
  <span className={`pv-media ${tint ? 'pv-media--tint' : ''}`} style={{ height: h }} />
);

const Card = ({ n = 3 }: { n?: number }) => (
  <span className="pv-row">
    {Array.from({ length: n }, (_, i) => (
      <span className="pv-card" key={i}>
        <i className="pv-chip" />
        <Lines n={2} />
      </span>
    ))}
  </span>
);

/* ── os seis arranjos ────────────────────────────────────────────────────── */
function renderLayout(spec: PreviewSpec) {
  switch (spec.layout) {
    case 'centered':
      return (
        <>
          <div className="pv-stack pv-center">
            <Title spec={spec}>{spec.headline}</Title>
            <Lines n={2} w="72%" />
            <Cta spec={spec} />
          </div>
          <Media h="6.2em" tint />
          <Card n={3} />
        </>
      );

    case 'split':
      return (
        <>
          <div className="pv-split">
            <div className="pv-stack">
              <Title spec={spec}>{spec.headline}</Title>
              <Lines n={3} />
              <Cta spec={spec} />
            </div>
            <Media h="8em" tint />
          </div>
          <Card n={3} />
        </>
      );

    case 'editorial':
      return (
        <>
          <Title spec={spec}>{spec.headline}</Title>
          <span className="pv-rule" />
          <div className="pv-cols">
            <Lines n={4} />
            <Lines n={4} />
          </div>
          <Media h="5em" />
          <Cta spec={spec} />
        </>
      );

    case 'stacked':
      return (
        <>
          <div className="pv-band">
            <Title spec={spec}>{spec.headline}</Title>
            <Cta spec={spec} />
          </div>
          <Card n={4} />
          <span className="pv-listrows">
            {[0, 1, 2].map((i) => (
              <span className="pv-listrow" key={i}>
                <Lines n={1} w="48%" />
                <i className="pv-tag" />
              </span>
            ))}
          </span>
        </>
      );

    case 'sidebar':
      return (
        <div className="pv-sidebar">
          <span className="pv-rail">
            <i /> <i /> <i /> <i />
          </span>
          <div className="pv-stack">
            <Title spec={spec}>{spec.headline}</Title>
            <Lines n={2} />
            <Media h="4.4em" tint />
            <Cta spec={spec} />
          </div>
        </div>
      );

    case 'showcase':
    default:
      return (
        <>
          <div className="pv-stack">
            <Title spec={spec}>{spec.headline}</Title>
            <Lines n={1} w="60%" />
          </div>
          <span className="pv-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <Media key={i} h="3.6em" tint={i % 3 === 0} />
            ))}
          </span>
          <Cta spec={spec} />
        </>
      );
  }
}

/* ── blocos que aparecem conforme as funcionalidades escolhidas ──────────── */
function Extras({ spec }: { spec: PreviewSpec }) {
  const has = (id: string) => spec.features.includes(id);
  const blocks: ReactNode[] = [];

  if (has('galeria') && spec.layout !== 'showcase') {
    blocks.push(
      <span className="pv-grid pv-grid--four" key="galeria">
        {Array.from({ length: 4 }, (_, i) => (
          <Media key={i} h="2.8em" tint={i === 1} />
        ))}
      </span>,
    );
  }

  if (has('depoimentos')) {
    blocks.push(
      <span className="pv-quote" key="depoimentos">
        <i className="pv-avatar" />
        <Lines n={2} />
      </span>,
    );
  }

  if (has('catalogo')) {
    blocks.push(
      <span className="pv-listrows" key="catalogo">
        {[0, 1].map((i) => (
          <span className="pv-listrow" key={i}>
            <i className="pv-thumb" />
            <Lines n={1} w="40%" />
            <i className="pv-price" />
          </span>
        ))}
      </span>,
    );
  }

  if (has('faq')) {
    blocks.push(
      <span className="pv-faq" key="faq">
        {[0, 1, 2].map((i) => (
          <span className="pv-faqrow" key={i}>
            <Lines n={1} w="54%" />
            <i className="pv-plus" />
          </span>
        ))}
      </span>,
    );
  }

  if (has('formularioWhatsapp') || has('formularioEmail') || has('agendamento')) {
    blocks.push(
      <span className="pv-form" key="form">
        <i /> <i />
        <span className="pv-cta pv-cta--full" style={{ fontFamily: spec.headingFont }}>
          {has('agendamento') ? 'Agendar horário' : 'Enviar'}
        </span>
      </span>,
    );
  }

  if (has('mapa')) blocks.push(<span className="pv-map" key="mapa" />);

  if (has('instagram')) {
    blocks.push(
      <span className="pv-strip" key="instagram">
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} />
        ))}
      </span>,
    );
  }

  if (has('redes')) {
    blocks.push(
      <span className="pv-social" key="redes">
        {Array.from({ length: 4 }, (_, i) => (
          <i key={i} />
        ))}
      </span>,
    );
  }

  if (blocks.length === 0) return null;
  return <div className="pv-extras">{blocks}</div>;
}
