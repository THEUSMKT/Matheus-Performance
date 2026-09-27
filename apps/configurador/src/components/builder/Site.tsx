'use client';
/* ==========================================================================
   Etapa 4 — Seu site. Ordem: prévia (no painel ao lado ou acima), nome do
   projeto, investimento, resumo do que está incluído e a próxima ação.
   "Personalizar meu site" abre os ajustes na mesma tela; "Solicitar
   desenvolvimento" abre o WhatsApp com o resumo (ou, com receptor
   configurado, um formulário curto que só confirma depois de salvo).
   ========================================================================== */
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check as CheckIcon, MessageCircle } from 'lucide-react';
import { brl, customNeeds, packageById, packages, priceNotes, rank, revisionRounds } from '@/config/packages';
import { integrations, leadMode } from '@/config/integrations';
import {
  contactChannels,
  currentPackage,
  customNeedNames,
  deadlineText,
  decisionRoles,
  desiredDeadlines,
  investmentLabel,
  isCustom,
  moveSection,
  nextStepText,
  objectiveOf,
  recommendation,
  sectionName,
  sections,
  segmentLabel,
  selectedResources,
  selectedSections,
  serviceLabel,
  shareLink,
  siteContent,
  styleLabel,
  suggestedServices,
  type Lead,
  type Project,
} from '@/lib/project';
import { buildPayload, createSubmitter, reasonText, submitLead, validateLead, type FieldErrors, type SubmitResult } from '@/lib/leads';
import type { Origin } from '@/lib/origin';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { Check } from '../landing/Controls';
import { asset } from '../landing/Chrome';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

type Row = { label: string; value: string; step?: number };

/** Linhas do resumo, iguais na página, no PDF e (em conteúdo) na mensagem. */
export function summaryRows(p: Project, { logo = false } = {}): Row[] {
  const pkg = currentPackage(p);
  return [
    { label: 'Empresa', value: p.name.trim() || 'A informar', step: 0 },
    { label: 'Segmento', value: segmentLabel(p), step: 0 },
    { label: 'Serviço ou produto principal', value: serviceLabel(p), step: 0 },
    { label: 'Objetivo', value: objectiveOf(p).name, step: 1 },
    { label: 'Estilo e cores', value: `${styleLabel(p)}${logo ? ' · com logo' : ''}`, step: 2 },
    { label: 'Pacote', value: isCustom(p) ? `Projeto personalizado (referência: ${pkg.name})` : pkg.name },
    { label: 'Valor do desenvolvimento', value: investmentLabel(p) },
    { label: `Seções (${p.sections.length} de até ${pkg.maxSections})`, value: selectedSections(p).join(', ') },
    { label: 'Recursos', value: selectedResources(p).join(', ') },
    ...(isCustom(p) ? [{ label: 'Fora dos pacotes', value: customNeedNames(p).join(', ') }] : []),
    { label: 'Prazo', value: deadlineText(p) },
    { label: 'Ajustes', value: `${revisionRounds} rodadas antes da publicação` },
    ...(p.notes.trim() ? [{ label: 'Observações', value: p.notes.trim() }] : []),
  ];
}

