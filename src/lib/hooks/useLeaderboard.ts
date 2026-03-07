'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LeaderboardEntry } from '@/types';

export function useLeaderboard(wordId: string | undefined) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchLeaderboard = useCallback(async (limit = 50) => {
    if (!wordId) return;
    setLoading(true);
    const { data } = await supabase.rpc('get_leaderboard', {
      p_word_id: wordId,
      p_limit: limit,
    });
    if (data) {
      setEntries(data);
    }
    setLoading(false);
  }, [wordId]);

  return { entries, loading, fetchLeaderboard };
}
