'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import type { BlogPost } from '@/lib/blog/types';

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="aspect-video animate-pulse bg-surface" />
      <div className="space-y-3 p-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-surface" />
          <div className="h-4 w-20 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-6 w-3/4 animate-pulse rounded bg-surface" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-surface" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

export default function BlogIndex() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('blog_posts')
        .select('*, author:blog_authors(*)')
        .eq('status', 'published')
        .eq('language', locale === 'es' ? 'es' : 'en')
        .order('published_at', { ascending: false });

      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    }
    fetchPosts();
  }, [locale]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      locale === 'es' ? 'es-ES' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[960px] px-6 pb-20 pt-28">
        <div className="animate-fade-in-up mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-text md:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-text-muted">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="animate-fade-in-up group overflow-hidden rounded-xl border border-border bg-white transition hover:shadow-lg"
                  style={{ animationDelay: `${100 + index * 80}ms` }}
                >
                  {post.banner_url && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.banner_url}
                        alt={post.banner_alt || post.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index < 2}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      {post.tags?.[0] && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                          {post.tags[0]}
                        </span>
                      )}
                      {post.read_time_minutes && (
                        <span className="text-xs text-text-muted">
                          {post.read_time_minutes} min read
                        </span>
                      )}
                    </div>
                    <h2 className="line-clamp-2 font-serif text-xl font-bold text-text">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-text-muted">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 text-xs text-text-muted">
                      {post.author?.name && <span>{post.author.name}</span>}
                      {post.published_at && (
                        <span>
                          {post.author?.name ? ' · ' : ''}
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {!loading && posts.length === 0 && (
          <p className="text-center text-text-muted">{t('no_posts')}</p>
        )}
      </main>
      <Footer />
    </>
  );
}
