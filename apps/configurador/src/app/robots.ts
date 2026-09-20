import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { contact } from '@/config/contact';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/privacidade/', '/termos/'] },
    sitemap: `${contact.siteUrl}/sitemap.xml`,
  };
}
