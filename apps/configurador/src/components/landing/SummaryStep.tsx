'use client';
/* ==========================================================================
   Momento 4 — resumo, composição do investimento e próximo passo.
   Sem receptor configurado, o próximo passo é preparar a conversa no
   WhatsApp: nada é dado como recebido e nenhum evento de lead é emitido.
   Com receptor, o formulário só confirma depois que o receptor salvar.
   ========================================================================== */
import { useMemo, useRef, useState } from 'react';
import { brl, pricing } from '@/config/pricing';
import { plans, revisionRounds } from '@/config/offer';
import { volumeOptions, FORM_EMAIL } from '@/config/forms';
import { integrations, leadMode } from '@/config/integrations';
import {
  budgetText,
  composition,
  contactChannels,
  decisionRoles,
  deadlineText,
  desiredDeadlines,
  directions,
  externalCostLines,
  investmentLabel,
  needsDiagnosis,
  nextStepText,
  objectives,
  pagesLabel,
  palettes,
  projectEstimate,
  projectMessage,
  recommendedPlan,
  segmentLabel,
  selectedExtras,
  selectedSections,
  shareLink,
  type Lead,
  type Project,
} from '@/lib/project';
import { buildPayload, createSubmitter, reasonText, submitLead, validateLead, type FieldErrors, type SubmitResult } from '@/lib/leads';
import { originTag, type Origin } from '@/lib/origin';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { asset } from './Chrome';
import type { ProjectState } from './useProject';
import s from './Landing.module.css';

/** Linhas do resumo, iguais na página e no PDF. */
export function summaryRows(p: Project): { label: string; value: string; note?: string; step: number }[] {
  const plan = plans.find((x) => x.id === (p.plan ?? recommendedPlan(p)))!;
  const volume = volumeOptions.find((v) => v.id === p.emailVolume);
  const rows = [
    { label: 'Negócio', value: p.name.trim() || 'A informar', step: 0 },
    { label: 'Segmento', value: segmentLabel(p), step: 0 },
    { label: 'Serviço principal', value: p.service.trim() || 'A informar', step: 0 },
    { label: 'Objetivo', value: p.guidance ? 'Preciso de orientação para definir' : objectives.find((o) => o.id === p.objective)!.name, step: 0 },
    { label: 'Caminho', value: `${plan.name}${p.plan ? '' : ' (recomendado)'}`, step: 1 },
    { label: 'Estrutura', value: pagesLabel(p), step: 2 },
    { label: 'Seções', value: selectedSections(p).join(', '), step: 2 },
    { label: 'Recursos opcionais', value: selectedExtras(p).join(', ') || 'Nenhum além do incluído', note: 'WhatsApp e redes sociais já incluídos', step: 2 },
    {
      label: 'Identidade visual',
      value: `${directions.find((d) => d.id === p.direction)!.name} · ${p.custom ? `cor própria ${p.custom}` : palettes.find((c) => c.id === p.palette)!.name}`,
      step: 2,
    },
  ];
  if (p.features.includes(FORM_EMAIL)) rows.push({ label: 'Contatos por mês', value: volume ? volume.messageLabel : 'A definir', note: volume?.summaryWarning, step: 2 });
  rows.push(
    { label: 'Limite de orçamento', value: budgetText(p), step: 2 },
    { label: 'Prazo estimado', value: deadlineText(p), step: 2 },
    { label: 'Ajustes incluídos', value: `${revisionRounds} rodadas antes da publicação`, step: 2 },
  );
  return rows;
}

