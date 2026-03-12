import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

function formatDateForTitle(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale, date } = await params;
  const t = await getTranslations({ locale, namespace: 'archive' });
  const formattedDate = formatDateForTitle(date, locale);
  const title = `${formattedDate} — OneWord ${locale === 'es' ? 'Archivo' : 'Archive'}`;
  const description = t('meta_description');
  const baseUrl = 'https://oneword.game';

  return {
    title,
    description,
    alternates: {
      canonical:
        locale === 'en'
          ? `${baseUrl}/archive/${date}`
          : `${baseUrl}/es/archive/${date}`,
      languages: {
        en: `${baseUrl}/archive/${date}`,
        es: `${baseUrl}/es/archive/${date}`,
        'x-default': `${baseUrl}/archive/${date}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
    },
  };
}

export default function ArchiveDayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
