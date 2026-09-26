/* ==========================================================================
   Logo enviada pelo visitante para a prévia.
   Fica só neste navegador, separada do projeto: não entra em links, na
   mensagem do WhatsApp nem no pedido — a prévia só mostra a imagem.
   A imagem é reduzida no próprio navegador antes de ser guardada.
   ========================================================================== */

export const LOGO_KEY = 'bp.logo.v1';
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_SIDE = 360;

export function readLogo(): string | null {
  try {
    const v = localStorage.getItem(LOGO_KEY);
    return v && v.startsWith('data:image/') ? v : null;
  } catch {
    return null;
  }
}

export function saveLogo(dataUrl: string): boolean {
  try {
    localStorage.setItem(LOGO_KEY, dataUrl);
    return true;
  } catch {
    return false;
  }
}

export function clearLogo() {
  try {
    localStorage.removeItem(LOGO_KEY);
  } catch {
    /* nada salvo */
  }
}

export type LogoError = 'tipo' | 'tamanho' | 'leitura';

export const logoErrorText: Record<LogoError, string> = {
  tipo: 'Use uma imagem PNG, JPG, WEBP ou SVG.',
  tamanho: 'A imagem passa de 8 MB. Envie um arquivo menor.',
  leitura: 'Não conseguimos ler essa imagem. Tente outro arquivo.',
};

/** Lê, reduz (lado maior até 360px) e devolve um PNG em data URL. */
export async function prepareLogo(file: File): Promise<{ ok: true; dataUrl: string } | { ok: false; error: LogoError }> {
  if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type)) return { ok: false, error: 'tipo' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'tamanho' };
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const w = img.naturalWidth || MAX_SIDE;
    const h = img.naturalHeight || MAX_SIDE;
    const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'leitura' };
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { ok: true, dataUrl: canvas.toDataURL('image/png') };
  } catch {
    return { ok: false, error: 'leitura' };
  } finally {
    URL.revokeObjectURL(url);
  }
}