/** Botão principal do pedido. No modo WhatsApp é um link que abre a conversa pronta. */
export function RequestButton({ p, message, onForm, className = '' }: { p: Project; message: string; onForm: () => void; className?: string }) {
  const label = isCustom(p) ? 'Pedir orçamento personalizado' : 'Solicitar desenvolvimento';
  if (leadMode === 'receptor') {
    return (
      <button
        type="button"
        className={`${s.primary} ${className}`}
        onClick={() => {
          track('request_click', { mode: 'formulario', package: isCustom(p) ? 'personalizado' : p.pkg });
          onForm();
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <a
      className={`${s.primary} ${className}`}
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        track('request_click', { mode: 'whatsapp', package: isCustom(p) ? 'personalizado' : p.pkg });
        track('whatsapp_open', { context: 'pedido' });
      }}
    >
      <MessageCircle aria-hidden="true" /> {label}
    </a>
  );
}

export type Scope = (patch: Partial<Project>, anchor: string) => void;

export function StepSite({
  p,
  update,
  scope,
  gate,
  origin,
  message,
  logo,
  personalize,
  setPersonalize,
  formOpen,
  openForm,
  onIncluded,
  onUpgrade,
  go,
}: {
  p: Project;
  update: (patch: Partial<Project>) => void;
  scope: Scope;
  /** Caixa de confirmação de pacote, se houver uma aberta neste ponto. */
  gate: (anchor: string) => ReactNode;
  origin: Origin;
  message: string;
  logo: boolean;
  personalize: boolean;
  setPersonalize: (open: boolean) => void;
  formOpen: boolean;
  openForm: () => void;
  onIncluded: () => void;
  onUpgrade: (to: Project['pkg'], source: string) => void;
  go: (step: number) => void;
}) {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [shared, setShared] = useState('');
  const pkg = currentPackage(p);
  const custom = isCustom(p);
  const rec = recommendation(p);
  const content = siteContent(p);
  const setLead = (lead: Partial<Lead>) => update({ lead: { ...p.lead, ...lead } });

  async function copyLink() {
    const link = shareLink(p);
    setShared(link);
    track('layout_share');
    try {
      await navigator.clipboard.writeText(link);
      setStatus({ ok: true, text: 'Link copiado. Ele abre o mesmo estilo, cores, objetivo e seções — sem nome, textos, logo ou imagens.' });
    } catch {
      setStatus({ ok: false, text: 'Não foi possível copiar automaticamente. Copie o link abaixo.' });
    }
  }

  function savePdf() {
    track('pdf_save');
    try {
      window.print();
    } catch {
      setStatus({ ok: false, text: 'Não foi possível abrir a impressão. Use o menu do navegador: Imprimir → Salvar como PDF.' });
    }
  }

  return (
    <>
      <p className={b.projectName}>Site de {content.name}</p>

      <div className={b.invest}>
        <span className={b.investLabel}>Desenvolvimento</span>
        <strong className={b.investValue} data-testid="investimento">
          {investmentLabel(p)}
        </strong>
        <span className={b.investNote}>
          {custom
            ? `Projeto personalizado: ${customNeedNames(p).join(', ').toLowerCase()}. O valor é combinado antes da contratação; sua prévia continua salva.`
            : `Pacote ${pkg.name} · ${priceNotes.payment}`}
        </span>
        {!custom && rank(rec.pkg) > rank(p.pkg) && (
          <div className={b.investRec}>
            <p>{rec.reason}</p>
            <button type="button" className={b.investRecButton} onClick={() => onUpgrade(rec.pkg, 'seu_site')}>
              Ver o {packageById(rec.pkg).name} — {brl(packageById(rec.pkg).price)} no total
            </button>
          </div>
        )}
      </div>
      {gate('seu_site')}

      <ul className={b.includedList} aria-label="Incluído no seu pacote">
        <li>
          Uma página com {p.sections.length} de até {pkg.maxSections} seções
        </li>
        <li>Seu estilo, suas cores e sua logo</li>
        <li>Botão de WhatsApp{p.form ? ', formulário' : ''} e links para as redes</li>
        <li>
          {revisionRounds} rodadas de ajustes · prazo de {custom ? 'acordo com o orçamento' : pkg.deadline}
        </li>
      </ul>

      <div className={b.request} id="pedido">
        {leadMode === 'receptor' && formOpen ? (
          <LeadForm p={p} origin={origin} setLead={setLead} message={message} />
        ) : (
          <>
            <label className={s.field}>
              Observações para o atendimento <small>Opcional</small>
              <textarea
                id="observacoes"
                rows={2}
                maxLength={500}
                value={p.notes}
                placeholder="Ex.: já tenho domínio; quero destacar a instalação"
                onChange={(ev) => update({ notes: ev.target.value })}
              />
            </label>
            <div className={b.desktopOnly}>
              <RequestButton p={p} message={message} onForm={openForm} className={b.wide} />
            </div>
            {leadMode === 'whatsapp' && (
              <>
                <p className={b.muted} style={{ marginTop: 8 }}>
                  Abre o WhatsApp com o resumo do seu projeto. Nada é enviado sem você confirmar, e o pedido só é considerado recebido quando respondermos.
                </p>
                <details className={s.details}>
                  <summary>Ver a mensagem</summary>
                  <div className={s.detailsBody}>
                    <label className={s.field}>
                      Seu nome <small>Opcional</small>
                      <input maxLength={80} value={p.lead.name} onChange={(ev) => setLead({ name: ev.target.value })} autoComplete="name" />
                    </label>
                    <Qualification p={p} setLead={setLead} />
                    <pre className={s.messagePreview}>{message}</pre>
                  </div>
                </details>
              </>
            )}
          </>
        )}
      </div>

      <div className={b.secondaryActions}>
        <button
          type="button"
          className={`${s.secondary} ${s.small}`}
          aria-expanded={personalize}
          aria-controls="personalizar"
          onClick={() => setPersonalize(!personalize)}
        >
          Personalizar meu site
        </button>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={onIncluded}>
          Ver o que está incluído
        </button>
      </div>

      {personalize && <Personalize p={p} update={update} scope={scope} gate={gate} go={go} />}

      <dl className={b.rows}>
        {summaryRows(p, { logo })
          .filter((r) => r.step !== undefined)
          .map((r) => (
            <div key={r.label} className={b.row}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
              <button type="button" className={b.textButton} onClick={() => go(r.step!)} aria-label={`Editar ${r.label.toLowerCase()}`}>
                Editar
              </button>
            </div>
          ))}
      </dl>

      <div className={b.tools}>
        <button type="button" className={b.toolButton} onClick={copyLink}>
          Compartilhar opções de layout
        </button>
        <button type="button" className={b.toolButton} onClick={savePdf}>
          Salvar resumo em PDF
        </button>
      </div>
      <p className={b.muted} style={{ marginTop: 6 }}>
        O link leva estilo, cores, objetivo e seções. Nome, textos, logo e imagens ficam só neste dispositivo.
      </p>
      {status && (
        <p className={`${s.status} ${status.ok ? s.statusOk : s.statusError}`} role="status">
          {status.text}
        </p>
      )}
      {shared && !status?.ok && (
        <label className={s.field} style={{ marginTop: 10 }}>
          Link das opções de layout
          <input readOnly value={shared} onFocus={(ev) => ev.target.select()} />
        </label>
      )}
      <p className={b.muted} style={{ marginTop: 14 }}>
        {nextStepText} <a href={asset('/#perguntas')}>Ver dúvidas</a>
      </p>
    </>
  );
}

/* ── Personalizar meu site ─────────────────────────────────────────────── */

function Personalize({ p, update, scope, gate, go }: { p: Project; update: (patch: Partial<Project>) => void; scope: Scope; gate: (anchor: string) => ReactNode; go: (step: number) => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const content = siteContent(p);
  const suggested = suggestedServices(p);
  const pkg = currentPackage(p);
  const optional = sections.filter((x) => !x.fixed);
  const middle = p.sections.slice(1, -1);
  const services = [0, 1, 2].map((i) => p.services[i] ?? '');
  const setService = (i: number, v: string) => {
    const next = [...services];
    next[i] = v;
    update({ services: next });
  };

  return (
    <section className={b.personalize} id="personalizar" aria-labelledby="personalizar-titulo">
      <h2 id="personalizar-titulo" ref={heading} tabIndex={-1}>
        Personalizar meu site
      </h2>
      <p className={b.muted}>Tudo aparece na prévia na hora. Campos vazios usam a sugestão.</p>

      <fieldset className={b.group}>
        <legend className={b.label}>Título e apresentação</legend>
        <div className={s.fields}>
          <label className={s.field}>
            Título
            <input maxLength={90} value={p.headline} placeholder={content.titleSuggested ? content.title : ''} onChange={(ev) => update({ headline: ev.target.value })} />
          </label>
          <label className={s.field}>
            Frase de apresentação
            <textarea rows={2} maxLength={200} value={p.description} placeholder={content.introSuggested ? content.intro : ''} onChange={(ev) => update({ description: ev.target.value })} />
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
          <button type="button" className={b.textButton} onClick={() => update({ services: suggested })}>
            Confirmar as sugestões
          </button>
        )}
      </fieldset>

      <div className={b.group}>
        <span className={b.label}>Estilo e cores</span>
        <p className={b.muted}>
          {styleLabel(p)}.{' '}
          <button type="button" className={b.textButton} onClick={() => go(2)}>
            Trocar estilo e cores
          </button>
        </p>
      </div>

      <div className={b.group}>
        <span className={b.label}>Imagens</span>
        <p className={b.muted}>A prévia usa ilustrações de exemplo. No site final entram as suas fotos e a sua logo.</p>
        {p.sections.includes('galeria') && (
          <div className={s.chips} role="radiogroup" aria-label="Imagens na galeria" style={{ marginTop: 8 }}>
            {packages
              .filter((x) => x.galleryImages)
              .map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  className={s.chip}
                  aria-checked={p.gallery === x.galleryImages}
                  onClick={() => scope({ gallery: x.galleryImages }, 'imagens')}
                >
                  Até {x.galleryImages} fotos
                </button>
              ))}
          </div>
        )}
        {gate('imagens')}
      </div>

      <div className={b.group}>
        <span className={b.label}>
          Seções incluídas{' '}
          <small>
            {p.sections.length} de até {pkg.maxSections} no {pkg.name}
          </small>
        </span>
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

      {middle.length > 1 && (
        <div className={b.group}>
          <span className={b.label} id="rotulo-ordem">
            Ordem das seções
          </span>
          <ol className={b.order} aria-labelledby="rotulo-ordem">
            {middle.map((id, i) => (
              <li key={id}>
                <span>{sectionName(p, id)}</span>
                <button type="button" onClick={() => update(moveSection(p, id, -1))} disabled={i === 0} aria-label={`Subir ${sectionName(p, id)}`}>
                  <ArrowUp aria-hidden="true" /> Subir
                </button>
                <button type="button" onClick={() => update(moveSection(p, id, 1))} disabled={i === middle.length - 1} aria-label={`Descer ${sectionName(p, id)}`}>
                  <ArrowDown aria-hidden="true" /> Descer
                </button>
              </li>
            ))}
          </ol>
          <p className={b.muted}>Apresentação fica sempre no topo e contato, no fim.</p>
        </div>
      )}

      <details className={s.details} id="personalizado" open={p.complex.length > 0}>
        <summary>Preciso de algo fora dos pacotes</summary>
        <div className={s.detailsBody}>
          <p className={b.muted}>Estes itens pedem orçamento personalizado. Sua prévia continua salva.</p>
          {customNeeds.map((n) => (
            <Check key={n.id} title={n.name} checked={p.complex.includes(n.id)} onChange={(on) => update({ complex: on ? [...p.complex, n.id] : p.complex.filter((c) => c !== n.id) })} />
          ))}
        </div>
      </details>

      <p className={b.saveNote}>
        <CheckIcon aria-hidden="true" /> As mudanças aparecem na prévia e ficam salvas neste dispositivo.
      </p>
    </section>
  );
}

