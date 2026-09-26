'use client';
/* ==========================================================================
   Etapa 4 — Sua prévia: investimento estimado, resumo do escopo e o pedido
   de orçamento. Sem receptor configurado, o pedido abre o WhatsApp com o
   resumo pronto — nada é dado como recebido. Com receptor, o formulário só
   confirma depois que o receptor salvar.
   ========================================================================== */
import { useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { brl, pricing } from '@/config/pricing';
import { features } from '@/config/features';
import { volumeOptions, FORM_EMAIL } from '@/config/forms';
import { integrations, leadMode } from '@/config/integrations';
import { revisionRounds } from '@/config/offer';
import {
  budgetInfo,
  budgetText,
  composition,
  contactChannels,
  decisionRoles,
  deadlineText,
  desiredDeadlines,
  directions,
  externalCostLines,
  helpMessage,
  investmentLabel,
  needsDiagnosis,
  nextStepText,
  normalizeProject,
  objectives,
  pagesLabel,
  palettes,
  planText,
  priceLabel,
  projectEstimate,
  sections,
  segmentLabel,
  selectedExtras,
  selectedSections,
  shareLink,
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

type Row = { label: string; value: string; note?: string; step?: number };

/** Linhas do resumo, iguais na página e no PDF. */
export function summaryRows(p: Project, { forPrint = false } = {}): Row[] {
  const volume = volumeOptions.find((v) => v.id === p.emailVolume);
  const objective = objectives.find((o) => o.id === p.objective);
  const rows: Row[] = [
    { label: 'Empresa', value: p.name.trim() || 'A informar', step: 0 },
    { label: 'Segmento', value: segmentLabel(p), step: 0 },
    { label: 'Objetivo', value: p.guidance ? 'Preciso de orientação para definir' : objective?.name ?? '—', step: 0 },
    {
      label: 'Estilo e cores',
      value: `${directions.find((d) => d.id === p.direction)!.name} · ${p.custom ? `cor da marca ${p.custom}` : palettes.find((c) => c.id === p.palette)!.name}`,
      step: 1,
    },
    { label: 'Estrutura', value: `${planText(p).replace(/^./, (c) => c.toUpperCase())} · ${pagesLabel(p)}`, step: 2 },
    { label: 'Seções', value: selectedSections(p).join(', '), step: 2 },
    { label: 'Recursos extras', value: selectedExtras(p).join(', ') || 'Nenhum além do WhatsApp e das redes', step: 2 },
  ];
  if (p.features.includes(FORM_EMAIL)) rows.push({ label: 'Contatos por mês', value: volume ? volume.messageLabel : 'A definir', note: volume?.summaryWarning, step: 2 });
  if (forPrint) {
    rows.push(
      { label: 'Limite de orçamento', value: budgetText(p) },
      { label: 'Prazo estimado', value: deadlineText(p) },
      { label: 'Ajustes incluídos', value: `${revisionRounds} rodadas antes da publicação` },
    );
  }
  return rows;
}

/** Botão principal do pedido. No modo WhatsApp é um link que abre a conversa pronta. */
export function QuoteButton({ message, onForm, className = '' }: { message: string; onForm: () => void; className?: string }) {
  if (leadMode === 'receptor') {
    return (
      <button
        type="button"
        className={`${s.primary} ${className}`}
        onClick={() => {
          track('quote_request', { mode: 'formulario' });
          onForm();
        }}
      >
        Solicitar orçamento
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
        track('quote_request', { mode: 'whatsapp' });
        track('whatsapp_open', { context: 'resumo' });
      }}
    >
      Solicitar orçamento
    </a>
  );
}

export function StepPreview({
  p,
  update,
  replace,
  setNotice,
  go,
  origin,
  message,
  formOpen,
  openForm,
}: {
  p: Project;
  update: (patch: Partial<Project>) => void;
  replace: (next: Project) => void;
  setNotice: (t: string) => void;
  go: (step: number) => void;
  origin: Origin;
  message: string;
  formOpen: boolean;
  openForm: () => void;
}) {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [shared, setShared] = useState('');
  const diagnosis = needsDiagnosis(p);
  const e = projectEstimate(p);
  const setLead = (lead: Partial<Lead>) => update({ lead: { ...p.lead, ...lead } });

  async function copyLink() {
    const link = shareLink(p);
    setShared(link);
    track('share_link');
    try {
      await navigator.clipboard.writeText(link);
      setStatus({ ok: true, text: 'Link copiado. Ele leva só as opções — sem nome, contato ou textos.' });
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
      <div className={b.estimate}>
        <span className={b.estimateLabel}>Investimento estimado</span>
        <strong className={b.estimateValue} data-testid="estimate">
          {investmentLabel(p)}
        </strong>
        <span className={b.estimateNote}>
          {diagnosis ? 'Definido depois de um levantamento, antes da contratação.' : `Pagamento único · ${e.deadline} após receber textos, imagens e logo`}
        </span>
        <span className={b.estimateNote}>É uma estimativa: o valor final é confirmado por escrito antes da contratação.</span>
        {!diagnosis && (
          <details>
            <summary>Ver composição do valor</summary>
            <table>
              <tbody>
                {composition(p).map((l, i) => (
                  <tr key={`${l.label}-${i}`}>
                    <td>{l.label}</td>
                    <td>{l.value > 0 ? brl(l.value) : 'Incluído'}</td>
                  </tr>
                ))}
                <tr>
                  <td>Valor calculado (a faixa varia {Math.round(pricing.rangeSpread * 100)}%)</td>
                  <td>{brl(e.total)}</td>
                </tr>
              </tbody>
            </table>
          </details>
        )}
      </div>

      <dl className={b.rows}>
        {summaryRows(p).map((r) => (
          <div key={r.label} className={b.row}>
            <dt>{r.label}</dt>
            <dd>
              {r.value}
              {r.note && <small className={b.muted} style={{ display: 'block' }}>{r.note}</small>}
            </dd>
            {r.step !== undefined && (
              <button type="button" className={b.textButton} onClick={() => go(r.step!)} aria-label={`Editar ${r.label.toLowerCase()}`}>
                Editar
              </button>
            )}
          </div>
        ))}
      </dl>
      <p className={b.muted} style={{ marginTop: 10 }}>
        Não incluídos: {externalCostLines(p).join(', ').toLowerCase()}. <a href={asset('/#perguntas')}>Ver dúvidas</a>
      </p>

      <div className={b.request} id="pedido">
        <h3>Solicitar orçamento</h3>
        <p className={b.muted} style={{ marginTop: 4 }}>
          {nextStepText}
        </p>
        {leadMode === 'receptor' ? (
          formOpen ? (
            <LeadForm p={p} origin={origin} setLead={setLead} message={message} />
          ) : (
            <div className={b.desktopOnly}>
              <QuoteButton message={message} onForm={openForm} className={b.wide} />
            </div>
          )
        ) : (
          <>
            <label className={s.field} style={{ marginTop: 12 }}>
              Seu nome <small>Opcional</small>
              <input maxLength={80} value={p.lead.name} onChange={(ev) => setLead({ name: ev.target.value })} autoComplete="name" />
            </label>
            <details className={s.details}>
              <summary>Mais detalhes (opcional)</summary>
              <div className={s.detailsBody}>
                <Qualification p={p} setLead={setLead} />
              </div>
            </details>
            <div className={b.desktopOnly}>
              <QuoteButton message={message} onForm={openForm} className={b.wide} />
            </div>
            <p className={b.muted} style={{ marginTop: 8 }}>
              Abre o WhatsApp com o resumo. Nada é enviado sem você confirmar.
            </p>
            <details className={s.details}>
              <summary>Ver a mensagem</summary>
              <div className={s.detailsBody}>
                <pre className={s.messagePreview}>{message}</pre>
              </div>
            </details>
          </>
        )}
      </div>

      <div className={b.tools}>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={copyLink}>
          Copiar link
        </button>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={savePdf}>
          Salvar em PDF
        </button>
      </div>
      {status && (
        <p className={`${s.status} ${status.ok ? s.statusOk : s.statusError}`} role="status">
          {status.text}
        </p>
      )}
      {shared && !status?.ok && (
        <label className={s.field} style={{ marginTop: 10 }}>
          Link das opções
          <input readOnly value={shared} onFocus={(ev) => ev.target.select()} />
        </label>
      )}

      <details className={s.details}>
        <summary>Comparar com meu orçamento</summary>
        <div className={s.detailsBody}>
          <BudgetTool p={p} edit={update} replace={replace} setNotice={setNotice} />
        </div>
      </details>

      <a className={b.helpLink} href={whatsappLink(helpMessage(p))} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'ajuda' })}>
        <MessageCircle aria-hidden="true" /> Dúvidas? Fale no WhatsApp
      </a>
    </>
  );
}

