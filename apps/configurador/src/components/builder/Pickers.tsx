'use client';
/* ==========================================================================
   Seletores visuais da personalização: estilo (miniatura real da prévia),
   cores (a paleta aplicada num pequeno exemplo), títulos (o mesmo título em
   cada fonte) e logo (envio opcional, reduzida no navegador).
   Estilos, cores da marca e logo estão incluídos em todos os pacotes: nada
   aqui tem preço próprio.
   ========================================================================== */
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';
import { contrastInk, directions, fonts, headFont, normalizeProject, palettes, siteContent, type Project } from '@/lib/project';
import { logoErrorText, prepareLogo, type LogoError } from '@/lib/logo';
import { SitePreview } from '../preview/SitePreview';
import { DesktopFrame } from '../landing/DemoFrames';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

/** Grupo de opções com setas do teclado, para itens que não cabem num <button>. */
export function useRovingKeys<T>(items: T[], index: number, select: (i: number) => void) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = -1;
    if (e.key in keys) next = (i + keys[e.key] + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      select(i);
      return;
    }
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    select(next);
  };
  const tabIndex = (i: number) => (i === index || (index < 0 && i === 0) ? 0 : -1);
  return { refs, onKey, tabIndex };
}

export function StylePicker({
  p,
  ids,
  labelledBy,
  onChange,
  suggested = [],
}: {
  p: Project;
  ids: string[];
  labelledBy: string;
  onChange: (id: string) => void;
  /** Estilos sugeridos para o segmento: ganham o selo "Sugerido". */
  suggested?: string[];
}) {
  const list = ids.map((id) => directions.find((d) => d.id === id)!).filter(Boolean);
  const index = list.findIndex((d) => d.id === p.direction);
  const { refs, onKey, tabIndex } = useRovingKeys(list as unknown[], index, (i) => onChange(list[i].id));
  return (
    <div className={b.styles} role="radiogroup" aria-labelledby={labelledBy}>
      {list.map((d, i) => (
        <div
          key={d.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          role="radio"
          aria-checked={i === index}
          aria-label={`${d.name}: ${d.description}`}
          tabIndex={tabIndex(i)}
          className={b.styleOpt}
          onClick={() => onChange(d.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          <div className={b.styleThumb} aria-hidden="true">
            <DesktopFrame width={330}>
              <SitePreview project={normalizeProject({ ...p, direction: d.id })} compact bare lazy />
            </DesktopFrame>
          </div>
          <span className={b.styleName} aria-hidden="true">
            {d.name}
            {suggested.includes(d.id) && <small className={b.badge}>Sugerido</small>}
          </span>
          <span className={b.optCheck} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

/** Paletas aplicadas num pequeno exemplo (topo, título e botão) e a cor da marca. */
export function ColorPicker({ p, onPalette, onCustom }: { p: Project; onPalette: (id: string) => void; onCustom: (hex: string) => void }) {
  const items = [...palettes.map((c) => c.id), 'propria'];
  const index = p.custom ? items.length - 1 : items.indexOf(p.palette);
  const select = (i: number) => (items[i] === 'propria' ? onCustom(p.custom ?? '#0761fd') : onPalette(items[i]));
  const { refs, onKey, tabIndex } = useRovingKeys(items, index, select);
  const sample = (accent: string, bg: string) => (
    <span className={b.colorSample} style={{ background: bg }} aria-hidden="true">
      <i className={b.colorBar} style={{ background: accent }} />
      <b className={b.colorTitle} style={{ color: accent }}>
        Seu site
      </b>
      <i className={b.colorLine} />
      <i className={b.colorBtn} style={{ background: accent, color: contrastInk(accent) }}>
        Contato
      </i>
    </span>
  );
  return (
    <>
      <div className={b.colors} role="radiogroup" aria-labelledby="rotulo-cores">
        {palettes.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={i === index}
            tabIndex={tabIndex(i)}
            className={b.colorOpt}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {sample(c.accent, c.bg)}
            <span className={b.colorName}>{c.name}</span>
            <span className={b.optCheck} aria-hidden="true" />
          </button>
        ))}
        <button
          ref={(el) => {
            refs.current[items.length - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={index === items.length - 1}
          tabIndex={tabIndex(items.length - 1)}
          className={b.colorOpt}
          onClick={() => select(items.length - 1)}
          onKeyDown={(e) => onKey(e, items.length - 1)}
        >
          {sample(p.custom ?? '#0761fd', '#f5f7fb')}
          <span className={b.colorName}>Cor da marca</span>
          <span className={b.optCheck} aria-hidden="true" />
        </button>
      </div>
      {p.custom && (
        <label className={b.colorRow}>
          <input className={s.colorInput} type="color" value={p.custom} onChange={(ev) => onCustom(ev.target.value)} />
          Escolha a cor principal da sua marca
        </label>
      )}
    </>
  );
}

/** O mesmo título renderizado em cada fonte. */
export function FontPicker({ p, onChange }: { p: Project; onChange: (id: string) => void }) {
  const index = fonts.findIndex((f) => f.id === p.font);
  const { refs, onKey, tabIndex } = useRovingKeys(fonts as unknown as unknown[], index, (i) => onChange(fonts[i].id));
  const title = siteContent(p).title.replace(/[.!]$/, '');
  const sample = title.length > 48 ? `${title.slice(0, 46).trimEnd()}…` : title;
  const style = directions.find((d) => d.id === p.direction)!.name;
  const hint: Record<string, string> = {
    auto: `A que combina com o estilo ${style}.`,
    serif: 'Elegante e tradicional.',
    sans: 'Limpa e direta.',
    forte: 'Traço grosso, chama atenção.',
  };
  return (
    <div className={b.fontList} role="radiogroup" aria-labelledby="etapa-titulo">
      {fonts.map((f, i) => (
        <button
          key={f.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          tabIndex={tabIndex(i)}
          className={b.fontOpt}
          onClick={() => onChange(f.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          <span className={b.fontSample} style={{ fontFamily: headFont(f.id, p.direction) }} aria-hidden="true">
            {sample}
          </span>
          <span className={b.fontName}>
            {f.name} <small>{hint[f.id]}</small>
          </span>
          <span className={b.optCheck} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function LogoField({ logo, onChange }: { logo: string | null; onChange: (dataUrl: string | null) => void }) {
  const [error, setError] = useState<LogoError | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    const res = await prepareLogo(file);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    onChange(res.dataUrl);
  }

  const input = (label: ReactNode) => (
    <label className={b.upload}>
      <ImagePlus aria-hidden="true" />
      {busy ? 'Carregando…' : label}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        aria-describedby={error ? 'erro-logo' : 'dica-logo'}
        onChange={(ev) => {
          void onFile(ev.target.files?.[0]);
          ev.target.value = '';
        }}
      />
    </label>
  );

  return (
    <div>
      <div className={b.logoRow}>
        {logo ? (
          <>
            <img className={b.logoThumb} src={logo} alt="Sua logo" />
            {input('Trocar')}
            <button type="button" className={b.textButton} onClick={() => onChange(null)}>
              Remover
            </button>
          </>
        ) : (
          input('Enviar logo')
        )}
      </div>
      {error ? (
        <p className={s.fieldError} id="erro-logo" role="alert" style={{ marginTop: 6 }}>
          {logoErrorText[error]}
        </p>
      ) : (
        <p className={b.muted} id="dica-logo" style={{ marginTop: 6 }}>
          {logo ? 'Aparece no topo da prévia.' : 'Sem logo, usamos o nome da empresa.'}
        </p>
      )}
    </div>
  );
}
