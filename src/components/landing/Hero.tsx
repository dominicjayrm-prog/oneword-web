'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const t = useTranslations('hero');
  const demoPills = t.raw('demo_pills') as string[];

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue/[0.04] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        <span className="mb-8 rounded-full bg-primary-light px-5 py-2 text-sm font-medium text-primary">
          {t('badge')}
        </span>

        <h1 className="font-serif font-black leading-[1.05] text-text" style={{ fontSize: 'clamp(48px, 8vw, 86px)' }}>
          {t('title_line1')}
          <br />
          {t('title_line2')} <span className="text-primary">{t('title_highlight')}</span>
        </h1>

        <p className="mt-6 max-w-[480px] text-[19px] leading-relaxed text-text-muted">
          {t('subtitle')}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-xl shadow-black/5"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {t('demo_label')}
          </span>
          <p className="mt-2 font-serif text-5xl font-black tracking-tight text-text md:text-6xl" role="presentation">
            {t('demo_word')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {demoPills.map((word: string, i: number) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.6 }}
                className="rounded-full border-2 border-primary bg-primary-light px-4 py-1.5 text-base font-medium text-primary"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.8 }}
            className="mt-4 font-mono text-sm text-primary"
          >
            {t('demo_counter')}
          </motion.p>
        </motion.div>

        <div className="mt-8 mb-6 flex flex-wrap items-center justify-center gap-4">
          <Button variant="dark" size="lg" as="a" href="#">
            &#127822; {t('cta_appstore')}
          </Button>
          <Link href="/play">
            <Button variant="outline" size="lg">
              &#127760; {t('cta_web')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
