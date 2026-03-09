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

function localeUrl(locale: string, page: string) {
  return locale === 'en' ? `${BASE_URL}${page || '/'}` : `${BASE_URL}/${locale}${page}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, page),
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, localeUrl(l, page)])
          ),
        },
      });
    }
  }

  return entries;
}
