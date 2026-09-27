'use client';
/* ==========================================================================
   "Descreva seu site": o visitante conta em texto o que precisa e a IA
   escolhe, entre os layouts existentes, segmento, objetivo, estilo, cores e
   seções, e sugere textos. Só aparece quando NEXT_PUBLIC_AI_ENDPOINT existe.

   Sem carregamento artificial: o botão mostra "Gerando…" só enquanto a
   requisição real está em andamento. Em qualquer falha a descrição continua
   no campo e o passo a passo segue disponível logo abaixo.

   Áudio (quando o navegador permite gravar): a fala vira texto no próprio
   campo, para ser conferida e ajustada antes de gerar. O áudio não é
   guardado; o microfone é liberado assim que a gravação para.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Mic, Sparkles, Square } from 'lucide-react';
import { integrations } from '@/config/integrations';
import { DESCRIPTION_MAX, DESCRIPTION_MIN, aiReasonText, hasContactData, requestSuggestion, type AiFailure, type Suggestion } from '@/lib/aiPreview';
import { AUDIO_MAX_SECONDS, AUDIO_MIN_SECONDS, audioReasonText, audioSupported, blobToWav, recordingMime, requestTranscript, toBase64 } from '@/lib/aiAudio';
import { track } from '@/lib/analytics';
import type { Project } from '@/lib/project';
import { asset } from '../landing/Chrome';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

const DRAFT_KEY = 'bp.descricao.v1';
const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
type AudioProblem = keyof typeof audioReasonText;

export function Describe({ p, onSuggestion }: { p: Project; onSuggestion: (s: Suggestion) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');
  const field = useRef<HTMLTextAreaElement>(null);
  const textNow = useRef(text);
  textNow.current = text;

  // Áudio
  const [audioOk, setAudioOk] = useState(false);
  const [rec, setRec] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const ticker = useRef<number | undefined>(undefined);
  const startedAt = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    setAudioOk(audioSupported());
    alive.current = true;
    return () => {
      // Saiu da etapa no meio da gravação: descarta e libera o microfone.
      alive.current = false;
      window.clearInterval(ticker.current);
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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

  function failAudio(problem: AudioProblem) {
    setStatus('');
    setError(audioReasonText[problem]);
    track('ai_audio', { result: 'erro', reason: problem });
  }

  function releaseMic() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }

  async function startRecording() {
    if (busy || rec !== 'idle') return;
    setError('');
    setStatus('');
    let media: MediaStream;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return failAudio('microfone');
    }
    stream.current = media;
    const mime = recordingMime();
    let r: MediaRecorder;
    try {
      r = mime ? new MediaRecorder(media, { mimeType: mime }) : new MediaRecorder(media);
    } catch {
      releaseMic();
      return failAudio('gravacao');
    }
    chunks.current = [];
    r.ondataavailable = (ev) => {
      if (ev.data.size) chunks.current.push(ev.data);
    };
    r.onstop = () => void finishRecording(r.mimeType || mime);
    recorder.current = r;
    r.start();
    startedAt.current = Date.now();
    setSeconds(0);
    setRec('recording');
    setStatus(`Gravando… fale por até ${AUDIO_MAX_SECONDS} segundos.`);
    ticker.current = window.setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt.current) / 1000);
      setSeconds(sec);
      if (sec >= AUDIO_MAX_SECONDS) stopRecording();
    }, 250);
  }

  function stopRecording() {
    window.clearInterval(ticker.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }

  async function finishRecording(mime: string) {
    window.clearInterval(ticker.current);
    releaseMic();
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const blob = new Blob(chunks.current, { type: mime || 'audio/webm' });
    chunks.current = [];
    recorder.current = null;
    if (!alive.current) return;
    if (elapsed < AUDIO_MIN_SECONDS) {
      setRec('idle');
      return failAudio('curto');
    }
    setRec('processing');
    setStatus('Transcrevendo seu áudio…');
    let audio: string;
    try {
      audio = toBase64((await blobToWav(blob)).wav);
    } catch {
      setRec('idle');
      return failAudio('gravacao');
    }
    const result = await requestTranscript(audio, integrations.aiEndpoint);
    if (!alive.current) return;
    setRec('idle');
    if (!result.ok) return failAudio(result.reason);
    track('ai_audio', { result: 'ok' });
    const before = textNow.current.trim();
    change((before ? `${before} ${result.text}` : result.text).slice(0, DESCRIPTION_MAX));
    setStatus('Pronto: o áudio virou texto. Confira e ajuste o que precisar antes de gerar a prévia.');
    requestAnimationFrame(() => field.current?.focus());
  }

  async function generate() {
    if (busy || rec !== 'idle') return;
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
          disabled={busy || rec !== 'idle'}
          onChange={(ev) => change(ev.target.value)}
        />
      </label>
      <div className={b.audioRow}>
        {audioOk && (
          <button
            type="button"
            id="gravar-audio"
            className={`${s.secondary} ${s.small} ${b.micButton}`}
            aria-pressed={rec === 'recording'}
            disabled={busy || rec === 'processing'}
            onClick={rec === 'recording' ? stopRecording : startRecording}
          >
            {rec === 'recording' ? (
              <>
                <Square aria-hidden="true" /> Parar gravação <span className={b.recClock}>{clock(seconds)}</span>
              </>
            ) : rec === 'processing' ? (
              <>
                <Mic aria-hidden="true" /> Transcrevendo…
              </>
            ) : (
              <>
                <Mic aria-hidden="true" /> Gravar áudio
              </>
            )}
          </button>
        )}
        <p className={b.counter} aria-hidden="true">
          {text.length}/{DESCRIPTION_MAX}
        </p>
      </div>
      <p className={b.audioStatus} role="status" aria-live="polite">
        {rec === 'recording' && <span className={b.recDot} aria-hidden="true" />}
        {status}
      </p>
      {error && (
        <p className={s.fieldError} id="erro-descricao" role="alert">
          {error}
        </p>
      )}
      <button type="button" className={`${s.primary} ${b.wide}`} onClick={generate} disabled={busy || rec !== 'idle'} aria-busy={busy}>
        {busy ? 'Gerando sua prévia…' : 'Gerar minha prévia'}
      </button>
      <p className={b.muted} id="dica-descricao" style={{ marginTop: 8 }}>
        {audioOk ? 'O texto (e o áudio, que só serve para virar texto)' : 'O texto'} é enviado ao Google Gemini só para montar a prévia e não fica
        guardado em nenhum servidor. Não inclua telefone, e-mail ou dados pessoais. <a href={asset('/privacidade/')}>Privacidade</a>
      </p>
      <p className={b.orSteps}>
        <span>ou preencha passo a passo</span>
      </p>
    </section>
  );
}
