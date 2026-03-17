import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BlogIndex from './BlogIndex';

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
      },
    },
  };
}

export default function BlogPage() {
  return <BlogIndex />;
}
