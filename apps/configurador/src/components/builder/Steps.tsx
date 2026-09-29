'use client';
/* ==========================================================================
   Caminho passo a passo (sem descrição): Seu negócio e Seu objetivo.
   Só nome e segmento são obrigatórios; o resto tem sugestão pronta.
   ========================================================================== */
import { useRef, type RefObject } from 'react';
import { Building2, CalendarClock, Images, LayoutGrid, ReceiptText, ShoppingBag, Sparkles } from 'lucide-react';
import { brl, packageById, rank } from '@/config/packages';
import {
  ctaOf,
  dropStaleCopy,
  objectiveOf,
  objectives,
  recommendation,
  renameInTexts,
  segmentOf,
  subsegmentOf,
  segments,
  selectedSections,
  withObjective,
  type Project,
} from '@/lib/project';
import { Radios } from '../landing/Controls';
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

/**
 * "Como se chama seu negócio?" — antes da prévia, no caminho por descrição e
 * no passo a passo. "Ainda não defini o nome." usa um nome provisório do
 * tipo de negócio ("Sua clínica") e não impede a prévia. Ao terminar de
 * editar, o nome antigo é trocado pelo novo só nos textos sugeridos pela IA.
 */
export function NameField({
  p,
  replace,
  id = 'nome-empresa',
  error,
  inputRef,
}: {
  p: Project;
  replace: Replace;
  id?: string;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const before = useRef(p.name);
  const provisional = subsegmentOf(p).provisional;
  const errorId = `erro-${id}`;
  return (
    <div className={b.nameField}>
      <label className={s.field}>
        Como se chama seu negócio?
        <small id={`${id}-ajuda`}>Esse nome aparece na prévia.</small>
        <input
          ref={inputRef}
          id={id}
          maxLength={80}
          value={p.name}
          disabled={p.nameLater}
          placeholder={p.nameLater ? `Nome provisório: ${provisional}` : 'Ex.: Clínica Vila Pet'}
          autoComplete="organization"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : `${id}-ajuda`}
          onFocus={() => (before.current = p.name)}
          onChange={(ev) => replace({ ...p, name: ev.target.value, aiFilled: { ...p.aiFilled, name: p.aiFilled.name === ev.target.value ? p.aiFilled.name : '' } })}
          onBlur={() => {
            if (before.current.trim() && before.current !== p.name) replace(renameInTexts(p, before.current, p.name));
            before.current = p.name;
          }}
        />
        {error && (
          <span className={s.fieldError} id={errorId}>
            {error}
          </span>
        )}
      </label>
      <label className={b.laterRow}>
        <input type="checkbox" checked={p.nameLater} onChange={(ev) => replace({ ...p, nameLater: ev.target.checked, name: ev.target.checked ? '' : p.name, aiFilled: { ...p.aiFilled, name: '' } })} />
        <span>Ainda não defini o nome.</span>
      </label>
      {p.nameLater && (
        <p className={b.muted} role="status">
          A prévia usa “{provisional}” como nome provisório. Troque quando decidir — o nome muda em todo o site e no pedido.
        </p>
      )}
    </div>
  );
}

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
    // Segmento escolhido à mão: a próxima prévia por descrição não troca mais.
    let project: Project = { ...p, segment: id, aiFilled: { ...p.aiFilled, segment: '' } };
    if (!p.objectiveSet) project = withObjective(project, next.objectives[0], { chosen: false });
    if (!p.identitySet) project = { ...project, direction: next.styles[0], palette: next.palette };
    replace(dropStaleCopy(p, project));
  }

  return (
    <>
      <div className={b.group}>
        <NameField p={p} replace={replace} error={errors.name} inputRef={nameRef} />
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
            <dd>“{ctaOf(p)}”</dd>
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
        <p className={b.muted}>Depois da prévia, você ajusta estilo, cores, textos e seções — uma escolha por vez.</p>
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
