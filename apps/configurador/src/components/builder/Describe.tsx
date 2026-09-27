'use client';
/* ==========================================================================
   "Descreva seu site": o visitante conta em texto o que precisa e a IA
   escolhe, entre os layouts existentes, segmento, objetivo, estilo, cores e
   seções, e sugere textos. Só aparece quando NEXT_PUBLIC_AI_ENDPOINT existe.

   Sem carregamento artificial: o botão mostra "Gerando…" só enquanto a
   requisição real está em andamento. Em qualquer falha a descrição continua
   no campo e o passo a passo segue disponível logo abaixo.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { integrations } from '@/config/integrations';
import { DESCRIPTION_MAX, DESCRIPTION_MIN, aiReasonText, hasContactData, requestSuggestion, type AiFailure, type Suggestion } from '@/lib/aiPreview';
import { track } from '@/lib/analytics';
import type { Project } from '@/lib/project';
import { asset } from '../landing/Chrome';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

const DRAFT_KEY = 'bp.descricao.v1';

export function Describe({ p, onSuggestion }: { p: Project; onSuggestion: (s: Suggestion) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');
  const field = useRef<HTMLTextAreaElement>(null);

  // Rascunho só nesta aba: sobrevive a recarregar, some ao fechar.
  useEffect(() => {
    try {
      setText(sessionStorage.getItem(DRAFT_KEY) ?? '');
    } catch {
      /* sem sessionStorage: o campo começa vazio */
    }
  }, []);

  function change(value: string) {
    setText(value);
    if (error) setError('');
    try {
      sessionStorage.setItem(DRAFT_KEY, value);
    } catch {
      /* rascunho não guardado; o texto continua no campo */
    }
  }

  function fail(message: string, reason?: AiFailure) {
    setError(message);
    if (reason) track('ai_generate', { result: 'erro', reason });
    requestAnimationFrame(() => field.current?.focus());
  }

  async function generate() {
    if (busy) return;
    const value = text.trim();
    if (value.length < DESCRIPTION_MIN) return fail(`Conte um pouco mais: pelo menos ${DESCRIPTION_MIN} caracteres sobre a empresa e o que o site deve mostrar.`);
    if (hasContactData(value)) return fail('Tire telefone, e-mail ou documentos da descrição — eles não são necessários para a prévia.');
    setBusy(true);
    setError('');
    const result = await requestSuggestion(value, p.pkg, integrations.aiEndpoint);
    setBusy(false);
    if (!result.ok) return fail(aiReasonText[result.reason], result.reason);
    track('ai_generate', { result: 'ok' });
    onSuggestion(result.suggestion);
  }

  return (
    <section className={b.describe} aria-labelledby="descrever-titulo">
      <h2 id="descrever-titulo" className={b.describeTitle}>
        <Sparkles aria-hidden="true" /> Descreva o site que você quer
      </h2>
      <p className={b.muted}>Em poucas frases: o que a empresa faz, para quem e o que as pessoas devem fazer no site.</p>
      <label className={s.field} style={{ marginTop: 10 }}>
        <span className={s.srOnly}>Descrição do site</span>
        <textarea
          ref={field}
          id="descricao-ia"
          rows={4}
          maxLength={DESCRIPTION_MAX}
          value={text}
          placeholder="Ex.: Faço instalação e manutenção de ar-condicionado para casas e empresas. Quero que o site mostre os serviços e receba pedidos de orçamento. Gosto de azul e de um visual moderno."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'erro-descricao' : 'dica-descricao'}
          disabled={busy}
          onChange={(ev) => change(ev.target.value)}
        />
      </label>
      <p className={b.counter} aria-hidden="true">
        {text.length}/{DESCRIPTION_MAX}
      </p>
      {error && (
        <p className={s.fieldError} id="erro-descricao" role="alert">
          {error}
        </p>
      )}
      <button type="button" className={`${s.primary} ${b.wide}`} onClick={generate} disabled={busy} aria-busy={busy}>
        {busy ? 'Gerando sua prévia…' : 'Gerar minha prévia'}
      </button>
      <p className={b.muted} id="dica-descricao" style={{ marginTop: 8 }}>
        O texto é enviado ao Google Gemini só para montar a prévia e não fica guardado em nenhum servidor. Não inclua telefone, e-mail ou dados
        pessoais. <a href={asset('/privacidade/')}>Privacidade</a>
      </p>
      <p className={b.orSteps}>
        <span>ou preencha passo a passo</span>
      </p>
    </section>
  );
}
