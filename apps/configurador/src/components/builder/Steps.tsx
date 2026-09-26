'use client';
/* ==========================================================================
   Etapas 1 a 3 do configurador: Seu negócio, Aparência e Conteúdo.
   Só o nome da empresa é obrigatório; o resto são escolhas com um toque.
   ========================================================================== */
import type { RefObject } from 'react';
import { Building2, Inbox, LayoutGrid, MessageCircle, ShoppingBag } from 'lucide-react';
import { pricing, brl } from '@/config/pricing';
import { features } from '@/config/features';
import { siteTypes } from '@/config/siteTypes';
import { FORM_EMAIL, FORM_WHATSAPP, emailFormNotice, volumeOptions, volumeQuestion } from '@/config/forms';
import { complexNeeds, plans, scopeRules } from '@/config/offer';
import { introSuggestions } from '@/config/copy';
import { contact } from '@/config/contact';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { applyPlan, needsDiagnosis, objectives, projectEstimate, recommendedPlan, sections, segments, type Project } from '@/lib/project';
import { Check, Radios } from '../landing/Controls';
import { LogoField, StylePicker, SwatchPicker } from './Pickers';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

type Edit = (patch: Partial<Project>) => void;

const objectiveIcon: Record<string, typeof Inbox> = { orcamento: Inbox, empresa: Building2, servicos: LayoutGrid, produtos: ShoppingBag };

/* ── Etapa 1 — Seu negócio ─────────────────────────────────────────────── */

export function StepBusiness({ p, edit, nameError, nameRef }: { p: Project; edit: Edit; nameError?: string; nameRef: RefObject<HTMLInputElement | null> }) {
  const visible = objectives.filter((o) => o.visible || o.id === p.objective);
  return (
    <>
      <div className={b.group}>
        <label className={s.field}>
          Nome da empresa
          <input
            ref={nameRef}
            id="nome-empresa"
            maxLength={80}
            value={p.name}
            placeholder="Ex.: Studio Aurora"
            autoComplete="organization"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'erro-nome-empresa' : undefined}
            onChange={(ev) => edit({ name: ev.target.value })}
          />
          {nameError && (
            <span className={s.fieldError} id="erro-nome-empresa">
              {nameError}
            </span>
          )}
        </label>
      </div>

      <Radios label="Segmento" variant="chip" value={p.segment} options={segments.map((x) => ({ id: x.id, label: x.id === 'outro' ? 'Outro' : x.name }))} onChange={(id) => edit({ segment: id })} />
      {p.segment === 'outro' && (
        <label className={`${s.field} ${b.group}`} style={{ marginTop: 12 }}>
          Qual é o segmento? <small>Opcional</small>
          <input id="segmento-outro" maxLength={60} value={p.segmentOther} placeholder="Ex.: escola de idiomas" onChange={(ev) => edit({ segmentOther: ev.target.value })} />
        </label>
      )}

      <Radios
        label="Objetivo principal do site"
        variant="tile"
        value={p.guidance ? '' : p.objective}
        options={visible.map((o) => {
          const Icon = objectiveIcon[o.id] ?? LayoutGrid;
          return { id: o.id, label: o.name, lead: <Icon aria-hidden="true" /> };
        })}
        onChange={(id) => edit({ objective: id, guidance: false })}
      />
    </>
  );
}

/* ── Etapa 2 — Aparência ───────────────────────────────────────────────── */

