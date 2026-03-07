import type { MetadataRoute } from 'next';

const BASE_URL = 'https://oneword.game';
const locales = ['en', 'es'];

const pages = [
  '',
  '/privacy',
  '/terms',
  '/login',
  '/signup',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
