import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { contact } from '@/config/contact';

/** Páginas públicas. A página de criação mostra dados do visitante e não é indexada. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${contact.siteUrl}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${contact.siteUrl}/exemplos/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${contact.siteUrl}/pacotes/`, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
