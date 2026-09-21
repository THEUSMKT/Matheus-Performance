/* ==========================================================================
   Meta Pixel — camada única de analytics do configurador.

   As funções de tracking não inicializam o Pixel sozinhas. O componente
   <MetaPixel enabled={...} /> controla a inicialização, permitindo condicionar
   o carregamento ao consentimento de marketing no futuro sem reescrever os
   eventos do funil.
   ========================================================================== */

export const META_PIXEL_ID = '2521450064945419';

type MetaPixelParams = Record<string, string | number | boolean>;

type FbqFunction = ((
  command: 'init' | 'track' | 'trackCustom',
  eventOrPixelId: string,
  params?: MetaPixelParams,
) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: FbqFunction;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __metaPixelInitialized?: boolean;
    __metaPixelPageViewed?: boolean;
    __metaPixelEventsOnce?: Record<string, boolean>;
  }
}

function debug(event: string, params?: MetaPixelParams) {
  if (process.env.NODE_ENV !== 'production') {
    console.info('[Meta Pixel]', event, params ?? {});
  }
}

function ready(): FbqFunction | null {
  if (typeof window === 'undefined' || !window.__metaPixelInitialized || !window.fbq) {
    return null;
  }
  return window.fbq;
}

/**
 * Inicializa o snippet oficial do Meta Pixel uma única vez por documento.
 * No futuro, esta função pode ser chamada apenas após consentimento de marketing.
 */
export function initMetaPixel(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const alreadyHadFbq = Boolean(window.fbq);

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue?.push(args);
      }
    } as FbqFunction;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[src*="connect.facebook.net"][src*="fbevents.js"]',
  );

  if (!alreadyHadFbq && !existingScript) {
    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  if (!window.__metaPixelInitialized) {
    window.fbq('init', META_PIXEL_ID);
    window.__metaPixelInitialized = true;
    debug('init', { pixel_id: META_PIXEL_ID });
  }
}

function trackOnce(
  key: string,
  command: 'track' | 'trackCustom',
  event: string,
  params?: MetaPixelParams,
): void {
  const fbq = ready();
  if (!fbq) return;

  window.__metaPixelEventsOnce ??= {};
  if (window.__metaPixelEventsOnce[key]) return;

  window.__metaPixelEventsOnce[key] = true;
  fbq(command, event, params);
  debug(event, params);
}

export function trackPageView(): void {
  const fbq = ready();
  if (!fbq || window.__metaPixelPageViewed) return;

  window.__metaPixelPageViewed = true;
  fbq('track', 'PageView');
  debug('PageView');
}

export function trackConfiguratorStarted(): void {
  trackOnce('ConfiguratorStarted', 'trackCustom', 'ConfiguratorStarted');
}

export type QuoteViewedParams = {
  site_type: string;
  template: string;
  style: string;
  estimated_value: number;
};

export function trackQuoteViewed(params: QuoteViewedParams): void {
  trackOnce('QuoteViewed', 'trackCustom', 'QuoteViewed', params);
}

export type LeadParams = {
  content_name: string;
  site_type: string;
  template: string;
  style: string;
  value: number;
  currency: 'BRL';
};

export function trackLead(params: LeadParams): void {
  trackOnce('Lead', 'track', 'Lead', params);
}

export function trackWhatsAppContact(): void {
  trackOnce('WhatsAppContact', 'trackCustom', 'WhatsAppContact');
}
