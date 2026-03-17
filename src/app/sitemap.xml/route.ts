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

  // Static pages
  const staticUrls = pages.flatMap((page) =>
    locales.map((locale) => `  <url>
    <loc>${localeUrl(locale, page.path)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
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
            const loc = locale === 'en'
              ? `${BASE_URL}/blog/author/${author.slug}`
              : `${BASE_URL}/${locale}/blog/author/${author.slug}`;
            blogUrls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
          }
        }
      }
    }
  } catch {
    // Silently fail — static pages will still be in sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...blogUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
