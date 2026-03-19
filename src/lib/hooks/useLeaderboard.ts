'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LeaderboardEntry } from '@/types';

function normalizeEntry(row: Record<string, unknown>): LeaderboardEntry {
  return {
    id: (row.id || row.description_id || '') as string,
    description: (row.description || row.description_text || '') as string,
    elo_rating: (row.elo_rating ?? row.elo ?? 0) as number,
    vote_count: (row.vote_count ?? row.votes ?? row.total_votes ?? 0) as number,
    rank: (row.rank ?? 0) as number,
    user_id: (row.user_id || '') as string,
    username: (row.username || row.display_name || '') as string,
    avatar_url: (row.avatar_url || null) as string | null,
  };
}

function sortByVotes(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.vote_count - a.vote_count);
}

export function useLeaderboard(wordId: string | undefined) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchLeaderboard = useCallback(async (limit = 50) => {
    if (!wordId) return;
    setLoading(true);

    // Try the RPC first
    const { data, error: rpcError } = await supabase.rpc('get_leaderboard', {
      p_word_id: wordId,
      p_limit: limit,
    });

    if (rpcError) {
      console.error('get_leaderboard RPC error:', rpcError.code, rpcError.message);
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const normalized = data.map((row: Record<string, unknown>) => normalizeEntry(row));
      // Check if descriptions came through
      if (normalized.some((e) => e.description)) {
        setEntries(sortByVotes(normalized));
        setLoading(false);
        return;
      }
    }

    // Fallback: query tables directly, sorted by vote_count
    const { data: fallback, error: fallbackError } = await supabase
      .from('descriptions')
      .select('id, user_id, description, vote_count, elo_rating, rank, profiles!inner(username, avatar_url)')
      .eq('word_id', wordId)
      .order('vote_count', { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error('Leaderboard fallback error:', fallbackError.code, fallbackError.message);
    }

    if (fallback) {
      const mapped: LeaderboardEntry[] = fallback.map((row: Record<string, unknown>) => {
        const profile = row.profiles as Record<string, unknown> | undefined;
        return {
          id: row.id as string,
          description: row.description as string,
          elo_rating: (row.elo_rating ?? 0) as number,
          vote_count: (row.vote_count ?? 0) as number,
          rank: (row.rank ?? 0) as number,
          user_id: row.user_id as string,
          username: (profile?.username || '') as string,
          avatar_url: (profile?.avatar_url || null) as string | null,
        };
      });
      setEntries(sortByVotes(mapped));
    }

    setLoading(false);
  }, [wordId, supabase]);

  return { entries, loading, fetchLeaderboard };
}
