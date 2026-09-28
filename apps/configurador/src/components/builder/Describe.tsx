'use client';
/* ==========================================================================
   "Conte sobre seu negócio": a pessoa grava ou digita a ideia do site e a IA
   monta a prévia nos layouts existentes. Só aparece com NEXT_PUBLIC_AI_ENDPOINT.

   Estados explícitos — um de cada vez, com uma ação principal por vez:
   escolher  → "Gravar minha ideia" ou "Prefiro digitar"
   iniciando → pedindo o microfone (só depois do clique em gravar)
   gravando  → tempo, "Parar gravação" e "Cancelar gravação"; "Gerar minha
               prévia" aparece desabilitado, com o motivo ao lado
   transcrevendo → "Transcrevendo seu áudio…"; gerar continua desabilitado
   texto     → campo editável + "Gerar minha prévia" (e "Gravar novamente")
   A geração em si mora no Builder (sobrevive à troca de etapa); aqui só se
   mostra "Montando sua prévia…" e o erro, sem perder o texto.
   O áudio não é guardado; o microfone é liberado ao parar, cancelar, sair
   da etapa ou fechar a página. Se a pessoa troca de aplicativo no meio da
   gravação (comum no celular), a gravação para e o que foi gravado segue
   para a transcrição. Nos navegadores internos do Instagram e do Facebook,
   um aviso explica que o microfone pode não funcionar e oferece digitar.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { Keyboard, LoaderCircle, Mic, Sparkles, Square } from 'lucide-react';
import { integrations } from '@/config/integrations';
import { DESCRIPTION_MAX, DESCRIPTION_MIN, hasContactData } from '@/lib/aiPreview';
import { AUDIO_MAX_SECONDS, AUDIO_MIN_SECONDS, audioReasonText, audioSupported, blobToWav, recordingMime, requestTranscript, toBase64 } from '@/lib/aiAudio';
import { track } from '@/lib/analytics';
import { asset } from '../landing/Chrome';
import s from '../landing/Landing.module.css';
import b from './Builder.module.css';

/** Descrição em rascunho, só nesta aba (sessionStorage). */
export const DRAFT_KEY = 'bp.descricao.v1';
/** Navegador interno de app (Instagram, Facebook): o microfone costuma falhar ali. */
const inAppBrowser = () => typeof navigator !== 'undefined' && /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i.test(navigator.userAgent);
const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
type AudioProblem = keyof typeof audioReasonText;
export type DescribePhase = 'escolher' | 'iniciando' | 'gravando' | 'transcrevendo' | 'texto';

