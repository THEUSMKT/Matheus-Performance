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
import { currentPackage, directions, formBenefit, moveSection, sectionName, sections, segmentOf, siteContent, suggestedServices, type Project } from '@/lib/project';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { Check } from '../landing/Controls';
import { ColorPicker, FontPicker, LogoField, StylePicker } from './Pickers';
import { ParkedNote } from './Packages';
import { previewTexts } from '../preview/SitePreview';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

type Edit = (patch: Partial<Project>) => void;
export type Scope = (patch: Partial<Project>, anchor: string) => void;
type Gate = (anchor: string) => ReactNode;

/* ── Sua prévia está pronta ────────────────────────────────────────────── */

const editedNames: Record<Project['edited'][number], string> = {
  headline: 'título',
  description: 'frase de apresentação',
  services: 'serviços',
  about: 'sobre a empresa',
  serviceDetails: 'detalhes dos serviços',
  differentials: 'diferenciais',
  processSteps: 'como funciona',
  faqQuestions: 'perguntas frequentes',
};

export function StepReady({
  p,
  edit,
  notes,
  onPersonalize,
  onEditDescription,
  editLabel,
  onReview,
  narrow,
  keptEdits = [],
  onUseNewTexts,
}: {
  p: Project;
  edit: Edit;
  /** Observações da geração (seções de outro pacote, itens fora dos pacotes). */
  notes: string[];
  /** Textos editados à mão que a nova geração manteve. */
  keptEdits?: Project['edited'];
  onUseNewTexts?: () => void;
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
      {keptEdits.length > 0 && onUseNewTexts && (
        <div className={b.keptEdits} role="status">
          <p>Mantivemos os textos que você editou ({keptEdits.map((f) => editedNames[f]).join(', ')}).</p>
          <button type="button" className={`${s.secondary} ${s.small}`} onClick={onUseNewTexts}>
            Usar os textos novos
          </button>
        </div>
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

type Regen = {
  busy: string | null;
  error: string;
  run: (field: 'about' | 'differentials' | 'processSteps' | 'faqQuestions', label: string) => void;
} | null;
type BroadEdit = (label: string, patch: Partial<Project>) => void;

export function StepContent({
  p,
  edit,
  logo,
  setLogo,
  broadEdit,
  regen,
}: {
  p: Project;
  edit: Edit;
  logo: string | null;
  setLogo: (v: string | null) => void;
  /** Mudança ampla que pode ser desfeita. */
  broadEdit: BroadEdit;
  /** Gerar outra sugestão só para uma seção (com a IA ligada). */
  regen: Regen;
}) {
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
          <button type="button" className={b.textButton} onClick={() => broadEdit('Sugestões de serviços aplicadas.', { services: suggested })}>
            Usar as sugestões
          </button>
        )}
      </fieldset>
      <SectionTexts p={p} edit={edit} broadEdit={broadEdit} regen={regen} />
      <MoreSpecific p={p} edit={edit} />
      <p className={b.muted} style={{ marginTop: 14 }}>
        A prévia usa ilustrações de exemplo. No site final entram as suas fotos.
      </p>
    </>
  );
}

type Copy = Project['previewCopy'];
type ListField = 'serviceDetails' | 'differentials' | 'processSteps' | 'faqQuestions';

/**
 * Textos de cada seção, editáveis sem gerar de novo. Os campos mostram o
 * texto que está na prévia; o que a pessoa muda fica marcado como dela e
 * uma nova geração não o substitui sem ela pedir.
 */
function SectionTexts({ p, edit, broadEdit, regen }: { p: Project; edit: Edit; broadEdit: BroadEdit; regen: Regen }) {
  const shown = previewTexts(p);
  const own = (field: keyof Copy) => p.edited.includes(field);
  const has = (id: string) => p.sections.includes(id);
  // Campo já editado mostra o texto da pessoa (mesmo vazio, enquanto ela digita); senão, o da prévia.
  const listValue = (field: ListField, i: number) => (own(field) ? p.previewCopy[field][i] ?? '' : shown[field][i] ?? '');
  const setList = (field: ListField, i: number, v: string) => {
    const base = shown[field].map((_, j) => listValue(field, j));
    edit({ previewCopy: { ...p.previewCopy, [field]: base.map((t, j) => (j === i ? v : t)) } });
  };
  const reset = (field: keyof Copy, title: string) =>
    broadEdit(`Texto sugerido de volta em “${title}”.`, { previewCopy: { ...p.previewCopy, [field]: field === 'about' ? '' : [] }, edited: p.edited.filter((f) => f !== field) });
  const services = siteContent(p).services;
  const groups: { id: string; field: keyof Copy; title: string }[] = [
    { id: 'servicos', field: 'serviceDetails', title: `${sectionName(p, 'servicos')}: uma frase para cada item` },
    { id: 'sobre', field: 'about', title: `Sobre ${siteContent(p).name}` },
    { id: 'diferenciais', field: 'differentials', title: 'Diferenciais' },
    { id: 'processo', field: 'processSteps', title: 'Como funciona' },
    { id: 'faq', field: 'faqQuestions', title: 'Perguntas frequentes' },
  ];
  const active = groups.filter((g) => has(g.id) && !(g.id === 'servicos' && (p.objective === 'produtos' || p.objective === 'trabalhos')));
  if (!active.length) return null;
  return (
    <details className={s.details} id="textos-secoes">
      <summary>Editar os textos das seções</summary>
      <div className={s.detailsBody}>
        <p className={b.muted}>Os campos mostram o texto que está na prévia. O que você mudar fica como seu.</p>
        {regen?.error && (
          <p className={b.fieldNote} role="alert">
            {regen.error}
          </p>
        )}
        {active.map((g) => (
          <fieldset key={g.id} className={b.group}>
            <legend className={b.label}>{g.title}</legend>
            <div className={s.fields}>
              {g.field === 'about' ? (
                <label className={s.field}>
                  <span className={s.srOnly}>Texto sobre a empresa</span>
                  <textarea rows={3} maxLength={420} value={own('about') ? p.previewCopy.about : shown.about} onChange={(ev) => edit({ previewCopy: { ...p.previewCopy, about: ev.target.value } })} />
                </label>
              ) : (
                shown[g.field as ListField].slice(0, 3).map((_, i) => (
                  <label key={i} className={s.field}>
                    <span className={g.field === 'serviceDetails' ? undefined : s.srOnly}>{g.field === 'serviceDetails' ? services[i] : `${g.title} ${i + 1}`}</span>
                    <input
                      maxLength={g.field === 'serviceDetails' ? 160 : g.field === 'processSteps' ? 80 : 100}
                      value={listValue(g.field as ListField, i)}
                      onChange={(ev) => setList(g.field as ListField, i, ev.target.value)}
                    />
                  </label>
                ))
              )}
            </div>
            <div className={b.textActions}>
              {own(g.field) && (
                <button type="button" className={b.textButton} onClick={() => reset(g.field, g.title)}>
                  Voltar ao texto sugerido
                </button>
              )}
              {regen && g.field !== 'serviceDetails' && (
                <button
                  type="button"
                  className={b.textButton}
                  disabled={Boolean(regen.busy)}
                  aria-busy={regen.busy === g.field}
                  onClick={() => regen.run(g.field as 'about', g.title)}
                >
                  {regen.busy === g.field ? 'Gerando outra sugestão…' : 'Gerar outra sugestão para esta seção'}
                </button>
              )}
            </div>
          </fieldset>
        ))}
      </div>
    </details>
  );
}

/** Detalhes opcionais: só fatos informados pela pessoa. */
function MoreSpecific({ p, edit }: { p: Project; edit: Edit }) {
  const d = p.details;
  const set = (patch: Partial<Project['details']>) => edit({ details: { ...d, ...patch } });
  const realEstate = p.segment === 'imoveis';
  const filled = [d.audience, d.region, d.highlights].filter((x) => x.trim()).length;
  return (
    <details className={s.details} id="mais-especifica">
      <summary>
        Deixar minha prévia mais específica {filled > 0 && <small>({filled} de 3)</small>}
      </summary>
      <div className={s.detailsBody}>
        <p className={b.muted}>Opcional. Entra no seu pedido e ajuda se você gerar a prévia de novo pela descrição.</p>
        <div className={s.fields}>
          <label className={s.field}>
            {realEstate ? 'Tipos de imóveis e quem você atende' : 'Quem você atende'}
            <input maxLength={120} value={d.audience} placeholder={realEstate ? 'Ex.: apartamentos e casas para famílias' : 'Ex.: famílias e pequenos comércios'} onChange={(ev) => set({ audience: ev.target.value })} />
          </label>
          <label className={s.field}>
            {realEstate ? 'Cidade ou região dos imóveis' : 'Onde você atende'}
            <input maxLength={120} value={d.region} placeholder="Ex.: Porto Alegre e região metropolitana" onChange={(ev) => set({ region: ev.target.value })} />
          </label>
          <label className={s.field}>
            {realEstate ? 'Compra, venda, locação ou consultoria?' : 'O que você quer destacar'}
            <input
              maxLength={200}
              value={d.highlights}
              placeholder={realEstate ? 'Ex.: venda e locação, com visita agendada' : 'Ex.: atendimento no mesmo dia'}
              onChange={(ev) => set({ highlights: ev.target.value })}
            />
          </label>
        </div>
      </div>
    </details>
  );
}

/* ── Seções ────────────────────────────────────────────────────────────── */

export function StepSections({
  p,
  edit,
  scope,
  gate,
  onSeePackages,
  onRestore,
}: {
  p: Project;
  edit: Edit;
  scope: Scope;
  gate: Gate;
  /** Abre a comparação/escolha de pacotes. */
  onSeePackages: () => void;
  onRestore: () => void;
}) {
  const pkg = currentPackage(p);
  const optional = sections.filter((x) => !x.fixed);
  const middle = p.sections.slice(1, -1);
  /** Disponibilidade, em texto (nunca só pela cor). */
  const status = (min: Project['pkg'], on: boolean) =>
    rank(min) <= rank(p.pkg) ? (
      <span className={b.avail}>
        <CheckIcon aria-hidden="true" /> {on ? 'No seu site' : 'Incluído no seu pacote'}
      </span>
    ) : (
      <span className={b.availAbove}>Disponível no {packageById(min).name}</span>
    );
  const above = [...new Set(optional.filter((x) => rank(x.min) > rank(p.pkg)).map((x) => x.min))];
  return (
    <>
      <p className={b.hint}>
        <strong>
          {p.sections.length} de {pkg.maxSections} seções
        </strong>{' '}
        no pacote {pkg.name}. Apresentação e contato entram sempre. Incluído não é obrigatório: marque só o que fizer sentido.
      </p>
      <ParkedNote p={p} onRestore={onRestore} />
      <div className={b.group}>
        <div className={`${s.options} ${b.features}`}>
          {optional.map((x) => {
            const on = p.sections.includes(x.id);
            return (
              <Check
                key={x.id}
                title={sectionName(p, x.id)}
                checked={on}
                hint={
                  <>
                    {x.benefit}
                    {status(x.min, on)}
                  </>
                }
                onChange={(checked) =>
                  scope({ sections: checked ? [...p.sections.slice(0, -1), x.id, 'contato'] : p.sections.filter((id) => id !== x.id), structureEdited: true }, 'secoes')
                }
              />
            );
          })}
          <Check
            title="Formulário de atendimento"
            checked={p.form}
            hint={
              <>
                {formBenefit}
                {status('profissional', p.form)}
              </>
            }
            onChange={(checked) => scope({ form: checked }, 'secoes')}
          />
        </div>
        {gate('secoes')}
        {above.length > 0 && (
          <p className={b.seePkg}>
            {above.map((id) => (
              <button key={id} type="button" className={b.textButton} onClick={onSeePackages}>
                Ver pacote {packageById(id).name}
              </button>
            ))}
          </p>
        )}
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
