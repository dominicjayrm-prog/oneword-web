'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const emojis = ['\u26A1', '\uD83D\uDD25', '\uD83C\uDFC6', '\uD83D\uDCE4', '\uD83E\uDDE0', '\uD83C\uDF0D'];

export function Features() {
  const t = useTranslations('features');

  const features = emojis.map((emoji, i) => ({
    emoji,
    title: t(`f${i + 1}_title`),
    desc: t(`f${i + 1}_desc`),
  }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {t('label')}
        </span>
        <h2 className="mt-3 font-serif text-4xl font-bold text-text md:text-5xl">
          {t('title')}
        </h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-white p-7"
          >
            <span className="text-3xl">{feat.emoji}</span>
            <h3 className="mt-4 font-serif text-lg font-bold text-text">{feat.title}</h3>
            <p className="mt-2 leading-relaxed text-text-muted">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