function Qualification({ p, setLead }: { p: Project; setLead: (l: Partial<Lead>) => void }) {
  return (
    <div className={`${s.fields} ${s.twoCol}`}>
      <label className={s.field}>
        Quando pretende começar? <small>Opcional</small>
        <select value={p.lead.deadline} onChange={(ev) => setLead({ deadline: ev.target.value })}>
          <option value="">Prefiro não informar</option>
          {desiredDeadlines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className={s.field}>
        Quem decide? <small>Opcional</small>
        <select value={p.lead.decision} onChange={(ev) => setLead({ decision: ev.target.value })}>
          <option value="">Prefiro não informar</option>
          {decisionRoles.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

type SendState = { kind: 'idle' } | { kind: 'enviando' } | { kind: 'enviado'; ref: string } | { kind: 'erro'; reason: Exclude<SubmitResult, { ok: true }>['reason'] };

/** Modo com receptor: só confirma depois que o receptor salvar o pedido. */
function LeadForm({ p, origin, setLead, message }: { p: Project; origin: Origin; setLead: (l: Partial<Lead>) => void; message: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [send, setSend] = useState<SendState>({ kind: 'idle' });
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const submit = useMemo(() => createSubmitter((payload) => submitLead(payload, integrations.leadEndpoint)), []);
  const channel = contactChannels.find((c) => c.id === p.lead.channel)!;

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (send.kind === 'enviando') return;
    const found = validateLead(p);
    setErrors(found);
    if (found.name) return nameRef.current?.focus();
    if (found.contact) return contactRef.current?.focus();
    track('lead_submit_attempt');
    setSend({ kind: 'enviando' });
    const result = await submit(buildPayload(p, origin));
    if (result.ok) {
      track('generate_lead', { lead_ref: result.leadRef });
      setSend({ kind: 'enviado', ref: result.leadRef });
    } else {
      track('lead_submit_error', { reason: result.reason });
      setSend({ kind: 'erro', reason: result.reason });
    }
  }

  if (send.kind === 'enviado') {
    return (
      <p className={`${s.status} ${s.statusOk}`} role="status">
        Pedido recebido e registrado (referência {send.ref}).{' '}
        {integrations.responseExpectation ? `Retornamos ${integrations.responseExpectation}.` : 'O retorno será feito pelo canal que você escolheu.'}
      </p>
    );
  }

  return (
    <form id="formulario-pedido" onSubmit={onSubmit} noValidate>
      <h2 className={b.formTitle}>Solicitar desenvolvimento</h2>
      <div className={`${s.fields} ${s.twoCol}`} style={{ marginTop: 12 }}>
        <label className={s.field}>
          Seu nome
          <input
            ref={nameRef}
            maxLength={80}
            value={p.lead.name}
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'erro-nome' : undefined}
            onChange={(ev) => setLead({ name: ev.target.value })}
          />
          {errors.name && (
            <span className={s.fieldError} id="erro-nome">
              {errors.name}
            </span>
          )}
        </label>
        <label className={s.field}>
          Canal preferido
          <select value={p.lead.channel} onChange={(ev) => setLead({ channel: ev.target.value, contact: '' })}>
            {contactChannels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          {channel.id === 'email' ? 'Seu e-mail' : channel.id === 'whatsapp' ? 'Seu WhatsApp com DDD' : 'Seu telefone com DDD'}
          <input
            ref={contactRef}
            maxLength={120}
            value={p.lead.contact}
            type={channel.id === 'email' ? 'email' : 'tel'}
            inputMode={channel.id === 'email' ? 'email' : 'tel'}
            autoComplete={channel.id === 'email' ? 'email' : 'tel'}
            required
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? 'erro-contato' : undefined}
            onChange={(ev) => setLead({ contact: ev.target.value })}
          />
          {errors.contact && (
            <span className={s.fieldError} id="erro-contato">
              {errors.contact}
            </span>
          )}
        </label>
      </div>
      <div style={{ marginTop: 14 }}>
        <Qualification p={p} setLead={setLead} />
      </div>
      <label className={s.checkRow} style={{ marginTop: 14 }}>
        <input type="checkbox" checked={p.lead.marketing} onChange={(ev) => setLead({ marketing: ev.target.checked })} />
        <span>
          <strong>Quero receber novidades e ofertas</strong>
          <small>Opcional e separado do pedido.</small>
        </span>
      </label>
      <p className={s.hint} style={{ marginTop: 10 }}>
        Ao enviar, você autoriza o contato sobre este pedido, conforme a <a href={asset('/privacidade/')}>Política de Privacidade</a>.
      </p>
      <button type="submit" className={s.primary} style={{ marginTop: 14, width: '100%' }} disabled={send.kind === 'enviando'} aria-busy={send.kind === 'enviando'}>
        {send.kind === 'enviando' ? 'Enviando…' : send.kind === 'erro' ? 'Tentar novamente' : 'Enviar pedido'}
      </button>
      {send.kind === 'erro' && (
        <p className={`${s.status} ${s.statusError}`} role="alert">
          {reasonText[send.reason]}
        </p>
      )}
      <p className={s.hint} style={{ marginTop: 10 }}>
        Prefere conversar agora?{' '}
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'pedido_alternativo' })}>
          Abrir o WhatsApp
        </a>
      </p>
    </form>
  );
}

/** Versão impressa: o projeto e o investimento, com a marca. Sem dados de contato. */
export function PrintSummary({ p, logo }: { p: Project; logo: boolean }) {
  return (
    <div className={s.printOnly} aria-hidden="true">
      <div className={s.printBrand}>
        <span>
          <img src={asset('/brand/simbolo.png')} alt="" />
        </span>
        Beck Performance
      </div>
      <h1>Resumo da prévia</h1>
      <p>
        {p.id ? `Ref. ${p.id} · ` : ''}
        {new Date().toLocaleDateString('pt-BR')}
      </p>
      <table>
        <tbody>
          {summaryRows(p, { logo }).map((r) => (
            <tr key={r.label}>
              <th>{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{priceNotes.payment}</p>
      <p>{nextStepText}</p>
      <p>Prévia demonstrativa: textos e imagens sugeridos são revisados antes de entrar no site final.</p>
    </div>
  );
}
