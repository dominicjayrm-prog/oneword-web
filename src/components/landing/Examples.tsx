'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

const examplesByLocale: Record<string, { word: string; desc: string }[]> = {
  en: [
    { word: 'MONDAY', desc: 'Weekly funeral everyone attends alive' },
    { word: 'WIFI', desc: 'Invisible oxygen for our souls' },
    { word: 'EX', desc: 'Human lesson with an expiry' },
    { word: 'SILENCE', desc: 'Loudest sound nobody can hear' },
    { word: 'TAXES', desc: "Government's subscription to your labor" },
  ],
  es: [
    { word: 'LUNES', desc: 'Funeral semanal al que sobrevivimos' },
    { word: 'WIFI', desc: 'Ox\u00edgeno invisible para nuestras almas' },
    { word: 'CELOS', desc: 'Veneno que bebes esperando resultados' },
    { word: 'SILENCIO', desc: 'El ruido m\u00e1s fuerte invisible' },
    { word: 'CAF\u00c9', desc: 'Droga legal que todos disfrutan' },
  ],
};

export function Examples() {
  const t = useTranslations('examples');
  const locale = useLocale();
  const examples = examplesByLocale[locale] || examplesByLocale.en;

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold text-text md:text-5xl">
            {t('title')}
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-4">
          {examples.map((ex, i) => (
            <motion.div
              key={ex.word}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:items-center"
            >
              <h3 className="shrink-0 font-serif text-2xl font-black text-text sm:w-32">
                {ex.word}
              </h3>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="flex-1">
                <p className="text-lg font-medium text-text">&ldquo;{ex.desc}&rdquo;</p>
                <span className="mt-1 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
                  {t('winner_label')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
