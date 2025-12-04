import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://guventurizm.az";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/'], // Admin və Profil səhifələrini indeksləmə
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}