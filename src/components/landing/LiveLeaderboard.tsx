'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { getRankEmoji } from '@/lib/utils';

interface LeaderboardEntry {
  description: string;
  username: string;
  vote_count: number;
  elo_rating: number;
}

export function LiveLeaderboard() {
  const [word, setWord] = useState<string | null>(null);
  const [wordId, setWordId] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [descCount, setDescCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch today's word (handle both object and array responses)
      let wordRow: { id: string; word: string } | null = null;
      const { data: wordData } = await supabase.rpc('get_today_word', { p_language: 'en' });
      if (wordData) {
        const row = Array.isArray(wordData) ? wordData[0] : wordData;
        if (row && row.id && row.word) wordRow = row;
      }
      // Fallback: query table directly
      if (!wordRow) {
        const today = new Date().toISOString().split('T')[0];
        const { data: fb } = await supabase
          .from('daily_words')
          .select('*')
          .eq('date', today)
          .eq('language', 'en')
          .single();
        if (fb && fb.id && fb.word) wordRow = fb;
      }
      if (wordRow) {
        setWord(wordRow.word);
        setWordId(wordRow.id);

        // Fetch description count
        const { count } = await supabase
          .from('descriptions')
          .select('*', { count: 'exact', head: true })
          .eq('word_id', wordRow.id);
        if (count !== null) setDescCount(count);

        // Fetch leaderboard
        let leaderboardEntries: LeaderboardEntry[] = [];
        const { data: lb } = await supabase.rpc('get_leaderboard', {
          p_word_id: wordRow.id,
          p_limit: 5,
        });
        if (lb && Array.isArray(lb) && lb.length > 0) {
          leaderboardEntries = lb.map((row: Record<string, unknown>) => ({
            description: (row.description || row.description_text || '') as string,
            username: (row.username || row.display_name || '') as string,
            vote_count: (row.vote_count ?? row.votes ?? row.total_votes ?? 0) as number,
            elo_rating: (row.elo_rating ?? 0) as number,
          }));
        }
        // Fallback if descriptions are empty
        if (!leaderboardEntries.some((e) => e.description)) {
          const { data: fallback } = await supabase
            .from('descriptions')
            .select('description, vote_count, elo_rating, profiles!inner(username)')
            .eq('word_id', wordRow.id)
            .order('elo_rating', { ascending: false })
            .limit(5);
          if (fallback) {
            leaderboardEntries = fallback.map((row: Record<string, unknown>) => {
              const profile = row.profiles as Record<string, unknown> | undefined;
              return {
                description: row.description as string,
                username: (profile?.username || '') as string,
                vote_count: (row.vote_count ?? 0) as number,
                elo_rating: (row.elo_rating ?? 0) as number,
              };
            });
          }
        }
        setEntries(leaderboardEntries);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="bg-gradient-to-br from-bg-dark to-[#2D1B69] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Today&apos;s results
        </span>

        {word ? (
          <>
            <h2 className="mt-3 font-serif text-4xl font-bold text-white md:text-5xl">
              Today&apos;s word:{' '}
              <span className="text-primary">{word}</span>
            </h2>
            <p className="mt-3 text-text-muted-light">
              {descCount} description{descCount !== 1 ? 's' : ''} and counting
            </p>
          </>
        ) : (
          <h2 className="mt-3 font-serif text-4xl font-bold text-white md:text-5xl">
            Loading today&apos;s word...
          </h2>
        )}

        <div className="mt-12 flex flex-col gap-3">
          {entries.length > 0 ? (
            entries.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center gap-4 rounded-2xl border px-6 py-4 text-left ${
                  i === 0
                    ? 'border-gold/30 bg-gold/10'
                    : 'border-border-dark bg-white/5'
                }`}
              >
                <span className="text-2xl">{getRankEmoji(i + 1)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg text-white truncate">
                    &ldquo;{entry.description}&rdquo;
                  </p>
                  <p className="text-sm text-text-muted-light">@{entry.username}</p>
                </div>
                <span className="font-mono text-sm text-text-muted-light shrink-0">
                  {entry.vote_count} votes
                </span>
              </motion.div>
            ))
          ) : word ? (
            <div className="py-12 text-center">
              <p className="text-lg text-text-muted-light">
                Today&apos;s word is waiting for its first descriptions. Be the first!
              </p>
              <Button variant="primary" size="lg" as="a" href="/play" className="mt-6">
                Play Now
              </Button>
            </div>
          ) : null}
        </div>

        {entries.length > 0 && (
          <p className="mt-8 text-lg text-text-muted-light">
            Think you can do better?{' '}
            <a href="/play" className="font-semibold text-primary hover:underline">
              Play now
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
