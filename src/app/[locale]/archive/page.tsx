'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useArchiveCalendar } from '@/lib/hooks/useArchive';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Footer } from '@/components/ui/Footer';

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatMonthLabel(monthKey: string, locale: string): string {
  const [year, month] = monthKey.split('-');
  const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 15));
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function ArchivePage() {
  const t = useTranslations('archive');
  const locale = useLocale();
  const { entries, loading, hasMore, loadMore, fetchCalendar, months, filterByMonth } =
    useArchiveCalendar(locale === 'es' ? 'es' : 'en');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  function handleMonthFilter(monthKey: string | null) {
    setSelectedMonth(monthKey);
    filterByMonth(monthKey);
  }

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
        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-black text-text md:text-5xl">{t('title')}</h1>
          <p className="mt-3 text-text-muted">{t('subtitle')}</p>
        </div>

        {/* Month filter */}
        {months.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleMonthFilter(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedMonth === null
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted hover:text-text'
              }`}
            >
              {locale === 'es' ? 'Todos' : 'All'}
            </button>
            {months.map((m) => (
              <button
                key={m}
                onClick={() => handleMonthFilter(m)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                  selectedMonth === m
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-muted hover:text-text'
                }`}
              >
                {formatMonthLabel(m, locale)}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-serif text-2xl text-text">{t('empty_title')}</p>
            <p className="mt-2 text-text-muted">{t('empty_subtitle')}</p>
          </div>
        )}

        {/* Card list */}
        {!loading && entries.length > 0 && (
          <div className="flex flex-col gap-4">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.word_date}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link href={`/archive/${entry.word_date}`}>
                  <div className="group cursor-pointer rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md sm:p-5">
                    <p className="font-mono text-xs text-text-muted">
                      {formatDate(entry.word_date, locale)}
                    </p>
                    <div className="mt-2 flex items-baseline justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-text transition-colors group-hover:text-primary sm:text-[28px]">
                          {entry.word.toUpperCase()}
                        </h2>
                        <p className="mt-0.5 text-[11px] font-medium text-primary">
                          {entry.category}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono text-xs text-text-muted">
                        {entry.player_count} {t('players')}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={loadMore}>
                  {t('load_more')}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
