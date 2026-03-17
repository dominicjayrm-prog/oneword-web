import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import type { BlogPost, BlogAuthor } from '@/lib/blog/types';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: author } = await supabase
    .from('blog_authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!author) return {};

  const bio = (locale === 'es' ? author.bio_es : author.bio_en) || `Posts by ${author.name}`;
  const siteUrl = 'https://playoneword.app';

  const canonical = locale === 'es' ? `${siteUrl}/es/blog/author/${slug}` : `${siteUrl}/blog/author/${slug}`;

  return {
    title: `${author.name} — OneWord Blog`,
    description: bio,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/blog/author/${slug}`,
        es: `${siteUrl}/es/blog/author/${slug}`,
        'x-default': `${siteUrl}/blog/author/${slug}`,
      },
    },
    openGraph: {
      type: 'profile',
      title: `${author.name} — OneWord Blog`,
      description: bio,
      url: canonical,
      images: [{ url: `${siteUrl}/api/og?type=author&title=${encodeURIComponent(author.name)}`, width: 1200, height: 630, alt: author.name }],
    },
  };
}

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );
}

export default async function AuthorPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');

  const supabase = await createClient();

  const { data: author } = await supabase
    .from('blog_authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!author) notFound();

  const typedAuthor = author as BlogAuthor;

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*, author:blog_authors(*)')
    .eq('author_id', typedAuthor.id)
    .eq('status', 'published')
    .eq('language', locale === 'es' ? 'es' : 'en')
    .order('published_at', { ascending: false });

  const typedPosts = (posts as BlogPost[]) || [];

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: typedAuthor.name,
    description: (locale === 'es' ? typedAuthor.bio_es : typedAuthor.bio_en) || undefined,
    image: typedAuthor.avatar_url || undefined,
    url: `https://playoneword.app/blog/author/${typedAuthor.slug}`,
    sameAs: [
      typedAuthor.twitter_url,
      typedAuthor.linkedin_url,
      typedAuthor.instagram_url,
      typedAuthor.website_url,
    ].filter(Boolean),
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[960px] px-6 pb-20 pt-28">
        {/* Author header */}
        <div className="mb-12 flex flex-col items-center text-center">
          {typedAuthor.avatar_url && (
            <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full">
              <Image
                src={typedAuthor.avatar_url}
                alt={typedAuthor.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
          <h1 className="font-serif text-3xl font-bold text-text">
            {typedAuthor.name}
          </h1>
          {(locale === 'es' ? typedAuthor.bio_es : typedAuthor.bio_en) && (
            <p className="mt-3 max-w-lg text-text-muted">
              {locale === 'es' ? typedAuthor.bio_es : typedAuthor.bio_en}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4">
            {typedAuthor.twitter_url && (
              <a
                href={typedAuthor.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {typedAuthor.linkedin_url && (
              <a
                href={typedAuthor.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary"
                aria-label="LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {typedAuthor.instagram_url && (
              <a
                href={typedAuthor.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            )}
            {typedAuthor.website_url && (
              <a
                href={typedAuthor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary"
                aria-label="Website"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.257.26-2.455.726-3.541" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Posts by author */}
        <h2 className="mb-8 font-serif text-2xl font-bold text-text">
          {t('posts_by', { name: typedAuthor.name })}
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {typedPosts.map((post) => (
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
                    sizes="(max-width: 768px) 100vw, 50vw"
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
                <h3 className="line-clamp-2 font-serif text-xl font-bold text-text">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-text-muted">
                    {post.excerpt}
                  </p>
                )}
                {post.published_at && (
                  <p className="mt-4 text-xs text-text-muted">
                    {formatDate(post.published_at, locale)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {typedPosts.length === 0 && (
          <p className="text-center text-text-muted">{t('no_posts')}</p>
        )}

        <div className="mt-12">
          <Link
            href="/blog"
            className="text-sm font-medium text-primary hover:underline"
          >
            &larr; {t('back_to_blog')}
          </Link>
        </div>
      </main>
      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </>
  );
}
