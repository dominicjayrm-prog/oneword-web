import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { ContentRenderer } from '@/components/blog/ContentRenderer';
import { BlogPostTracker } from '@/components/blog/BlogPostTracker';
import type { BlogPost } from '@/lib/blog/types';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, author:blog_authors(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) return {};

  const canonical =
    locale === 'es'
      ? `https://playoneword.app/es/blog/${slug}`
      : `https://playoneword.app/blog/${slug}`;

  return {
    title: `${post.meta_title || post.title} — OneWord Blog`,
    description: post.meta_description || post.excerpt || '',
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      url: canonical,
      publishedTime: post.published_at || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags || undefined,
      images: post.banner_url ? [{ url: post.banner_url, alt: post.banner_alt || post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: post.banner_url ? [post.banner_url] : undefined,
    },
  };
}

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, author:blog_authors(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) notFound();

  const typedPost = post as BlogPost;

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: typedPost.title,
    description: typedPost.excerpt || '',
    image: typedPost.banner_url || undefined,
    datePublished: typedPost.published_at || undefined,
    dateModified: typedPost.updated_at,
    author: typedPost.author
      ? {
          '@type': 'Person',
          name: typedPost.author.name,
          url: `https://playoneword.app/blog/author/${typedPost.author.slug}`,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'OneWord',
      url: 'https://playoneword.app',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':
        locale === 'es'
          ? `https://playoneword.app/es/blog/${slug}`
          : `https://playoneword.app/blog/${slug}`,
    },
    keywords: typedPost.tags?.join(', ') || undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://playoneword.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `https://playoneword.app${locale === 'es' ? '/es' : ''}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: typedPost.title,
      },
    ],
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 pb-20 pt-28">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <li>/</li>
            <li className="truncate text-text">{typedPost.title}</li>
          </ol>
        </nav>

        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm font-medium text-primary hover:underline"
        >
          &larr; {t('back_to_blog')}
        </Link>

        {/* Tags */}
        {typedPost.tags && typedPost.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {typedPost.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl font-black text-text md:text-5xl">
          {typedPost.title}
        </h1>

        {/* Meta line */}
        <div className="mt-4 flex flex-wrap items-center gap-1 text-sm text-text-muted">
          {typedPost.author && (
            <>
              <span>{t('by')}</span>
              <Link
                href={`/blog/author/${typedPost.author.slug}`}
                className="font-medium text-primary hover:underline"
              >
                {typedPost.author.name}
              </Link>
            </>
          )}
          {typedPost.published_at && (
            <span>· {formatDate(typedPost.published_at, locale)}</span>
          )}
          {typedPost.read_time_minutes && (
            <span>· {typedPost.read_time_minutes} min read</span>
          )}
        </div>

        {/* Banner */}
        {typedPost.banner_url && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-xl">
            <Image
              src={typedPost.banner_url}
              alt={typedPost.banner_alt || typedPost.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 720px) 100vw, 720px"
            />
          </div>
        )}

        {/* Content */}
        <article className="mt-10">
          <ContentRenderer content={typedPost.content} />
        </article>

        {/* Author bio card */}
        {typedPost.author && (
          <div className="mt-16 flex gap-5 rounded-xl border border-border p-6">
            {typedPost.author.avatar_url && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={typedPost.author.avatar_url}
                  alt={typedPost.author.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="min-w-0">
              <Link
                href={`/blog/author/${typedPost.author.slug}`}
                className="font-serif text-lg font-bold text-text hover:text-primary"
              >
                {typedPost.author.name}
              </Link>
              {typedPost.author.bio && (
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  {typedPost.author.bio}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                {typedPost.author.twitter_url && (
                  <a
                    href={typedPost.author.twitter_url}
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
                {typedPost.author.linkedin_url && (
                  <a
                    href={typedPost.author.linkedin_url}
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
                {typedPost.author.instagram_url && (
                  <a
                    href={typedPost.author.instagram_url}
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
                {typedPost.author.website_url && (
                  <a
                    href={typedPost.author.website_url}
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
          </div>
        )}

        <BlogPostTracker slug={slug} language={typedPost.language} />
      </main>
      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
