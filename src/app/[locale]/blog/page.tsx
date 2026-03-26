import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import BlogIndex from './BlogIndex';
import type { BlogPost } from '@/lib/blog/types';

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const siteUrl = 'https://playoneword.app';

  return {
    title: `Blog — OneWord`,
    description: t('subtitle'),
    alternates: {
      canonical: locale === 'es' ? `${siteUrl}/es/blog` : `${siteUrl}/blog`,
      languages: {
        en: `${siteUrl}/blog`,
        es: `${siteUrl}/es/blog`,
        'x-default': `${siteUrl}/blog`,
      },
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*, author:blog_authors(*)')
    .eq('status', 'published')
    .eq('language', locale === 'es' ? 'es' : 'en')
    .order('published_at', { ascending: false });

  return <BlogIndex initialPosts={(data as BlogPost[]) || []} />;
}
