'use client';
/* ==========================================================================
   Depois da prévia: a tela "Sua prévia está pronta" e a personalização com
   uma escolha por vez — estilo, cores, títulos, conteúdo e seções. Cada
   escolha atualiza a prévia na hora e fica marcada; nada avança sozinho
   (a pessoa compara e só então clica em "Continuar"). Mudanças que pedem
   outro pacote passam pela confirmação de sempre (scope/gate).
   ========================================================================== */
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check as CheckIcon, MessageCircle, Sparkles } from 'lucide-react';
import { contact } from '@/config/contact';
import { customNeeds, packageById, packages, rank } from '@/config/packages';
import { currentPackage, directions, moveSection, sectionName, sections, segmentOf, siteContent, suggestedServices, type Project } from '@/lib/project';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { Check } from '../landing/Controls';
import { ColorPicker, FontPicker, LogoField, StylePicker } from './Pickers';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

type Edit = (patch: Partial<Project>) => void;
export type Scope = (patch: Partial<Project>, anchor: string) => void;
type Gate = (anchor: string) => ReactNode;

/* ── Sua prévia está pronta ────────────────────────────────────────────── */

export function StepReady({
  p,
  edit,
  notes,
  onPersonalize,
  onEditDescription,
  editLabel,
  onReview,
  narrow,
}: {
  p: Project;
  edit: Edit;
  /** Observações da geração (seções de outro pacote, itens fora dos pacotes). */
  notes: string[];
  onPersonalize: () => void;
  onEditDescription: () => void;
  editLabel: string;
  onReview: () => void;
  narrow: boolean;
}) {
  return (
    <div className={b.ready}>
      <p className={b.readyLead}>
        <Sparkles aria-hidden="true" /> {narrow ? 'Toque em “Ver meu site” para explorar.' : 'Explore o site ao lado.'} Você pode mudar estilo, cores, títulos, textos e seções.
      </p>
      {!p.name.trim() && (
        <label className={`${s.field} ${b.group}`}>
          Nome da empresa <small>Aparece no topo do site</small>
          <input id="nome-pronta" maxLength={80} value={p.name} autoComplete="organization" placeholder="Ex.: Clima Sul Refrigeração" onChange={(ev) => edit({ name: ev.target.value })} />
        </label>
      )}
      {notes.length > 0 && (
        <ul className={b.readyNotes}>
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      <div className={b.readyActions}>
        <button type="button" className={`${s.primary} ${b.wideBtn}`} onClick={onPersonalize}>
          Personalizar meu site
        </button>
        <button type="button" className={`${s.secondary} ${b.wideBtn}`} onClick={onEditDescription}>
          {editLabel}
        </button>
      </div>
      <button type="button" className={b.textButton} onClick={onReview}>
        Gostei assim — revisar e solicitar
      </button>
    </div>
  );
}

/* ── Estilo ────────────────────────────────────────────────────────────── */

export function StepStyle({ p, edit }: { p: Project; edit: Edit }) {
  const seg = segmentOf(p);
  const suggested = seg.styles;
  const ordered = [...suggested, ...directions.map((d) => d.id).filter((id) => !suggested.includes(id))];
  const current = directions.find((d) => d.id === p.direction)!;
  return (
    <>
      <p className={b.hint}>Cada estilo muda a composição do site. Toque para comparar; a prévia muda na hora.</p>
      <p className={b.currentPick} aria-live="polite">
        Escolhido: <strong>{current.name}</strong> — {current.description}
      </p>
      <StylePicker p={p} ids={ordered} suggested={suggested} labelledBy="etapa-titulo" onChange={(id) => edit({ direction: id, identitySet: true })} />
      <a
        className={b.otherStyle}
        href={whatsappLink(contact.whatsappEstilo)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_open', { context: 'estilo_diferente' })}
      >
        <MessageCircle aria-hidden="true" /> Quer um estilo fora da lista? Fale no WhatsApp
      </a>
    </>
  );
}

/* ── Cores ─────────────────────────────────────────────────────────────── */

export function StepColors({ p, edit }: { p: Project; edit: Edit }) {
  return (
    <>
      <p className={b.hint}>As cores entram no topo, nos títulos e nos botões do seu site.</p>
      <span className={s.srOnly} id="rotulo-cores">
        Cores
      </span>
      <ColorPicker p={p} onPalette={(id) => edit({ palette: id, custom: null, identitySet: true })} onCustom={(hex) => edit({ custom: hex, identitySet: true })} />
      <p className={b.included}>Estilos, cores e logo estão incluídos em todos os pacotes.</p>
    </>
  );
}

/* ── Títulos ───────────────────────────────────────────────────────────── */

export function StepFonts({ p, edit }: { p: Project; edit: Edit }) {
  return (
    <>
      <p className={b.hint}>Veja o título do seu site em cada opção.</p>
      <FontPicker p={p} onChange={(id) => edit({ font: id })} />
    </>
  );
}

/* ── Conteúdo ──────────────────────────────────────────────────────────── */

export function StepContent({ p, edit, logo, setLogo }: { p: Project; edit: Edit; logo: string | null; setLogo: (v: string | null) => void }) {
  const content = siteContent(p);
  const suggested = suggestedServices(p);
  const services = [0, 1, 2].map((i) => p.services[i] ?? '');
  const setService = (i: number, v: string) => {
    const next = [...services];
    next[i] = v;
    edit({ services: next });
  };
  return (
    <>
      <p className={b.hint}>Campos vazios usam a sugestão que aparece na prévia.</p>
      <div className={`${s.fields} ${b.group}`}>
        <label className={s.field}>
          Nome da empresa
          <input id="nome-conteudo" maxLength={80} value={p.name} autoComplete="organization" placeholder="Ex.: Clima Sul Refrigeração" onChange={(ev) => edit({ name: ev.target.value })} />
        </label>
      </div>
      <div className={b.group}>
        <span className={b.label}>
          Logo <small>Opcional</small>
        </span>
        <LogoField logo={logo} onChange={setLogo} />
      </div>
      <fieldset className={b.group}>
        <legend className={b.label}>Título e apresentação</legend>
        <div className={s.fields}>
          <label className={s.field}>
            Título
            <input maxLength={90} value={p.headline} placeholder={content.titleSuggested ? content.title : ''} onChange={(ev) => edit({ headline: ev.target.value })} />
          </label>
          <label className={s.field}>
            Frase de apresentação
            <textarea rows={2} maxLength={200} value={p.description} placeholder={content.introSuggested ? content.intro : ''} onChange={(ev) => edit({ description: ev.target.value })} />
          </label>
        </div>
      </fieldset>
      <fieldset className={b.group}>
        <legend className={b.label}>{sectionName(p, 'servicos')}</legend>
        <div className={s.fields}>
          {services.map((v, i) => (
            <label key={i} className={s.field}>
              <span className={s.srOnly}>Item {i + 1}</span>
              <input maxLength={60} value={v} placeholder={suggested[i] ?? `Item ${i + 1}`} onChange={(ev) => setService(i, ev.target.value)} />
            </label>
          ))}
        </div>
        {content.servicesSuggested && (
          <button type="button" className={b.textButton} onClick={() => edit({ services: suggested })}>
            Usar as sugestões
          </button>
        )}
      </fieldset>
      <p className={b.muted} style={{ marginTop: 14 }}>
        A prévia usa ilustrações de exemplo. No site final entram as suas fotos.
      </p>
    </>
  );
}

/* ── Seções ────────────────────────────────────────────────────────────── */

export function StepSections({ p, edit, scope, gate }: { p: Project; edit: Edit; scope: Scope; gate: Gate }) {
  const pkg = currentPackage(p);
  const optional = sections.filter((x) => !x.fixed);
  const middle = p.sections.slice(1, -1);
  return (
    <>
      <p className={b.hint}>
        {p.sections.length} de até {pkg.maxSections} seções no pacote {pkg.name}. Apresentação e contato entram sempre.
      </p>
      <div className={b.group}>
        <div className={s.options}>
          {optional.map((x) => {
            const on = p.sections.includes(x.id);
            const above = rank(x.min) > rank(p.pkg);
            return (
              <Check
                key={x.id}
                title={sectionName(p, x.id)}
                checked={on}
                hint={x.hint}
                aside={above && !on ? `No ${packageById(x.min).name}` : undefined}
                onChange={(checked) =>
                  scope({ sections: checked ? [...p.sections.slice(0, -1), x.id, 'contato'] : p.sections.filter((id) => id !== x.id), structureEdited: true }, 'secoes')
                }
              />
            );
          })}
          <Check
            title="Formulário que encaminha o pedido ao WhatsApp"
            checked={p.form}
            hint="Organiza nome e pedido antes de abrir a conversa."
            aside={!p.form && rank('profissional') > rank(p.pkg) ? 'No Profissional' : undefined}
            onChange={(checked) => scope({ form: checked }, 'secoes')}
          />
        </div>
        {gate('secoes')}
      </div>

      {p.sections.includes('galeria') && (
        <div className={b.group}>
          <span className={b.label}>Fotos na galeria</span>
          <div className={s.chips} role="radiogroup" aria-label="Fotos na galeria">
            {packages
              .filter((x) => x.galleryImages)
              .map((x) => (
                <button key={x.id} type="button" role="radio" className={s.chip} aria-checked={p.gallery === x.galleryImages} onClick={() => scope({ gallery: x.galleryImages }, 'imagens')}>
                  Até {x.galleryImages} fotos
                </button>
              ))}
          </div>
          {gate('imagens')}
        </div>
      )}

      {middle.length > 1 && (
        <details className={s.details}>
          <summary>Mudar a ordem das seções</summary>
          <div className={s.detailsBody}>
            <ol className={b.order} aria-label="Ordem das seções">
              {middle.map((id, i) => (
                <li key={id}>
                  <span>{sectionName(p, id)}</span>
                  <button type="button" onClick={() => edit(moveSection(p, id, -1))} disabled={i === 0} aria-label={`Subir ${sectionName(p, id)}`}>
                    <ArrowUp aria-hidden="true" /> Subir
                  </button>
                  <button type="button" onClick={() => edit(moveSection(p, id, 1))} disabled={i === middle.length - 1} aria-label={`Descer ${sectionName(p, id)}`}>
                    <ArrowDown aria-hidden="true" /> Descer
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </details>
      )}

      <details className={s.details} id="personalizado" open={p.complex.length > 0}>
        <summary>Preciso de algo fora dos pacotes</summary>
        <div className={s.detailsBody}>
          <p className={b.muted}>Estes itens pedem orçamento personalizado. Sua prévia continua salva.</p>
          {customNeeds.map((n) => (
            <Check key={n.id} title={n.name} checked={p.complex.includes(n.id)} onChange={(on) => edit({ complex: on ? [...p.complex, n.id] : p.complex.filter((c) => c !== n.id) })} />
          ))}
        </div>
      </details>

      <p className={b.saveNote}>
        <CheckIcon aria-hidden="true" /> Tudo fica salvo neste dispositivo.
      </p>
    </>
  );
}