function Qualification({ p, setLead }: { p: Project; setLead: (l: Partial<Lead>) => void }) {
  return (
    <div className={`${s.fields} ${s.twoCol}`}>
      <label className={s.field}>
        Quando pretende começar?
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
        Quem decide?
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
      <div className={`${s.fields} ${s.twoCol}`} style={{ marginTop: 14 }}>
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
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'resumo_alternativo' })}>
          Abrir o WhatsApp
        </a>
      </p>
    </form>
  );
}

/** Limite de orçamento: compara com a faixa e explica quando pode passar. */
function BudgetTool({ p, edit, replace, setNotice }: { p: Project; edit: (x: Partial<Project>) => void; replace: (x: Project) => void; setNotice: (t: string) => void }) {
  const info = budgetInfo(p);
  const e = projectEstimate(p);
  const spread = Math.round(pricing.rangeSpread * 100);

  // Sugestão: o opcional pago cuja remoção mais reduz a faixa. Nada sai sozinho.
  const best = p.features
    .filter((f) => (pricing.byFeature[f] ?? 0) > 0)
    .map((f) => {
      const next = normalizeProject({ ...p, features: p.features.filter((x) => x !== f), sections: p.sections.filter((id) => sections.find((x) => x.id === id)?.feature !== f) });
      return { f, next, total: projectEstimate(next).total };
    })
    .sort((a, c) => a.total - c.total)[0];
  const showSuggestion = info.status === 'valido' && (info.fit === 'pode_ultrapassar' || info.fit === 'excede');
  const name = best ? features.find((x) => x.id === best.f)?.name : '';

  return (
    <>
      <Check title="Quero comparar com um limite" hint="O valor fica só no resumo e na mensagem." checked={p.budgetOn} onChange={(on) => edit({ budgetOn: on })} />
      {p.budgetOn && (
        <div className={s.infoBox}>
          <label className={s.field}>
            Meu limite para o desenvolvimento (R$)
            <input
              inputMode="decimal"
              maxLength={16}
              value={p.budget}
              placeholder="Ex.: 1.200"
              aria-invalid={info.status === 'invalido'}
              aria-describedby="orcamento-status"
              onChange={(ev) => edit({ budget: ev.target.value })}
            />
          </label>
          <p id="orcamento-status" style={{ marginTop: 8 }} aria-live="polite" className={info.status === 'invalido' ? s.fieldError : undefined}>
            {info.status === 'ausente' && 'Informe um valor para comparar com a estimativa.'}
            {info.status === 'invalido' && 'Não reconhecemos esse valor. Use só números, como 1200 ou 1.200,00.'}
            {info.status === 'abaixo' && `O projeto base começa em ${brl(pricing.base)}. Com esse limite, vale conversar sobre o que é possível.`}
            {info.status === 'valido' && info.fit === 'cabe' && `A faixa estimada (${priceLabel(p)}) cabe no seu limite. Custos externos ficam à parte.`}
            {info.status === 'valido' && info.fit === 'pode_ultrapassar' && `Seu limite está dentro da faixa, mas o teto (${brl(e.max)}) pode ultrapassá-lo.`}
            {info.status === 'valido' && info.fit === 'excede' && `Mesmo o início da faixa (${brl(e.min)}) passa do seu limite.`}
            {info.status === 'valido' && info.fit === 'diagnostico' && 'Com itens que dependem de levantamento, a comparação é feita depois dele.'}
          </p>
          {showSuggestion && (
            <>
              <p style={{ marginTop: 8 }}>A faixa varia {spread}% conforme o conteúdo e os detalhes confirmados na conversa.</p>
              {best ? (
                <div className={s.actionRow} style={{ alignItems: 'center' }}>
                  <span>
                    Sem “{name}”, a faixa fica em {priceLabel(best.next)}.
                  </span>
                  <button
                    type="button"
                    className={`${s.secondary} ${s.small}`}
                    onClick={() => {
                      replace(best.next);
                      setNotice(`“${name}” removido a seu pedido. A estimativa foi recalculada.`);
                    }}
                  >
                    Remover este item
                  </button>
                </div>
              ) : (
                <p style={{ marginTop: 8 }}>Revise o estilo, as cores da marca e a categoria. Nada é removido sem você confirmar.</p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

/** Versão impressa: só o projeto, com a marca. Sem dados de contato. */
export function PrintSummary({ p }: { p: Project }) {
  const diagnosis = needsDiagnosis(p);
  const e = projectEstimate(p);
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
      <h2>Escopo</h2>
      <table>
        <tbody>
          {summaryRows(p, { forPrint: true }).map((r) => (
            <tr key={r.label}>
              <th>{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Investimento no desenvolvimento</h2>
      {diagnosis ? (
        <p>Sob diagnóstico: o valor é definido após o levantamento, antes da contratação.</p>
      ) : (
        <table>
          <tbody>
            {composition(p).map((l, i) => (
              <tr key={i}>
                <td>{l.label}</td>
                <td>{l.value > 0 ? brl(l.value) : 'Incluído'}</td>
              </tr>
            ))}
            <tr>
              <td>Valor calculado</td>
              <td>{brl(e.total)}</td>
            </tr>
            <tr>
              <td>Faixa estimada</td>
              <td>{investmentLabel(p)}</td>
            </tr>
          </tbody>
        </table>
      )}
      <h2>Não incluído</h2>
      <p>{externalCostLines(p).join(' · ')} — pagos direto aos fornecedores.</p>
      <p>{nextStepText}</p>
      <p>Estimativa gerada na prévia; não é proposta comercial. Escopo, investimento e prazo são confirmados por escrito.</p>
    </div>
  );
}
