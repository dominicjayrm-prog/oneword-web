import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/blog/types';

interface RelatedPostsProps {
  currentPostId: string;
  tags: string[] | null;
  language: string;
  locale: string;
  heading: string;
}

export async function RelatedPosts({ currentPostId, tags, language, locale, heading }: RelatedPostsProps) {
  const supabase = await createClient();

  let related: BlogPost[] = [];

  // Strategy 1: Find posts with overlapping tags
  if (tags && tags.length > 0) {
    const { data } = await supabase
      .from('blog_posts')
      .select('*, author:blog_authors(*)')
      .eq('status', 'published')
      .eq('language', language)
      .neq('id', currentPostId)
      .overlaps('tags', tags)
      .order('published_at', { ascending: false })
      .limit(3);

    if (data) related = data as BlogPost[];
  }

  // Strategy 2: If not enough tag matches, fill with recent posts in same language
  if (related.length < 3) {
    const existingIds = [currentPostId, ...related.map((p) => p.id)];
    const { data } = await supabase
      .from('blog_posts')
      .select('*, author:blog_authors(*)')
      .eq('status', 'published')
      .eq('language', language)
      .not('id', 'in', `(${existingIds.join(',')})`)
      .order('published_at', { ascending: false })
      .limit(3 - related.length);

    if (data) related = [...related, ...(data as BlogPost[])];
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="mb-8 font-serif text-2xl font-bold text-text">{heading}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-xl border border-border bg-white transition hover:border-primary/30 hover:shadow-md"
          >
            {post.banner_url && (
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.banner_url}
                  alt={post.banner_alt || post.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-4">
              {post.tags?.[0] && (
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs text-primary">
                  {post.tags[0]}
                </span>
              )}
              <h3 className="line-clamp-2 font-serif text-base font-bold text-text group-hover:text-primary">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">
                  {post.excerpt}
                </p>
              )}
              {post.read_time_minutes && (
                <p className="mt-2 text-[11px] text-text-muted">
                  {post.read_time_minutes} min read
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
