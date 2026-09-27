import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { contact } from '@/config/contact';

/** Só a apresentação: a página de criação mostra dados do visitante e não é indexada. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${contact.siteUrl}/`, changeFrequency: 'monthly', priority: 1 },
  ];
}
