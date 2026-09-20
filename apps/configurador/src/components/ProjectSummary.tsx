'use client';

/* ==========================================================================
   Revisão final — a tela de "checkout" antes do WhatsApp.
   ========================================================================== */
import { colorSchemes } from '@/config/colors';
import { fontPairings } from '@/config/fonts';
import { siteTypes } from '@/config/siteTypes';
import { templates } from '@/config/templates';
import { visualStyles } from '@/config/styles';
import { brl } from '@/config/pricing';
import { buildMessage, featureNames, joinPt, whatsappLink } from '@/lib/whatsapp';
import type { Estimate } from '@/lib/estimate';
import type { Selection } from '@/lib/types';
import { ButtonLink } from './ui/Button';
import { Icon } from './ui/Icon';

type Props = {
  selection: Selection;
  update: (patch: Partial<Selection>) => void;
  result: Estimate;
  onEdit: (step: number) => void;
};

export function ProjectSummary({ selection, update, result, onEdit }: Props) {
  const rows = [
    { step: 0, label: 'Tipo', value: siteTypes.find((t) => t.id === selection.type)?.name },
    { step: 1, label: 'Modelo', value: templates.find((t) => t.id === selection.template)?.name },
    { step: 2, label: 'Estilo', value: visualStyles.find((s) => s.id === selection.style)?.name },
    {
      step: 3,
      label: 'Paleta',
      value: selection.customColor
        ? `Cores próprias (${selection.customColor.accent.toUpperCase()})`
        : colorSchemes.find((c) => c.id === selection.color)?.name,
    },
    { step: 4, label: 'Tipografia', value: fontPairings.find((f) => f.id === selection.font)?.headingName },
    { step: 5, label: 'Funcionalidades', value: joinPt(featureNames(selection)) },
  ];

  const message = buildMessage(selection, result);

  return (
    <div className="anim-step">
      <dl className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 px-5 py-3.5">
            <dt className="w-20 flex-none pt-0.5 text-sm text-muted sm:w-36">{row.label}</dt>
            <dd className="flex-1 text-[0.9375rem] font-medium leading-snug tracking-[-0.01em]">
              {row.value || <span className="text-faint">Não escolhido</span>}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="flex-none cursor-pointer rounded-xs px-2 py-0.5 text-[0.8125rem] text-muted transition-colors hover:text-brand"
            >
              Editar
            </button>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-3 bg-brand-soft/50 px-5 py-4">
          <dt className="text-sm font-medium text-muted">Estimativa</dt>
          <dd className="tnum text-xl font-bold tracking-[-0.03em]">
            {brl(result.min)} <span className="text-faint">–</span> {brl(result.max).replace('R$ ', '')}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 bg-brand-soft/50 px-5 py-4">
          <dt className="text-sm font-medium text-muted">Prazo</dt>
          <dd className="text-[0.9375rem] font-semibold tracking-[-0.015em]">{result.deadline}</dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          id="lead-nome"
          label="Seu nome"
          placeholder="Como devo te chamar?"
          value={selection.name}
          onChange={(name) => update({ name })}
          autoComplete="given-name"
        />
        <Field
          id="lead-negocio"
          label="Seu negócio"
          hint="opcional"
          placeholder="Nome da empresa"
          value={selection.company}
          onChange={(company) => update({ company })}
          autoComplete="organization"
        />
      </div>

      <ButtonLink
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        size="lg"
        className="mt-5 w-full"
      >
        Solicitar orçamento no WhatsApp
        <Icon name="ArrowUpRight" className="size-5" strokeWidth={2.25} />
      </ButtonLink>

      <p className="mt-3 text-center text-[0.8125rem] text-muted">
        Sem compromisso. Você só paga depois de aprovar o orçamento.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-sm font-medium">
        {label}
        {hint && <span className="text-[0.8125rem] font-normal text-faint">{hint}</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-sm border border-line bg-surface px-4 text-[0.9375rem] outline-none transition-colors placeholder:text-faint focus:border-brand"
        {...rest}
      />
    </div>
  );
}
