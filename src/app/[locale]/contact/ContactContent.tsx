'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

export default function ContactContent() {
  const t = useTranslations('contact');

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 pb-20 pt-28">
        <h1 className="font-serif text-4xl font-bold text-text md:text-5xl">
          {t('title')}
        </h1>

        <div className="mt-8 text-[#4A4A5A] leading-[1.7]">
          <p>
            {t('body')}{' '}
            <a href="mailto:hello@playoneword.app" className="text-primary underline">
              hello@playoneword.app
            </a>
          </p>
        </div>

        <div className="mt-16">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            &larr; {t('back_home')}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
