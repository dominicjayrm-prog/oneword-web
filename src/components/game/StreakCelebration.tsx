'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { BadgeTier } from '@/lib/badges';
import { getNextBadge, getProgressToNext } from '@/lib/badges';

interface StreakCelebrationProps {
  badge: BadgeTier;
  streak: number;
  locale?: string;
  onDismiss: () => void;
}

function Confetti({ count }: { count: number }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      color: ['#FF6B4A', '#FFD700', '#4A9BFF', '#88E5FF', '#FF8A6B'][i % 5],
      size: 4 + Math.random() * 6,
      rotateDir: Math.random() > 0.5 ? 1 : -1,
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: `${p.x}vw`, scale: 0 }}
          animate={{ opacity: 0, y: '100vh', rotate: 360 * p.rotateDir, scale: 1 }}
          transition={{ delay: p.delay, duration: p.duration, ease: 'easeOut' }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

export function StreakCelebration({ badge, streak, locale = 'en', onDismiss }: StreakCelebrationProps) {
  const t = useTranslations('celebration');
  const nextBadge = getNextBadge(streak);
  const progress = getProgressToNext(streak);
  const isEternal = badge.streak === 365;
  const [confettiCount, setConfettiCount] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      setConfettiCount(isEternal ? 50 : 35); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isEternal]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        role="dialog"
        aria-modal="true"
        aria-label={t('unlocked')}
        className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer"
        style={{
          background: `linear-gradient(to bottom, ${badge.bgGrad[0]}, ${badge.bgGrad[1]})`,
        }}
      >
        <Confetti count={confettiCount} />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="relative z-10 flex flex-col items-center px-8 text-center"
        >
          {/* Ring bursts */}
          {Array.from({ length: isEternal ? 5 : 3 }).map((_, i) => (
            <motion.div
              key={`burst-${i}`}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 3 + i, opacity: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 1.2, ease: 'easeOut' }}
              className="absolute rounded-full border-2"
              style={{
                width: 80,
                height: 80,
                borderColor: badge.color,
              }}
            />
          ))}

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-7xl"
            aria-hidden="true"
          >
            {badge.emoji}
          </motion.span>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 font-mono text-5xl font-black text-white"
          >
            {streak}
          </motion.p>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 font-serif text-3xl font-bold text-white"
          >
            {badge.name[locale === 'es' ? 'es' : 'en']}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-sm text-white/60"
          >
            {t('unlocked')}
          </motion.p>

          {/* Progress to next */}
          {nextBadge ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 w-64"
            >
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{badge.emoji} {badge.streak}</span>
                <span>{nextBadge.emoji} {nextBadge.streak}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: badge.color }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-sm text-white/50"
            >
              {t('highest_tier')}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-xs text-white/30"
          >
            {t('tap_to_dismiss')}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
