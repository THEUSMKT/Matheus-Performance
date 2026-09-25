import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { contact } from '@/config/contact';
import { isProduction } from '@/config/integrations';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProduction && contact.indexarNoGoogle
      ? { userAgent: '*', allow: '/', disallow: ['/privacidade/', '/termos/'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${contact.siteUrl}/sitemap.xml`,
  };
}
