'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface OnboardingProps {
  onComplete: () => void;
}

function DescribeStep() {
  const t = useTranslations('onboarding');
  const pills = t.raw('example_pills') as string[];

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-6xl" aria-hidden="true">✍️</span>
      <h2 className="mt-6 font-serif text-3xl font-black text-text">{t('step1_title')}</h2>
      <p className="mt-3 text-text-muted">{t('step1_desc')}</p>
      <div className="mt-8 rounded-2xl bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{t('example_word')}</p>
        <h3 className="mt-1 font-serif text-4xl font-black text-text">{t('example_word_value')}</h3>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pills.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className="rounded-full border-2 border-primary bg-primary-light px-4 py-1.5 text-sm font-medium text-primary"
            >
              {word}
            </motion.span>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-3 font-mono text-sm text-primary"
        >
          5/5 ✓
        </motion.p>
      </div>
    </div>
  );
}

function VoteStep() {
  const t = useTranslations('onboarding');
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-6xl" aria-hidden="true">🗳️</span>
      <h2 className="mt-6 font-serif text-3xl font-black text-text">{t('step2_title')}</h2>
      <p className="mt-3 text-text-muted">{t('step2_desc')}</p>
      <div className="mt-8 flex w-full flex-col gap-3">
        {[
          { key: 'a' as const, text: t('vote_option_a') },
          { key: 'b' as const, text: t('vote_option_b') },
        ].map(({ key, text }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPicked(key)}
            aria-pressed={picked === key}
            className={`cursor-pointer rounded-2xl border-2 p-5 text-center transition-all ${
              picked === key
                ? 'border-primary bg-primary-light'
                : picked
                ? 'border-border opacity-50'
                : 'border-border bg-white hover:border-primary/50'
            }`}
          >
            <p className="font-serif text-lg italic text-text">{text}</p>
            {picked === key && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 inline-block text-sm font-bold text-primary"
              >
                {t('your_pick')}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CompeteStep() {
  const t = useTranslations('onboarding');
  const mockLeaderboard = [
    { rank: 1, emoji: '🥇', desc: t('leaderboard_1'), user: '@wordsmith' },
    { rank: 2, emoji: '🥈', desc: t('leaderboard_2'), user: '@poeticmind' },
    { rank: 3, emoji: '🥉', desc: t('leaderboard_3'), user: '@cloudchaser' },
  ];

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-6xl" aria-hidden="true">🏆</span>
      <h2 className="mt-6 font-serif text-3xl font-black text-text">{t('step3_title')}</h2>
      <p className="mt-3 text-text-muted">{t('step3_desc')}</p>
      <div className="mt-8 flex w-full flex-col gap-2">
        {mockLeaderboard.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.2 }}
            className={`flex items-center gap-3 rounded-xl border p-4 ${
              i === 0 ? 'border-gold/30 bg-gold/5' : i === 1 ? 'border-silver/30 bg-silver/5' : 'border-bronze/30 bg-bronze/5'
            }`}
          >
            <span className="text-xl" aria-hidden="true">{entry.emoji}</span>
            <div className="flex-1 text-left">
              <p className="font-serif text-sm text-text">{entry.desc}</p>
              <p className="text-xs text-text-muted">{entry.user}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-6">
        <div className="text-center">
          <p className="text-2xl" aria-hidden="true">🔥</p>
          <p className="text-xs text-text-muted">{t('streaks')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl" aria-hidden="true">🏆</p>
          <p className="text-xs text-text-muted">{t('trophies')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl" aria-hidden="true">🗳️</p>
          <p className="text-xs text-text-muted">{t('votes')}</p>
        </div>
      </div>
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const t = useTranslations('onboarding');
  const steps = [DescribeStep, VoteStep, CompeteStep];
  const StepComponent = steps[step];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onComplete();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label={t('step1_title')}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md px-6 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-border bg-bg px-6 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {/* Dots */}
          <div className="flex gap-2" aria-label={`Step ${step + 1} of ${steps.length}`} role="group">
            {steps.map((_, i) => (
              <div
                key={`dot-${i}`}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-6 bg-primary' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                {t('back')}
              </Button>
            )}
            <Button variant="primary" onClick={handleNext}>
              {step === steps.length - 1 ? t('lets_play') : t('next')}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
