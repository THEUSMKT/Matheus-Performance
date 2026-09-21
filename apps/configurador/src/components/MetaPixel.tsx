'use client';

import { useEffect } from 'react';
import {
  initMetaPixel,
  trackConfiguratorStarted,
  trackPageView,
} from '@/lib/metaPixel';

type Props = {
  /**
   * Ponto único para consentimento futuro. Quando houver banner/CMP,
   * basta alimentar esta prop com o consentimento de marketing.
   */
  enabled?: boolean;
};

export function MetaPixel({ enabled = true }: Props) {
  useEffect(() => {
    if (!enabled) return;

    initMetaPixel();
    trackPageView();

    // CTAs que levam ao configurador contam como início da jornada.
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href="#configurador"]');
      if (anchor) trackConfiguratorStarted();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [enabled]);

  return null;
}
