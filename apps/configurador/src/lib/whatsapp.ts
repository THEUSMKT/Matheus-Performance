/* ==========================================================================
   Monta o link do WhatsApp com o briefing completo.
   ========================================================================== */
import { contact } from '@/config/contact';
import { colorSchemes } from '@/config/colors';
import { features as allFeatures } from '@/config/features';
import { fontPairings } from '@/config/fonts';
import { siteTypes } from '@/config/siteTypes';
import { templates } from '@/config/templates';
import { visualStyles } from '@/config/styles';
import { brl } from '@/config/pricing';
import { FORM_EMAIL, FORM_WHATSAPP, volumeOptions } from '@/config/forms';
import type { Estimate } from './estimate';
import type { Selection } from './types';

const nameOf = <T extends { id: string; name: string }>(list: T[], id: string | null) =>
  list.find((item) => item.id === id)?.name ?? null;

/** Lista em português: "A, B e C". */
export function joinPt(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

export function featureNames(selection: Selection): string[] {
  return selection.features
    .map((id) => allFeatures.find((f) => f.id === id)?.name)
    .filter((n): n is string => Boolean(n));
}

export function colorName(selection: Selection): string | null {
  if (selection.customColor) {
    const { accent, bg } = selection.customColor;
    return `cores próprias — destaque ${accent.toUpperCase()}, fundo ${bg.toUpperCase()}`;
  }
  return nameOf(colorSchemes, selection.color);
}

export function fontLabel(selection: Selection): string | null {
  const pairing = fontPairings.find((f) => f.id === selection.font);
  if (!pairing) return null;
  return pairing.headingName === pairing.bodyName
    ? pairing.headingName
    : `${pairing.headingName} + ${pairing.bodyName}`;
}

export function buildMessage(selection: Selection, result: Estimate): string {
  const lines: string[] = [contact.whatsappIntro, ''];

  if (selection.name.trim()) lines.push(`Meu nome: ${selection.name.trim()}`);
  if (selection.company.trim()) lines.push(`Negócio: ${selection.company.trim()}`);
  if (selection.name.trim() || selection.company.trim()) lines.push('');

  const rows: Array<[string, string | null]> = [
    ['Tipo de site', nameOf(siteTypes, selection.type)],
    ['Modelo', nameOf(templates, selection.template)],
    ['Estilo', nameOf(visualStyles, selection.style)],
    ['Cores', colorName(selection)],
    ['Tipografia', fontLabel(selection)],
  ];

  for (const [label, value] of rows) {
    if (value) lines.push(`${label}: ${value}`);
  }

  // Funcionalidades em lista: no WhatsApp fica muito mais legível que em linha.
  const funcionalidades = featureNames(selection);
  if (funcionalidades.length) {
    lines.push('');
    lines.push('Funcionalidades:');
    for (const nome of funcionalidades) lines.push(`• ${nome}`);
  }

  // Formulário: o aviso de plataforma externa só faz sentido no caso do
  // e-mail. Quem escolhe o envio para WhatsApp não tem assinatura nenhuma.
  if (selection.features.includes(FORM_WHATSAPP)) {
    lines.push('');
    lines.push('Formulário: Envio para WhatsApp');
  } else if (selection.features.includes(FORM_EMAIL)) {
    const volume = volumeOptions.find((v) => v.id === selection.emailVolume);
    lines.push('');
    lines.push('Formulário: Recebimento por e-mail');
    if (volume) lines.push(`Volume esperado: ${volume.messageLabel}`);
    lines.push(
      `Plataforma externa: ${volume?.messagePlatform ?? 'plano conforme o volume de mensagens'}`,
    );
  }

  lines.push('');
  lines.push(`Estimativa apresentada: ${brl(result.min)} – ${brl(result.max).replace('R$ ', '')}`);
  lines.push(`Prazo estimado: ${result.deadline}`);
  lines.push('');
  lines.push(contact.whatsappOutro);

  return lines.join('\n');
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** CTAs genéricos ("Falar no WhatsApp"): abre a conversa sem o briefing. */
export function shortWhatsappLink(): string {
  return whatsappLink(contact.whatsappCurta);
}
