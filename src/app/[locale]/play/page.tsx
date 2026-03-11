'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getGameDate, getGameDay, getGameMonday } from '@/lib/gameDate';
import { getCurrentBadge } from '@/lib/badges';
import { WordDisplay } from '@/components/game/WordDisplay';
import { DescriptionInput } from '@/components/game/DescriptionInput';
import { StreakBadge } from '@/components/game/StreakBadge';
import { BadgePill } from '@/components/game/BadgePill';
import { CountdownTimer } from '@/components/game/CountdownTimer';
import { YesterdayWinner } from '@/components/game/YesterdayWinner';
import { WeeklyRecap } from '@/components/game/WeeklyRecap';
import { StreakCelebration } from '@/components/game/StreakCelebration';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/providers/ToastProvider';
import { Link } from '@/i18n/navigation';
import type { YesterdayWinnerData } from '@/components/game/YesterdayWinner';
import type { WeeklyRecapData } from '@/components/game/WeeklyRecap';
import type { BadgeTier } from '@/lib/badges';

export default function PlayPage() {
  const { user, profile, refreshProfile } = useAuth();
  const locale = useLocale();
  const lang = profile?.language || locale;
  const t = useTranslations('game');
  const { word, userDescription, loading, error, fetchUserDescription, submitDescription } = useWord(lang);
  const { showToast } = useToast();
  const [lockedIn, setLockedIn] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // Interstitial state
  const [yesterdayData, setYesterdayData] = useState<YesterdayWinnerData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyRecapData | null>(null);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showYesterday, setShowYesterday] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeTier | null>(null);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const interstitialStartedRef = useRef(false);
  const interstitialWordIdRef = useRef<string | null>(null);

  // Reset interstitial ref when word changes (day rollover)
  useEffect(() => {
    if (word && word.id !== interstitialWordIdRef.current) {
      interstitialStartedRef.current = false;
      interstitialWordIdRef.current = word.id;
    }
  }, [word]);

  useEffect(() => {
    if (user && word) {
      fetchUserDescription(user.id);
    }
  }, [user, word]);

  useEffect(() => {
    if (userDescription) setLockedIn(true);
  }, [userDescription]);

  // Timezone sync
  useEffect(() => {
    if (!user || !profile) return;
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const storedTimezone = (profile as unknown as Record<string, unknown>).timezone as string | undefined;
    if (deviceTimezone && deviceTimezone !== storedTimezone) {
      supabase.from('profiles').update({ timezone: deviceTimezone }).eq('id', user.id)
        .then(({ error: e }) => { if (e) console.error('Timezone update failed:', e.message); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  // Interstitial flow
  useEffect(() => {
    if (!user || !profile || loading || interstitialStartedRef.current) return;
    interstitialStartedRef.current = true;

    async function loadInterstitials() {
      const gameDate = getGameDate();
      const isMonday = getGameDay() === 1;

      const [yesterdayResult, weeklyResult] = await Promise.all([
        (async () => {
          const dismissed = localStorage.getItem('winner_dismissed_date');
          if (dismissed === gameDate) return null;
          const { data } = await supabase.rpc('get_yesterday_winner', {
            p_user_id: user!.id,
            p_language: lang,
          });
          const row = data && (Array.isArray(data) ? data[0] : data);
          // Only show if user actually played yesterday (has a description)
          if (row?.winner_description && row?.user_description) {
            return row as YesterdayWinnerData;
          }
          return null;
        })(),
        (async () => {
          if (!isMonday) return null;
          const dismissed = localStorage.getItem('recap_dismissed_week');
          if (dismissed === getGameMonday()) return null;
          const { data } = await supabase.rpc('get_weekly_recap', {
            p_user_id: user!.id,
            p_language: lang,
          });
          if (data && (Array.isArray(data) ? data[0] : data)?.days_played > 0) {
            return (Array.isArray(data) ? data[0] : data) as WeeklyRecapData;
          }
          return null;
        })(),
      ]);

      if (weeklyResult) {
        setWeeklyData(weeklyResult);
        setShowWeekly(true);
      }
      if (yesterdayResult) {
        setYesterdayData(yesterdayResult);
        if (!weeklyResult) {
          setShowYesterday(true);
        }
      }
    }

    loadInterstitials();
  }, [user, profile, loading, lang]);

  function dismissWeekly() {
    localStorage.setItem('recap_dismissed_week', getGameMonday());
    setShowWeekly(false);
    if (yesterdayData) {
      setShowYesterday(true);
    }
  }

  function dismissYesterday() {
    localStorage.setItem('winner_dismissed_date', getGameDate());
    setShowYesterday(false);
  }

  async function handleShare() {
    if (weeklyData) {
      const text = t('share_recap_text', {
        days: weeklyData.days_played,
        streak: weeklyData.current_streak,
      });
      if (navigator.share) {
        try { await navigator.share({ text }); } catch { /* cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(text);
          showToast(t('copied_to_clipboard'), 'success');
        } catch { /* n/a */ }
      }
    }
  }

  async function handleSubmit(description: string) {
    if (!user) return;
    try {
      const result = await submitDescription(user.id, description);
      setLockedIn(true);
      await refreshProfile();

      if (result) {
        const oldStreak = result.oldStreak;
        const newStreak = oldStreak + 1;
        const oldBadge = getCurrentBadge(oldStreak);
        const newBadge = getCurrentBadge(newStreak);
        if (newBadge && (!oldBadge || newBadge.streak !== oldBadge.streak)) {
          const key = `milestone_shown_${newBadge.streak}`;
          if (!localStorage.getItem(key)) {
            setTimeout(() => {
              setCelebrationBadge(newBadge);
              setCelebrationStreak(newStreak);
            }, 500);
            localStorage.setItem(key, 'true');
          }
        }
      }
    } catch {
      showToast(t('submit_error'), 'error');
    }
  }

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
        <p className="font-serif text-2xl text-text">{t(error === 'no_word_available' ? 'no_word_available' : 'no_word')}</p>
        <p className="text-text-muted">{t('check_back')}</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showWeekly && weeklyData && (
          <WeeklyRecap data={weeklyData} onDismiss={dismissWeekly} onShare={handleShare} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showYesterday && yesterdayData && (
          <YesterdayWinner data={yesterdayData} onDismiss={dismissYesterday} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationBadge && (
          <StreakCelebration
            badge={celebrationBadge}
            streak={celebrationStreak}
            locale={locale}
            onDismiss={() => setCelebrationBadge(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center">
        {profile && (
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg">
              {profile.avatar_url || profile.username?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="font-medium text-text">{profile.username}</p>
            <BadgePill streak={profile.current_streak} locale={locale} />
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
            <div className="mt-4">
              <CountdownTimer />
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
    </>
  );
}
