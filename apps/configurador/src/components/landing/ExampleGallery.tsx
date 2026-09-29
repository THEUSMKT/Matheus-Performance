'use client';
/* ==========================================================================
   Modelos demonstrativos por segmento (página de exemplos): um para cada
   família visual, montados pelo mesmo plano da criação (lib/plan.ts) — a
   miniatura, o exemplo aberto e a prévia criada a partir dele são iguais.

   Grade — uma coluna no celular, sem rolagem lateral para descobrir os
   modelos. Filtros quebram linha e têm área de toque de 44px.
   "Criar minha prévia com este modelo" é um link comum para a criação com
   ?modelo=<segmento>: funciona mesmo sem o script desta página, e é a
   página de criação que pergunta antes de substituir um rascunho (a versão
   anterior fica guardada para recuperar). "Ver no computador e no celular"
   abre a demonstração com a alternância de aparelho.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Smartphone, X } from 'lucide-react';
import { brl, packageById } from '@/config/packages';
import { exampleProject, familyOf, segments, subsegmentOf } from '@/lib/project';
import { track } from '@/lib/analytics';
import { SitePreview } from '../preview/SitePreview';
import { builderHref } from './Chrome';
import { DesktopFrame, PhoneFrame } from './DemoFrames';
import { useNarrow } from './useProject';
import s from './Landing.module.css';

export const demoSegments = segments;

/** Link da criação já com o modelo (a criação confirma antes de trocar um rascunho). */
export const modelHref = (id: string) => `${builderHref}?modelo=${id}`;

function packageOf(id: string) {
  return packageById(exampleProject(id).pkg);
}

/** Nome fictício e família do exemplo (os mesmos que a prévia mostra). */
function exampleInfo(id: string) {
  const p = exampleProject(id);
  return { demo: subsegmentOf(p).demo, family: familyOf(p) };
}

