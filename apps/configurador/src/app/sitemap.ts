import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { contact } from '@/config/contact';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${contact.siteUrl}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${contact.siteUrl}/criar/`, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
