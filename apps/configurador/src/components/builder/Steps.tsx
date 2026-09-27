'use client';
/* ==========================================================================
   Etapas 1 a 3 do configurador: Seu negócio, Seu objetivo e Sua identidade.
   Só nome e segmento são obrigatórios; o resto tem sugestão pronta.
   ========================================================================== */
import { useState, type RefObject } from 'react';
import { Building2, CalendarClock, Images, LayoutGrid, MessageCircle, ReceiptText, ShoppingBag, Sparkles } from 'lucide-react';
import { contact } from '@/config/contact';
import { brl, packageById, rank } from '@/config/packages';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import {
  directions,
  dropStaleCopy,
  objectiveOf,
  objectives,
  recommendation,
  segmentOf,
  segments,
  selectedSections,
  withObjective,
  type Project,
} from '@/lib/project';
import { Radios } from '../landing/Controls';
import { LogoField, StylePicker, SwatchPicker } from './Pickers';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

type Edit = (patch: Partial<Project>) => void;
type Replace = (next: Project) => void;

const objectiveIcon: Record<string, typeof ReceiptText> = {
  orcamento: ReceiptText,
  agendamento: CalendarClock,
  empresa: Building2,
  servicos: LayoutGrid,
  produtos: ShoppingBag,
  trabalhos: Images,
};

export type StepErrors = { name?: string; segment?: string };

/* ── Etapa 1 — Seu negócio ─────────────────────────────────────────────── */

