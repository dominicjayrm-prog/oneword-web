import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://playoneword.app';

interface PageEntry {
  path: string;
  changeFrequency: string;
  priority: number;
}

const pages: PageEntry[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/archive', changeFrequency: 'daily', priority: 0.7 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

const locales = ['en', 'es'];

function localeUrl(locale: string, page: string) {
  return locale === 'en' ? `${BASE_URL}${page || '/'}` : `${BASE_URL}/${locale}${page}`;
}

export async function GET() {
  const now = new Date().toISOString();

  // Static pages with xhtml:link hreflang alternates
  const staticUrls = pages.flatMap((page) =>
    locales.map((locale) => {
      const enUrl = localeUrl('en', page.path);
      const esUrl = localeUrl('es', page.path);
      return `  <url>
    <loc>${localeUrl(locale, page.path)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`;
    })
  );

  // Dynamic blog post URLs
  let blogUrls: string[] = [];
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, language, updated_at, published_at')
        .eq('status', 'published');

      if (posts) {
        blogUrls = posts.map((post) => {
          const loc = post.language === 'es'
            ? `${BASE_URL}/es/blog/${post.slug}`
            : `${BASE_URL}/blog/${post.slug}`;
          return `  <url>
    <loc>${loc}</loc>
    <lastmod>${post.updated_at || post.published_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
      }

      // Blog author pages
      const { data: authors } = await supabase
        .from('blog_authors')
        .select('slug');

      if (authors) {
        for (const author of authors) {
          for (const locale of locales) {
            const enUrl = `${BASE_URL}/blog/author/${author.slug}`;
            const esUrl = `${BASE_URL}/es/blog/author/${author.slug}`;
            const loc = locale === 'en' ? enUrl : esUrl;
            blogUrls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`);
          }
        }
      }

      // Archive date pages (recent words)
      const { data: words } = await supabase
        .from('words')
        .select('word_date')
        .lte('word_date', new Date().toISOString().split('T')[0])
        .order('word_date', { ascending: false })
        .limit(90);

      if (words) {
        for (const word of words) {
          for (const locale of locales) {
            const enUrl = `${BASE_URL}/archive/${word.word_date}`;
            const esUrl = `${BASE_URL}/es/archive/${word.word_date}`;
            const loc = locale === 'en' ? enUrl : esUrl;
            blogUrls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${word.word_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`);
          }
        }
      }
    }
  } catch {
    // Silently fail — static pages will still be in sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticUrls, ...blogUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
