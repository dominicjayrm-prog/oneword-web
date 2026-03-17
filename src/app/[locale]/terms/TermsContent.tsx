'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

const CONTACT_EMAIL = 'hello@oneword.app';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-l-2 border-primary pl-6">
      <h2 className="font-serif text-xl font-bold text-text">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export default function TermsContent() {
  const t = useTranslations('terms');

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-6 pb-20 pt-28">
        <p className="text-sm text-text-muted">{t('last_updated')}</p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-text md:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-lg text-[#4A4A5A]">
          {t('subtitle')}
        </p>

        <div className="mt-12 space-y-10 text-[#4A4A5A] leading-[1.7]">
          <Section title={t('s1_title')}>
            <p>{t('s1_p1')}</p>
          </Section>

          <Section title={t('s2_title')}>
            <p>{t('s2_p1')}</p>
          </Section>

          <Section title={t('s3_title')}>
            <p>{t('s3_p1')}</p>
            <p>{t('s3_p2')}</p>
          </Section>

          <Section title={t('s4_title')}>
            <p>{t('s4_p1')}</p>
            <p>{t('s4_p2')}</p>
            <p>{t('s4_p3')}</p>
            <p>{t('s4_p4')}</p>
          </Section>

          <Section title={t('s5_title')}>
            <p>{t('s5_p1')}</p>
          </Section>

          <Section title={t('s6_title')}>
            <p>{t('s6_p1')}</p>
            <p>{t('s6_p2')}</p>
          </Section>

          <Section title={t('s7_title')}>
            <p>{t('s7_p1')}</p>
          </Section>

          <Section title={t('s8_title')}>
            <p>{t('s8_p1')}</p>
          </Section>

          <Section title={t('s9_title')}>
            <p>{t('s9_p1')}</p>
          </Section>

          <Section title={t('s10_title')}>
            <p>{t('s10_p1')}</p>
          </Section>

          <Section title={t('s11_title')}>
            <p>{t('s11_p1')}</p>
          </Section>

          <Section title={t('s12_title')}>
            <p>{t('s12_p1')}</p>
          </Section>

          <Section title={t('s13_title')}>
            <p>{t('s13_p1')}</p>
          </Section>

          <Section title={t('s14_title')}>
            <p>{t('s14_p1')}</p>
          </Section>

          <Section title={t('s15_title')}>
            <p>{t('s15_p1')}</p>
            <p>
              {t('email_label')}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>
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
