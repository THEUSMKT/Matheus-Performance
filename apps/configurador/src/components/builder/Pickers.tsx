'use client';
/* ==========================================================================
   Seletores visuais da etapa Sua identidade: estilo (miniatura real da
   prévia), cores (amostras) e logo (envio opcional, reduzida no navegador).
   Estilos, cores da marca e logo estão incluídos em todos os pacotes: nada
   aqui tem preço próprio.
   ========================================================================== */
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';
import { directions, normalizeProject, palettes, type Project } from '@/lib/project';
import { logoErrorText, prepareLogo, type LogoError } from '@/lib/logo';
import { SitePreview } from '../preview/SitePreview';
import { DesktopFrame } from '../landing/DemoFrames';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

/** Grupo de opções com setas do teclado, para itens que não cabem num <button>. */
function useRovingKeys<T>(items: T[], index: number, select: (i: number) => void) {
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

export function StylePicker({ p, ids, labelledBy, onChange }: { p: Project; ids: string[]; labelledBy: string; onChange: (id: string) => void }) {
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
              <SitePreview project={normalizeProject({ ...p, direction: d.id, font: 'auto' })} compact bare />
            </DesktopFrame>
          </div>
          <span className={b.styleName} aria-hidden="true">
            {d.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SwatchPicker({ p, onPalette, onCustom }: { p: Project; onPalette: (id: string) => void; onCustom: (hex: string | null) => void }) {
  const items = [...palettes.map((c) => c.id), 'propria'];
  const index = p.custom ? items.length - 1 : items.indexOf(p.palette);
  const select = (i: number) => (items[i] === 'propria' ? onCustom(p.custom ?? '#0761fd') : onPalette(items[i]));
  const { refs, onKey, tabIndex } = useRovingKeys(items, index, select);
  return (
    <>
      <div className={b.swatches} role="radiogroup" aria-labelledby="rotulo-cores">
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
            className={b.swatchOpt}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className={b.swatchDot} style={{ background: c.accent }} aria-hidden="true" />
            {c.name}
          </button>
        ))}
        <button
          ref={(el) => {
            refs.current[items.length - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={index === items.length - 1}
          aria-label="Cor da marca"
          tabIndex={tabIndex(items.length - 1)}
          className={b.swatchOpt}
          onClick={() => select(items.length - 1)}
          onKeyDown={(e) => onKey(e, items.length - 1)}
        >
          <span className={`${b.swatchDot} ${b.customDot}`} style={p.custom ? { background: p.custom } : undefined} aria-hidden="true" />
          <span aria-hidden="true">Da marca</span>
        </button>
      </div>
      {p.custom && (
        <div className={b.colorRow}>
          <label className={b.colorRow} style={{ marginTop: 0 }}>
            <input className={s.colorInput} type="color" value={p.custom} onChange={(ev) => onCustom(ev.target.value)} />
            Escolha a cor principal
          </label>
        </div>
      )}
    </>
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
