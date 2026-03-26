import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/play/', '/admin/', '/auth/', '/es/auth/', '/login', '/signup', '/es/login', '/es/signup'],
      },
    ],
    sitemap: 'https://playoneword.app/sitemap.xml',
  };
}