export function Describe({
  generating,
  error: genError,
  onGenerate,
  onPhase,
  clearError,
}: {
  generating: boolean;
  /** Erro da geração (vem do Builder). */
  error: string;
  onGenerate: (text: string) => void;
  /** Avisa o Builder: com gravação ou transcrição em andamento, as barras de ação somem. */
  onPhase: (phase: DescribePhase) => void;
  clearError: () => void;
}) {
  const [text, setText] = useState('');
  const [phase, setPhaseState] = useState<DescribePhase>('escolher');
  const [fromAudio, setFromAudio] = useState(false);
  const [audioOk, setAudioOk] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [inApp, setInApp] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const mainButton = useRef<HTMLButtonElement>(null);
  const textNow = useRef(text);
  textNow.current = text;

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const ticker = useRef<number | undefined>(undefined);
  const startedAt = useRef(0);
  const discard = useRef(false);
  const alive = useRef(true);

  function setPhase(next: DescribePhase) {
    setPhaseState(next);
    onPhase(next);
  }

  // Rascunho só nesta aba: sobrevive a recarregar e a trocar de etapa.
  useEffect(() => {
    const ok = audioSupported();
    setAudioOk(ok);
    setInApp(inAppBrowser());
    let draft = '';
    try {
      draft = sessionStorage.getItem(DRAFT_KEY) ?? '';
    } catch {
      /* sem sessionStorage: o campo começa vazio */
    }
    setText(draft);
    setPhase(draft || !ok ? 'texto' : 'escolher');
    alive.current = true;
    const onHide = () => cancelRecording();
    window.addEventListener('pagehide', onHide);
    // Trocou de aplicativo no meio da gravação: para e aproveita o que foi gravado.
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden' || recorder.current?.state !== 'recording') return;
      setStatus('A gravação parou quando você saiu da página. Confira o texto antes de gerar.');
      stopRecording();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      // Saiu da etapa no meio da gravação: descarta e libera o microfone.
      alive.current = false;
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function change(value: string) {
    setText(value);
    if (error) setError('');
    if (genError) clearError();
    try {
      sessionStorage.setItem(DRAFT_KEY, value);
    } catch {
      /* rascunho não guardado; o texto continua no campo */
    }
  }

  function focusSoon(el: { current: HTMLElement | null }) {
    requestAnimationFrame(() => el.current?.focus());
  }

  function toText(message = '') {
    setPhase('texto');
    setError(message);
    focusSoon(field);
  }

  function failAudio(problem: AudioProblem) {
    setStatus('');
    track('ai_audio', { result: 'erro', reason: problem });
    toText(audioReasonText[problem]);
  }

  function releaseMic() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }

  async function startRecording() {
    if (generating || (phase !== 'escolher' && phase !== 'texto')) return;
    setError('');
    clearError();
    setStatus('');
    setPhase('iniciando');
    let media: MediaStream;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return failAudio('microfone');
    }
    if (!alive.current) {
      media.getTracks().forEach((t) => t.stop());
      return;
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
    discard.current = false;
    r.ondataavailable = (ev) => {
      if (ev.data.size) chunks.current.push(ev.data);
    };
    r.onstop = () => void finishRecording(r.mimeType || mime);
    r.onerror = () => {
      discard.current = true;
      window.clearInterval(ticker.current);
      releaseMic();
      failAudio('gravacao');
    };
    // O microfone parou sozinho (outro app, fone desconectado): encerra com o que já foi gravado.
    media.getAudioTracks().forEach((t) => (t.onended = () => stopRecording()));
    recorder.current = r;
    r.start();
    startedAt.current = Date.now();
    setSeconds(0);
    setPhase('gravando');
    focusSoon(mainButton);
    ticker.current = window.setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt.current) / 1000);
      setSeconds(sec);
      if (sec >= AUDIO_MAX_SECONDS) stopRecording();
    }, 250);
  }

  function stopRecording() {
    window.clearInterval(ticker.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
    else releaseMic();
  }

  /** Cancelar ou sair: para tudo e joga fora o que foi gravado. */
  function cancelRecording() {
    window.clearInterval(ticker.current);
    discard.current = true;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    recorder.current = null;
    releaseMic();
  }

  function cancelByUser() {
    cancelRecording();
    setStatus('Gravação cancelada. Nada foi enviado.');
    setPhase(textNow.current.trim() ? 'texto' : 'escolher');
    focusSoon(mainButton);
  }

  async function finishRecording(mime: string) {
    window.clearInterval(ticker.current);
    releaseMic();
    recorder.current = null;
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const blob = new Blob(chunks.current, { type: mime || 'audio/webm' });
    chunks.current = [];
    if (discard.current || !alive.current) return;
    if (elapsed < AUDIO_MIN_SECONDS) return failAudio('curto');
    setPhase('transcrevendo');
    setStatus('');
    let audio: string;
    try {
      audio = toBase64((await blobToWav(blob)).wav);
    } catch {
      return failAudio('gravacao');
    }
    const result = await requestTranscript(audio, integrations.aiEndpoint);
    if (!alive.current) return;
    if (!result.ok) return failAudio(result.reason);
    track('ai_audio', { result: 'ok' });
    const before = textNow.current.trim();
    change((before ? `${before} ${result.text}` : result.text).slice(0, DESCRIPTION_MAX));
    setFromAudio(true);
    toText();
  }

  function generate() {
    if (generating || phase !== 'texto') return;
    const value = text.trim();
    if (value.length < DESCRIPTION_MIN) {
      setError(`Conte um pouco mais: pelo menos ${DESCRIPTION_MIN} caracteres sobre a empresa e o que o site deve mostrar.`);
      return focusSoon(field);
    }
    if (hasContactData(value)) {
      setError('Tire telefone, e-mail ou documentos da descrição — eles não são necessários para a prévia.');
      return focusSoon(field);
    }
    setError('');
    onGenerate(value);
  }

  const shownError = error || genError;

  return (
    <section className={b.describe} aria-labelledby="descrever-titulo" data-phase={generating ? 'gerando' : phase}>
      <h2 id="descrever-titulo" className={s.srOnly}>
        Sua ideia para o site
      </h2>

      {phase === 'escolher' && (
        <div className={b.choose}>
          <p className={b.describeHint}>Conte o que sua empresa faz e como você quer receber clientes.</p>
          <button ref={mainButton} type="button" id="gravar-audio" className={`${s.primary} ${b.micMain}`} onClick={startRecording}>
            <Mic aria-hidden="true" /> Gravar minha ideia
          </button>
          <button type="button" className={`${s.secondary} ${b.wideBtn}`} onClick={() => toText()}>
            <Keyboard aria-hidden="true" /> Prefiro digitar
          </button>
          <p className={b.micNote}>O microfone só é usado depois que você tocar em gravar.</p>
          {inApp && (
            <p className={b.micNote} role="note">
              No navegador do Instagram ou do Facebook, o microfone pode não funcionar. Se não funcionar, toque em “Prefiro digitar” ou abra esta página no
              navegador do celular (menu ⋯ → Abrir no navegador).
            </p>
          )}
        </div>
      )}

      {(phase === 'iniciando' || phase === 'gravando') && (
        <div className={b.recording} role="group" aria-labelledby="gravando-titulo">
          <div className={b.recHead}>
            <span className={b.recPulse} aria-hidden="true">
              <Mic />
            </span>
            <div>
              <p id="gravando-titulo" className={b.recTitle}>
                {phase === 'iniciando' ? 'Permita o uso do microfone…' : 'Gravando sua ideia…'}
              </p>
              <p className={b.recClock} aria-live="off">
                {clock(seconds)} <span>/ {clock(AUDIO_MAX_SECONDS)}</span>
              </p>
            </div>
          </div>
          <p className={b.recHint}>
            Fale o que a empresa faz, para quem e o que as pessoas devem fazer no site.
            {text.trim() ? ' O novo áudio entra depois do texto que você já tem.' : ''}
          </p>
          <button ref={mainButton} type="button" id="parar-gravacao" className={b.stopButton} onClick={stopRecording} disabled={phase === 'iniciando'}>
            <Square aria-hidden="true" /> Parar gravação
          </button>
          <button type="button" className={b.textButton} onClick={cancelByUser}>
            Cancelar gravação
          </button>
        </div>
      )}

      {phase === 'transcrevendo' && (
        <div className={b.working} role="status">
          <LoaderCircle aria-hidden="true" className={b.spin} /> Transcrevendo seu áudio…
        </div>
      )}

      {(phase === 'iniciando' || phase === 'gravando' || phase === 'transcrevendo') && (
        // Gerar fica à vista, mas só funciona com o texto pronto — e diz por quê.
        <div className={b.waitGenerate}>
          <button type="button" className={`${s.primary} ${b.wideBtn}`} disabled aria-describedby="motivo-gerar">
            <Sparkles aria-hidden="true" /> Gerar minha prévia
          </button>
          <p id="motivo-gerar" className={b.micNote}>
            {phase === 'transcrevendo' ? 'Disponível quando o texto do áudio aparecer para você conferir.' : 'Disponível depois que você parar a gravação e conferir o texto.'}
          </p>
        </div>
      )}

      {phase === 'texto' && (
        <>
          {!audioOk && <p className={b.micNote}>A gravação de áudio não está disponível neste navegador. Escreva sua ideia abaixo.</p>}
          <label className={s.field}>
            {fromAudio ? 'Seu áudio virou este texto' : 'Sua ideia para o site'}
            <textarea
              ref={field}
              id="descricao-ia"
              rows={5}
              maxLength={DESCRIPTION_MAX}
              value={text}
              placeholder="Ex.: Faço instalação e manutenção de ar-condicionado para casas e empresas. Quero que o site mostre os serviços e receba pedidos de orçamento. Gosto de azul e de um visual moderno."
              aria-invalid={Boolean(shownError)}
              aria-describedby={shownError ? 'erro-descricao' : 'dica-descricao'}
              readOnly={generating}
              onChange={(ev) => change(ev.target.value)}
            />
          </label>
          <div className={b.audioRow}>
            {fromAudio ? <p className={b.checkText}>Confira o texto antes de gerar.</p> : <span />}
            <p className={b.counter} aria-hidden="true">
              {text.length}/{DESCRIPTION_MAX}
            </p>
          </div>
          {shownError && (
            <p className={s.fieldError} id="erro-descricao" role="alert">
              {shownError}
            </p>
          )}
          <button
            ref={mainButton}
            type="button"
            id="gerar-previa"
            className={`${s.primary} ${b.wideBtn} ${b.generate}`}
            onClick={generate}
            disabled={generating}
            aria-busy={generating}
          >
            {generating ? (
              <>
                <LoaderCircle aria-hidden="true" className={b.spin} /> Montando sua prévia…
              </>
            ) : (
              <>
                <Sparkles aria-hidden="true" /> {shownError && genError ? 'Tentar de novo' : 'Gerar minha prévia'}
              </>
            )}
          </button>
          {audioOk && !generating && (
            <button type="button" className={`${s.secondary} ${b.wideBtn}`} onClick={startRecording}>
              <Mic aria-hidden="true" /> {fromAudio ? 'Gravar novamente' : 'Gravar minha ideia'}
            </button>
          )}
        </>
      )}

      {status && (
        <p className={b.muted} role="status" style={{ marginTop: 8 }}>
          {status}
        </p>
      )}
      <p className={b.privacy} id="dica-descricao">
        {audioOk ? 'O texto (e o áudio, que só serve para virar texto) passa' : 'O texto passa'} pelo nosso servidor, que não o guarda, e vai ao Google Gemini só para
        montar a prévia, conforme os termos do Google. Não inclua telefone, e-mail ou dados pessoais. <a href={asset('/privacidade/')}>Privacidade</a>
      </p>
    </section>
  );
}
