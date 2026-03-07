'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const stepColors = [
  'bg-primary/10 text-primary',
  'bg-blue/10 text-blue',
  'bg-gold/10 text-gold',
];

export function HowItWorks() {
  const t = useTranslations('how');

  const steps = [
    { num: t('step1_num'), title: t('step1_title'), desc: t('step1_desc'), color: stepColors[0] },
    { num: t('step2_num'), title: t('step2_title'), desc: t('step2_desc'), color: stepColors[1] },
    { num: t('step3_num'), title: t('step3_title'), desc: t('step3_desc'), color: stepColors[2] },
  ];

  return (
    <section id="how-it-works" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {t('label')}
        </span>
        <h2 className="mt-3 font-serif text-4xl font-bold text-text md:text-5xl">
          {t('title')}
        </h2>
      </div>

      <div className="mt-16 flex flex-col gap-10">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex gap-6"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-lg font-bold ${step.color}`}
            >
              {step.num}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-text">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-text-muted">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
