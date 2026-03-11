import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/play/', '/auth/', '/login', '/signup', '/es/login', '/es/signup'],
      },
    ],
    sitemap: 'https://oneword.game/sitemap.xml',
  };
}
