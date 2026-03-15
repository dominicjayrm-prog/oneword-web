import type { MetadataRoute } from 'next';

const BASE_URL = 'https://playoneword.app';
const locales = ['en', 'es'];

interface PageEntry {
  path: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

const pages: PageEntry[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/archive', changeFrequency: 'daily', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

function localeUrl(locale: string, page: string) {
  return locale === 'en' ? `${BASE_URL}${page || '/'}` : `${BASE_URL}/${locale}${page}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, page.path),
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, localeUrl(l, page.path)])
          ),
        },
      });
    }
  }

  return entries;
}
