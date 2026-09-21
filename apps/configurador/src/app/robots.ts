import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { contact } from '@/config/contact';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: contact.indexarNoGoogle
      ? { userAgent: '*', allow: '/', disallow: ['/privacidade/', '/termos/'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${contact.siteUrl}/sitemap.xml`,
  };
}