export function StepLook({ p, edit, logo, setLogo }: { p: Project; edit: Edit; logo: string | null; setLogo: (v: string | null) => void }) {
  return (
    <>
      <div className={b.group}>
        <span className={b.label} id="rotulo-estilo">
          Estilo
        </span>
        <StylePicker p={p} onChange={(id) => edit({ direction: id, font: 'auto', legacyTemplate: undefined, legacyStyle: undefined })} />
        <a
          className={b.otherStyle}
          href={whatsappLink(contact.whatsappEstilo)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_open', { context: 'estilo_diferente' })}
        >
          <MessageCircle aria-hidden="true" /> Escolher um estilo diferente (entrar em contato no WhatsApp)
        </a>
      </div>
      <div className={b.group}>
        <span className={b.label} id="rotulo-cores">
          Cores
        </span>
        <SwatchPicker p={p} onPalette={(id) => edit({ palette: id, custom: null })} onCustom={(hex) => edit({ custom: hex })} />
      </div>
      <div className={b.group}>
        <span className={b.label}>
          Logo <small>Opcional</small>
        </span>
        <LogoField logo={logo} onChange={setLogo} />
      </div>
    </>
  );
}

/* ── Etapa 3 — Conteúdo ────────────────────────────────────────────────── */

const extraIds = ['catalogo', 'paginaExtra', 'agendamento', 'animacoes', 'instagram'];
const extraNote: Record<string, string> = {
  catalogo: 'Vitrine de produtos, sem pagamento online.',
  paginaExtra: scopeRules.paginaExtra,
  agendamento: 'Plataforma externa com assinatura própria.',
  animacoes: 'Movimentos suaves ao rolar a página.',
  instagram: 'Pode exigir ferramenta com custo próprio.',
};

export function StepContent({ p, edit, onPlan }: { p: Project; edit: Edit; onPlan: (id: Project['plan'] & string) => void }) {
  const rec = recommendedPlan(p);
  const diagnosis = needsDiagnosis(p);
  const form = p.features.includes(FORM_EMAIL) ? FORM_EMAIL : p.features.includes(FORM_WHATSAPP) ? FORM_WHATSAPP : 'nenhum';
  const suggestions = introSuggestions[p.segment] ?? introSuggestions.outro;

  const toggle = (list: 'features' | 'sections', id: string, on: boolean) => {
    const cur = p[list];
    edit({ [list]: on ? [...cur, id] : cur.filter((x) => x !== id) });
  };
  const setForm = (id: string) => {
    const rest = p.features.filter((f) => f !== FORM_WHATSAPP && f !== FORM_EMAIL);
    edit({ features: id === 'nenhum' ? rest : [...rest, id], emailVolume: id === FORM_EMAIL ? p.emailVolume : null });
  };

  return (
    <>
      <Radios
        label="Estrutura"
        value={p.plan ?? ''}
        options={plans.map((x) => ({
          id: x.id,
          label: x.name,
          badge: x.id === rec ? 'Sugerido para seu objetivo' : undefined,
          hint: diagnosis || x.needsAssessment ? 'Valor após levantamento' : `A partir de ${brl(projectEstimate(applyPlan(p, x.id)).min)}`,
        }))}
        onChange={(id) => onPlan(id as Project['plan'] & string)}
      />

      <div className={b.group}>
        <span className={b.label}>Seções</span>
        <div className={s.options}>
          {sections.map((x) => (
            <Check
              key={x.id}
              title={x.id === 'servicos' && p.objective === 'produtos' ? 'Produtos' : x.name}
              checked={p.sections.includes(x.id)}
              disabled={x.fixed}
              hint={x.fixed ? 'Sempre incluída' : x.id === 'depoimentos' ? 'Só com relatos reais dos seus clientes' : undefined}
              aside={x.feature ? `+ ${brl(pricing.byFeature[x.feature])}` : 'Incluída'}
              onChange={(on) => toggle('sections', x.id, on)}
            />
          ))}
        </div>
      </div>

      <div className={b.group}>
        <span className={b.label}>
          Frase de apresentação <small>Opcional</small>
        </span>
        <div className={b.suggestions}>
          {suggestions.map((text) => (
            <button key={text} type="button" aria-pressed={p.description === text} onClick={() => edit({ description: text })}>
              {text}
            </button>
          ))}
        </div>
        <label className={s.field}>
          <span className={s.srOnly}>Frase de apresentação</span>
          <textarea rows={2} maxLength={160} value={p.description} placeholder="Toque numa sugestão ou escreva a sua" onChange={(ev) => edit({ description: ev.target.value })} />
        </label>
      </div>

      <div className={b.group}>
        <label className={s.field}>
          Serviço ou produto principal <small>Opcional</small>
          <input maxLength={100} value={p.service} placeholder="Ex.: instalação de ar-condicionado" onChange={(ev) => edit({ service: ev.target.value })} />
        </label>
      </div>

      <details className={s.details}>
        <summary>Mais recursos</summary>
        <div className={s.detailsBody}>
          <Radios
            label="Formulário de contato"
            value={form}
            options={[
              { id: 'nenhum', label: 'Sem formulário', hint: 'O botão de WhatsApp já está incluído.', aside: 'Incluído' },
              { id: FORM_WHATSAPP, label: 'Para WhatsApp', hint: 'Sem mensalidade de plataforma.', aside: `+ ${brl(pricing.byFeature[FORM_WHATSAPP])}` },
              { id: FORM_EMAIL, label: 'Por e-mail', hint: 'Usa uma plataforma externa.', aside: `+ ${brl(pricing.byFeature[FORM_EMAIL])}` },
            ]}
            onChange={setForm}
          />
          {form === FORM_EMAIL && (
            <div className={s.infoBox}>
              <p>{emailFormNotice.limit}</p>
              <p style={{ marginTop: 4 }}>{emailFormNotice.separateCost}</p>
              <Radios label={volumeQuestion} variant="chip" value={p.emailVolume ?? ''} options={volumeOptions.map((v) => ({ id: v.id, label: v.label }))} onChange={(id) => edit({ emailVolume: id })} />
              {p.emailVolume && <p style={{ marginTop: 8 }}>{volumeOptions.find((v) => v.id === p.emailVolume)!.answer}</p>}
            </div>
          )}
          <div className={s.options} style={{ marginTop: 12 }}>
            {features
              .filter((f) => extraIds.includes(f.id))
              .map((f) => (
                <Check
                  key={f.id}
                  title={f.name}
                  badge={f.id === 'catalogo' && p.objective === 'produtos' ? 'Sugerido' : undefined}
                  hint={extraNote[f.id]}
                  aside={`+ ${brl(pricing.byFeature[f.id])}`}
                  checked={p.features.includes(f.id)}
                  onChange={(on) => toggle('features', f.id, on)}
                />
              ))}
          </div>
          <label className={s.field} style={{ marginTop: 12 }}>
            Categoria do projeto
            <select value={p.type} onChange={(ev) => edit({ type: ev.target.value })}>
              {siteTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {pricing.byType[t.id] ? `+ ${brl(pricing.byType[t.id])}` : 'incluído'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>

      <details className={s.details} open={p.complex.length > 0}>
        <summary>Precisa de algo mais complexo?</summary>
        <div className={s.detailsBody}>
          <p className={b.muted}>Esses itens dependem de um levantamento antes do valor.</p>
          {complexNeeds.map((n) => (
            <Check key={n.id} title={n.name} checked={p.complex.includes(n.id)} onChange={(on) => edit({ complex: on ? [...p.complex, n.id] : p.complex.filter((c) => c !== n.id) })} />
          ))}
        </div>
      </details>
    </>
  );
}
