const BASE_URL = 'https://playoneword.app';

interface PageEntry {
  path: string;
  changeFrequency: string;
  priority: number;
}

const pages: PageEntry[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/archive', changeFrequency: 'daily', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

const locales = ['en', 'es'];

function localeUrl(locale: string, page: string) {
  return locale === 'en' ? `${BASE_URL}${page || '/'}` : `${BASE_URL}/${locale}${page}`;
}

export function GET() {
  const now = new Date().toISOString();

  const urls = pages.flatMap((page) =>
    locales.map((locale) => `  <url>
    <loc>${localeUrl(locale, page.path)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
