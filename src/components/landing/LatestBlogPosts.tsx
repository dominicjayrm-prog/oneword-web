import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/blog/types';

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );
}

export async function LatestBlogPosts() {
  const locale = await getLocale();
  const t = await getTranslations('latest_blog');

  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*, author:blog_authors(*)')
    .eq('status', 'published')
    .eq('language', locale === 'es' ? 'es' : 'en')
    .order('published_at', { ascending: false })
    .limit(3);

  const posts = (data as BlogPost[]) || [];
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <span className="text-xs tracking-[4px] uppercase text-primary font-semibold mb-4 block">
            {t('label')}
          </span>
          <h2 className="font-serif text-4xl font-bold text-text md:text-5xl">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-white transition hover:shadow-lg"
            >
              {post.banner_url && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.banner_url}
                    alt={post.banner_alt || post.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5">
                {post.tags?.[0] && (
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    {post.tags[0]}
                  </span>
                )}
                <h3 className="line-clamp-2 font-serif text-lg font-bold text-text">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-3 text-xs text-text-muted">
                  {post.author?.name && <span>{post.author.name}</span>}
                  {post.published_at && (
                    <span>
                      {post.author?.name ? ' · ' : ''}
                      {formatDate(post.published_at, locale)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t('view_all')}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