export function ExampleGallery({ initialFilter = 'todos' }: { initialFilter?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const openers = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  // No celular, o exemplo abre primeiro na versão de celular.
  const small = useNarrow('(max-width: 759px)');
  const [deviceChoice, setDevice] = useState<'desktop' | 'mobile' | null>(null);
  const device = deviceChoice ?? (small ? 'mobile' : 'desktop');
  /** Filtro por segmento. */
  const [filter, setFilter] = useState('todos');
  const shown = demoSegments.map((_, i) => i).filter((i) => filter === 'todos' || demoSegments[i].id === filter);

  // Campanha de um segmento (?segmento=): a página abre já filtrada.
  useEffect(() => {
    if (initialFilter !== 'todos' && demoSegments.some((x) => x.id === initialFilter)) setFilter(initialFilter);
  }, [initialFilter]);

  function show(index: number) {
    setOpen(index);
    track('example_opened', { segment: demoSegments[index].id });
  }

  function openAt(index: number) {
    show(index);
    dialog.current?.showModal();
  }

  function onClose() {
    const index = open;
    setOpen(null);
    if (index === null) return;
    // O exemplo pode ter mudado com Anterior/Próximo: volta ao cartão dele, mostrando todos se preciso.
    if (!shown.includes(index)) setFilter('todos');
    requestAnimationFrame(() => {
      const el = openers.current[index];
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  function changeDevice(next: 'desktop' | 'mobile') {
    setDevice(next);
    if (open !== null) track('example_view_mode', { segment: demoSegments[open].id, device: next === 'desktop' ? 'computador' : 'celular' });
  }

  const opened = open === null ? null : demoSegments[open];

  return (
    <>
      <div className={s.exampleFilter} role="group" aria-label="Filtrar modelos por segmento">
        {[{ id: 'todos', short: 'Todos' }, ...demoSegments].map((x) => (
          <button key={x.id} type="button" className={s.chip} aria-pressed={filter === x.id} onClick={() => setFilter(x.id)}>
            {x.short}
          </button>
        ))}
      </div>
      <p className={s.srOnly} aria-live="polite">
        {filter === 'todos' ? `${demoSegments.length} modelos, cada um com uma composição própria.` : `Mostrando o modelo de ${demoSegments.find((x) => x.id === filter)?.name}.`}
      </p>

      <ul className={s.exampleGrid}>
        {shown.map((i) => {
          const x = demoSegments[i];
          const pkg = packageOf(x.id);
          const info = exampleInfo(x.id);
          return (
            <li key={x.id} className={s.exampleCard}>
              <button
                type="button"
                className={s.exampleThumb}
                onClick={() => openAt(i)}
                aria-label={`Ver o modelo de ${x.name} no computador e no celular`}
                tabIndex={-1}
              >
                <DesktopFrame width={900}>
                  <SitePreview project={exampleProject(x.id)} compact demo lazy />
                </DesktopFrame>
              </button>
              <div className={s.exampleInfo}>
                <p className={s.exampleTag}>Modelo demonstrativo</p>
                <h3 className={s.exampleName}>{x.name}</h3>
                <p className={s.examplePurpose}>{x.purpose}</p>
                <p className={s.exampleDemo}>
                  Composição {info.family.name.toLowerCase()} — {info.family.concept.toLowerCase()}. Nome fictício: {info.demo}. Montado no pacote {pkg.name}{' '}
                  <span className={s.keep}>({brl(pkg.price)})</span>.
                </p>
              </div>
              <div className={s.exampleActions}>
                <a className={s.primary} href={modelHref(x.id)} onClick={() => track('start_click', { context: 'exemplo' })}>
                  Criar minha prévia com este modelo
                </a>
                <button
                  type="button"
                  className={s.secondary}
                  ref={(el) => {
                    openers.current[i] = el;
                  }}
                  onClick={() => openAt(i)}
                  aria-haspopup="dialog"
                >
                  Ver no computador e no celular
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <dialog ref={dialog} className={s.dialog} aria-labelledby="exemplo-titulo" onClose={onClose} onClick={(ev) => ev.target === dialog.current && dialog.current?.close()}>
        {opened && open !== null && (
          <>
            <div className={s.demoHead}>
              <div>
                <h3 id="exemplo-titulo">{opened.name}</h3>
                <p>Modelo demonstrativo, com o nome fictício {exampleInfo(opened.id).demo}</p>
              </div>
              <button type="button" className={s.closeButton} onClick={() => dialog.current?.close()} aria-label="Fechar exemplo" autoFocus>
                <X aria-hidden="true" />
              </button>
            </div>
            <div className={s.viewSwitch} role="group" aria-label="Ver o exemplo no">
              <button type="button" aria-pressed={device === 'desktop'} onClick={() => changeDevice('desktop')}>
                <Monitor aria-hidden="true" /> Computador
              </button>
              <button type="button" aria-pressed={device === 'mobile'} onClick={() => changeDevice('mobile')}>
                <Smartphone aria-hidden="true" /> Celular
              </button>
            </div>
            <div className={s.demoBody}>
              {device === 'desktop' ? (
                <DesktopFrame key={`d-${opened.id}`}>
                  <SitePreview project={exampleProject(opened.id)} demo />
                </DesktopFrame>
              ) : small ? (
                // Celular de verdade: a versão móvel ocupa a tela, sem moldura nem rolagem dentro de rolagem.
                <div key={`m-${opened.id}`} className={s.demoMobile}>
                  <SitePreview project={exampleProject(opened.id)} bare mobile demo />
                </div>
              ) : (
                <PhoneFrame key={`m-${opened.id}`}>
                  <SitePreview project={exampleProject(opened.id)} bare demo />
                </PhoneFrame>
              )}
            </div>
            <div className={s.demoFoot}>
              <div className={s.demoNav}>
                <button type="button" className={s.ghost} onClick={() => show(open - 1)} disabled={open === 0}>
                  <ChevronLeft aria-hidden="true" /> Anterior
                </button>
                <span aria-live="polite">
                  {open + 1} de {demoSegments.length}
                </span>
                <button type="button" className={s.ghost} onClick={() => show(open + 1)} disabled={open === demoSegments.length - 1}>
                  Próximo <ChevronRight aria-hidden="true" />
                </button>
              </div>
              <div className={s.demoUse}>
                <a className={s.primary} href={modelHref(opened.id)} onClick={() => track('start_click', { context: 'exemplo' })}>
                  Criar minha prévia com este modelo
                </a>
                <small>
                  Leva estilo, cores e seções deste modelo, no pacote {packageOf(opened.id).name} ({brl(packageOf(opened.id).price)}). A prévia é grátis e você pode mudar tudo depois.
                </small>
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
