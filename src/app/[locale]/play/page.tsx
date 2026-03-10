'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { WordDisplay } from '@/components/game/WordDisplay';
import { DescriptionInput } from '@/components/game/DescriptionInput';
import { StreakBadge } from '@/components/game/StreakBadge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from '@/i18n/navigation';

export default function PlayPage() {
  const { user, profile } = useAuth();
  const lang = profile?.language || 'en';
  const t = useTranslations('game');
  const { word, userDescription, loading, error, fetchUserDescription, submitDescription } = useWord(lang);
  const [lockedIn, setLockedIn] = useState(false);

  useEffect(() => {
    if (user && word) {
      fetchUserDescription(user.id);
    }
  }, [user, word]);

  useEffect(() => {
    if (userDescription) setLockedIn(true);
  }, [userDescription]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-serif text-2xl text-text">{error || t('no_word')}</p>
        <p className="text-text-muted">{t('check_back')}</p>
      </div>
    );
  }

  async function handleSubmit(description: string) {
    if (!user) return;
    await submitDescription(user.id, description);
    setLockedIn(true);
  }

  return (
    <div className="flex flex-col items-center">
      {profile && (
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {profile.username?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="font-medium text-text">{profile.username}</p>
          <StreakBadge streak={profile.current_streak} />
        </div>
      )}

      <WordDisplay word={word.word} category={word.category} />

      {lockedIn && userDescription ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 w-full text-center"
        >
          <div className="rounded-2xl border border-green/30 bg-green/5 p-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-3 py-1 text-sm font-bold text-green">
              {t('locked_in')}
            </span>
            <p className="mt-4 font-serif text-xl italic text-text">
              &ldquo;{userDescription.description}&rdquo;
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/play/vote">
              <Button variant="primary">
                {t('vote_on_others')}
              </Button>
            </Link>
            <Link href="/play/results">
              <Button variant="outline">
                {t('see_results')}
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <DescriptionInput onSubmit={handleSubmit} />
      )}
    </div>
  );
}