export function StepBusiness({
  p,
  edit,
  replace,
  errors,
  nameRef,
}: {
  p: Project;
  edit: Edit;
  replace: Replace;
  errors: StepErrors;
  nameRef: RefObject<HTMLInputElement | null>;
}) {
  const seg = p.segment ? segmentOf(p) : null;

  function chooseSegment(id: string) {
    const next = segments.find((x) => x.id === id)!;
    let project: Project = { ...p, segment: id };
    if (!p.objectiveSet) project = withObjective(project, next.objectives[0], { chosen: false });
    if (!p.identitySet) project = { ...project, direction: next.styles[0], palette: next.palette };
    replace(dropStaleCopy(p, project));
  }

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
            placeholder="Ex.: Clima Sul Refrigeração"
            autoComplete="organization"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'erro-nome-empresa' : undefined}
            onChange={(ev) => edit({ name: ev.target.value })}
          />
          {errors.name && (
            <span className={s.fieldError} id="erro-nome-empresa">
              {errors.name}
            </span>
          )}
        </label>
      </div>

      <Radios
        label="Segmento"
        variant="chip"
        value={p.segment}
        options={segments.map((x) => ({ id: x.id, label: x.short }))}
        onChange={chooseSegment}
      />
      {errors.segment && !p.segment && (
        <p className={s.fieldError} id="erro-segmento" role="alert" style={{ marginTop: 6 }}>
          {errors.segment}
        </p>
      )}
      {p.segment === 'outro' && (
        <label className={`${s.field} ${b.group}`} style={{ marginTop: 12 }}>
          Qual é o segmento?
          <input
            id="segmento-outro"
            maxLength={60}
            value={p.segmentOther}
            placeholder="Ex.: escola de idiomas"
            aria-invalid={Boolean(errors.segment)}
            aria-describedby={errors.segment ? 'erro-segmento-outro' : undefined}
            onChange={(ev) => edit({ segmentOther: ev.target.value })}
          />
          {errors.segment && (
            <span className={s.fieldError} id="erro-segmento-outro">
              {errors.segment}
            </span>
          )}
        </label>
      )}

      <div className={b.group}>
        <label className={s.field}>
          Principal serviço ou produto
          <input
            id="servico-principal"
            maxLength={80}
            value={p.service}
            disabled={p.serviceLater}
            placeholder={seg?.quick[0] ? `Ex.: ${seg.quick[0].toLowerCase()}` : 'Ex.: instalação de ar-condicionado'}
            onChange={(ev) => edit({ service: ev.target.value })}
          />
        </label>
        <div className={b.quick}>
          {!p.serviceLater &&
            (seg?.quick ?? []).map((q) => (
              <button key={q} type="button" aria-pressed={p.service === q} onClick={() => edit({ service: q })}>
                {q}
              </button>
            ))}
          <button type="button" aria-pressed={p.serviceLater} onClick={() => edit({ serviceLater: !p.serviceLater, service: '' })}>
            {p.serviceLater ? 'Informar agora' : 'Definir depois'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Etapa 2 — Seu objetivo ────────────────────────────────────────────── */

export function StepObjective({ p, replace, onUpgrade }: { p: Project; replace: Replace; onUpgrade: (to: Project['pkg'], source: string) => void }) {
  const seg = p.segment ? segmentOf(p) : null;
  const obj = objectiveOf(p);
  const rec = recommendation(p);
  const pkg = packageById(rec.pkg);

  return (
    <>
      <Radios
        label="O que você quer que as pessoas façam no seu site?"
        variant="tile"
        value={p.objectiveSet ? p.objective : ''}
        options={objectives.map((o) => {
          const Icon = objectiveIcon[o.id] ?? LayoutGrid;
          return { id: o.id, label: o.name, lead: <Icon aria-hidden="true" />, badge: seg?.objectives.includes(o.id) ? 'Comum no seu segmento' : undefined };
        })}
        onChange={(id) => replace(withObjective(p, id))}
      />

      <div className={b.outcome} aria-live="polite">
        <p className={b.outcomeTitle}>{p.objectiveSet ? 'Com essa escolha, seu site terá' : 'Sugestão para começar'}</p>
        <dl>
          <div>
            <dt>Botão principal</dt>
            <dd>“{obj.cta}”</dd>
          </div>
          <div>
            <dt>Contato</dt>
            <dd>{obj.contactPath}</dd>
          </div>
          <div>
            <dt>Seções</dt>
            <dd>{selectedSections(p).join(' · ')}</dd>
          </div>
        </dl>
        {p.objective === 'agendamento' && (
          <p className={b.muted}>Não é uma agenda com horários em tempo real: esse tipo de agenda é um projeto personalizado.</p>
        )}
        <p className={b.muted}>Você ajusta seções e textos no fim, em “Personalizar meu site”.</p>
      </div>

      {rank(rec.pkg) > rank(p.pkg) && (
        <div className={b.suggestion}>
          <p>
            <Sparkles aria-hidden="true" /> {rec.reason}
          </p>
          <div className={s.actionRow}>
            <button type="button" className={`${s.secondary} ${s.small}`} onClick={() => onUpgrade(rec.pkg, 'objetivo')}>
              Ver o {pkg.name} — {brl(pkg.price)} no total
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Etapa 3 — Sua identidade ──────────────────────────────────────────── */

export function StepIdentity({ p, edit, logo, setLogo }: { p: Project; edit: Edit; logo: string | null; setLogo: (v: string | null) => void }) {
  const seg = segmentOf(p);
  const suggested = seg.styles;
  const others: string[] = directions.map((d) => d.id).filter((id) => !suggested.includes(id));
  const [more, setMore] = useState(others.includes(p.direction));
  const choose = (patch: Partial<Project>) => edit({ ...patch, identitySet: true });

  return (
    <>
      <div className={b.group}>
        <div className={b.labelRow}>
          <span className={b.label} id="rotulo-estilo">
            Estilo
          </span>
          <button
            type="button"
            className={b.textButton}
            onClick={() => {
              setMore(false);
              choose({ direction: suggested[0], palette: seg.palette, custom: null, font: 'auto' });
            }}
          >
            Escolher por mim
          </button>
        </div>
        <StylePicker p={p} ids={suggested} labelledBy="rotulo-estilo" onChange={(id) => choose({ direction: id, font: 'auto' })} />
        <details className={s.details} open={more} onToggle={(ev) => setMore((ev.target as HTMLDetailsElement).open)}>
          <summary>Ver outros estilos</summary>
          <div className={s.detailsBody}>
            <span className={s.srOnly} id="rotulo-outros-estilos">
              Outros estilos
            </span>
            <StylePicker p={p} ids={others} labelledBy="rotulo-outros-estilos" onChange={(id) => choose({ direction: id, font: 'auto' })} />
            <a
              className={b.otherStyle}
              href={whatsappLink(contact.whatsappEstilo)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_open', { context: 'estilo_diferente' })}
            >
              <MessageCircle aria-hidden="true" /> Quer um estilo fora da lista? Fale no WhatsApp
            </a>
          </div>
        </details>
      </div>

      <div className={b.group}>
        <span className={b.label} id="rotulo-cores">
          Cores
        </span>
        <SwatchPicker p={p} onPalette={(id) => choose({ palette: id, custom: null })} onCustom={(hex) => choose({ custom: hex })} />
      </div>

      <div className={b.group}>
        <span className={b.label}>
          Logo <small>Opcional</small>
        </span>
        <LogoField logo={logo} onChange={setLogo} />
      </div>

      <p className={b.included}>Estilos, cores da marca e aplicação da logo estão incluídos em todos os pacotes.</p>
    </>
  );
}
