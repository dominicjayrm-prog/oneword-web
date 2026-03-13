'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useArchiveDay } from '@/lib/hooks/useArchive';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Footer } from '@/components/ui/Footer';
import { use } from 'react';
import { formatDescription } from '@/lib/utils';

const RANK_EMOJI: Record<number, string> = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };
const RANK_BG: Record<number, string> = {
  1: 'bg-[#FFFBEB]',
  2: 'bg-[#F8F8F8]',
  3: 'bg-[#F8F8F8]',
};

function formatFullDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatNumber(n: number, locale: string): string {
  return n.toLocaleString(locale === 'es' ? 'es-ES' : 'en-GB');
}

export default function ArchiveDayPage({
  params,
}: {
  params: Promise<{ date: string; locale: string }>;
}) {
  const { date, locale: paramLocale } = use(params);
  const t = useTranslations('archive');
  const locale = useLocale();
  const lang = locale === 'es' ? 'es' : 'en';
  const { data, loading, fetchDay } = useArchiveDay(lang);

  useEffect(() => {
    if (date) fetchDay(date);
  }, [date, fetchDay]);

  const word = data[0]?.word ?? '';
  const category = data[0]?.category ?? '';
  const playerCount = data[0]?.player_count ?? 0;
  const totalVotes = data.reduce((sum, d) => sum + (d.vote_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-xl font-bold">
            <span className="text-text">one</span>
            <span className="text-primary">word</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-text-muted transition-colors hover:text-text">
              {t('home')}
            </Link>
            <Link href="/play" className="text-text-muted transition-colors hover:text-text">
              {t('play')}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/archive"
          className="text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t('back')}
        </Link>

        {loading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <p className="font-serif text-2xl text-text">{t('empty_title')}</p>
            <p className="mt-2 text-text-muted">{t('empty_subtitle')}</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <>
            {/* Word header */}
            <div className="mt-8 text-center">
              <p className="font-mono text-[13px] text-text-muted">
                {formatFullDate(date, locale)}
              </p>
              <h1 className="mt-3 font-serif text-[42px] font-bold leading-tight text-text">
                {word.toUpperCase()}
              </h1>
              <p className="mt-1 text-xs font-medium text-primary">{category}</p>
              <p className="mt-4 font-mono text-xs text-text-muted">
                {formatNumber(playerCount, locale)} {t('players')}
                {totalVotes > 0 && (
                  <>
                    {' \u00B7 '}
                    {formatNumber(totalVotes, locale)} {t('votes')}
                  </>
                )}
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-border" />

            {/* Descriptions */}
            <div className="flex flex-col gap-3">
              {data.map((entry, i) => {
                const rank = i + 1;
                const emoji = RANK_EMOJI[rank];
                const bgClass = RANK_BG[rank] ?? '';

                return (
                  <motion.div
                    key={`${entry.username}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className={`rounded-xl border border-border p-4 sm:p-5 ${bgClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 font-mono text-sm text-text-muted">
                        {emoji ?? `${rank}.`}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base italic text-text">
                          &ldquo;{formatDescription(entry.description)}&rdquo;
                        </p>
                        <p className="mt-1.5 text-xs text-text-muted">
                          <span className="font-semibold">@{entry.username}</span>
                          {entry.vote_count > 0 && (
                            <>
                              {' \u00B7 '}
                              {formatNumber(entry.vote_count, locale)} {t('votes')}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