export function SummaryStep({ state, go, origin }: { state: ProjectState; go: (step: number) => void; origin: Origin }) {
  const { project: p, update } = state;
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [shared, setShared] = useState('');
  const diagnosis = needsDiagnosis(p);
  const e = projectEstimate(p);
  const lines = composition(p);
  const tag = originTag(origin);
  const message = projectMessage(p, tag);

  async function copyLink() {
    const link = shareLink(p);
    setShared(link);
    track('share_link');
    try {
      await navigator.clipboard.writeText(link);
      setStatus({ ok: true, text: 'Link copiado. Ele leva só as opções do projeto — sem nome, contato ou textos.' });
    } catch {
      setStatus({ ok: false, text: 'Não foi possível copiar automaticamente. Selecione o link no campo abaixo e copie.' });
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
      <dl className={s.summary}>
        {summaryRows(p).map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>
              {r.value}
              {r.note && <small>{r.note}</small>}
            </dd>
            <button type="button" className={`${s.linkButton} ${s.editLink}`} onClick={() => go(r.step)} aria-label={`Editar ${r.label.toLowerCase()}`}>
              Editar
            </button>
          </div>
        ))}
      </dl>

      {diagnosis ? (
        <p className={s.warnBox}>
          Este projeto inclui necessidades que dependem de levantamento. Por isso não há valor automático: o investimento e o prazo são definidos depois do diagnóstico, antes de qualquer contratação.
        </p>
      ) : (
        <table className={s.composition}>
          <caption>Como a estimativa é composta</caption>
          <tbody>
            {lines.map((l, i) => (
              <tr key={`${l.label}-${i}`}>
                <td>
                  {l.label}
                  {l.note && <small>{l.note}</small>}
                </td>
                <td>{l.value > 0 ? brl(l.value) : 'Incluído'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                Valor calculado
                <small>
                  A faixa varia {Math.round(pricing.rangeSpread * 100)}% para cima ou para baixo conforme o conteúdo confirmado; nunca começa abaixo de {brl(pricing.base)}.
                </small>
              </td>
              <td>{brl(e.total)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      <div className={s.finance}>
        <h4>Investimento no desenvolvimento (pagamento único)</h4>
        <p className={s.financeValue}>{investmentLabel(p)}</p>
        <dl>
          <div>
            <dt>Prazo estimado</dt>
            <dd>{deadlineText(p)}</dd>
          </div>
          <div>
            <dt>Seu limite de orçamento</dt>
            <dd>{budgetText(p)}</dd>
          </div>
          <div>
            <dt>Custos externos — não incluídos, pagos direto aos fornecedores</dt>
            <dd>{externalCostLines(p).join(' · ')}</dd>
          </div>
          <div>
            <dt>Mensalidades</dt>
            <dd>Nenhuma mensalidade de desenvolvimento. Manutenção após a entrega só se for combinada à parte.</dd>
          </div>
        </dl>
      </div>

      <div className={s.actionRow}>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={copyLink}>
          Copiar link das opções
        </button>
        <button type="button" className={`${s.secondary} ${s.small}`} onClick={savePdf}>
          Salvar resumo em PDF
        </button>
      </div>
      {status && (
        <p className={`${s.status} ${status.ok ? s.statusOk : s.statusError}`} role="status">
          {status.text}
        </p>
      )}
      {shared && !status?.ok && (
        <label className={`${s.field} ${s.block}`}>
          Link das opções
          <input readOnly value={shared} onFocus={(ev) => ev.target.select()} />
        </label>
      )}

      <div className={s.contactBlock} id="proximo-passo" style={{ scrollMarginTop: 84 }}>
        <h4>Próximo passo</h4>
        <p>{nextStepText}</p>
        {leadMode === 'receptor' ? (
          <LeadForm p={p} origin={origin} setLead={(lead) => update({ lead: { ...p.lead, ...lead } })} message={message} />
        ) : (
          <WhatsappStep p={p} setLead={(lead) => update({ lead: { ...p.lead, ...lead } })} message={message} />
        )}
      </div>
    </>
  );
}

function Qualification({ p, setLead }: { p: Project; setLead: (l: Partial<Lead>) => void }) {
  return (
    <div className={`${s.fields} ${s.twoCol}`} style={{ marginTop: 14 }}>
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
        Quem decide a contratação? <small>Opcional</small>
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

/** Modo sem receptor: prepara a conversa. Nada é enviado pela página. */
function WhatsappStep({ p, setLead, message }: { p: Project; setLead: (l: Partial<Lead>) => void; message: string }) {
  return (
    <>
      <label className={`${s.field} ${s.block}`}>
        Como podemos chamar você? <small>Opcional — entra na mensagem</small>
        <input maxLength={80} value={p.lead.name} onChange={(ev) => setLead({ name: ev.target.value })} autoComplete="name" />
      </label>
      <Qualification p={p} setLead={setLead} />
      <a
        className={`${s.primary} ${s.whatsappButton}`}
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp_open', { context: 'resumo' })}
      >
        Preparar conversa no WhatsApp
      </a>
      <p className={s.hint}>Abre o WhatsApp com o resumo pronto para você revisar. Nada é enviado até você tocar em enviar no aplicativo.</p>
      <details className={s.details}>
        <summary>Ver a mensagem que será preparada</summary>
        <div className={s.detailsBody}>
          <pre className={s.messagePreview}>{message}</pre>
        </div>
      </details>
    </>
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
    <form onSubmit={onSubmit} noValidate>
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
      <Qualification p={p} setLead={setLead} />
      <label className={s.checkRow} style={{ marginTop: 14 }}>
        <input type="checkbox" checked={p.lead.marketing} onChange={(ev) => setLead({ marketing: ev.target.checked })} />
        <span>
          <strong>Quero receber novidades e ofertas por e-mail ou WhatsApp</strong>
          <small>Opcional e separado do pedido. Você pode cancelar quando quiser.</small>
        </span>
      </label>
      <p className={s.hint} style={{ marginTop: 10 }}>
        Ao solicitar, você autoriza o contato sobre este pedido, conforme a <a href={asset('/privacidade/')}>Política de Privacidade</a>.
      </p>
      <button type="submit" className={s.primary} style={{ marginTop: 14, width: '100%' }} disabled={send.kind === 'enviando'} aria-busy={send.kind === 'enviando'}>
        {send.kind === 'enviando' ? 'Enviando…' : send.kind === 'erro' ? 'Tentar novamente' : 'Solicitar proposta'}
      </button>
      {send.kind === 'erro' && (
        <p className={`${s.status} ${s.statusError}`} role="alert">
          {reasonText[send.reason]}
        </p>
      )}
      <p className={s.hint} style={{ marginTop: 10 }}>
        Prefere conversar agora?{' '}
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_open', { context: 'resumo_alternativo' })}>
          Preparar conversa no WhatsApp
        </a>
      </p>
    </form>
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
      <h1>Resumo do projeto</h1>
      <p>
        {p.id ? `Ref. ${p.id} · ` : ''}
        {new Date().toLocaleDateString('pt-BR')}
      </p>
      <h2>Escopo</h2>
      <table>
        <tbody>
          {summaryRows(p).map((r) => (
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
      <p>Estimativa gerada pelo configurador; não é proposta comercial. Escopo, investimento e prazo são confirmados por escrito.</p>
    </div>
  );
}
