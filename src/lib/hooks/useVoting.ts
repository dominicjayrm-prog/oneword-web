'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getGameDate } from '@/lib/gameDate';
import { checkRateLimit } from '@/lib/rateLimit';

const VOTE_BATCH_SIZE = 15;

export interface VotePairData {
  option_a_id: string;
  option_a_description: string;
  option_a_user_id: string;
  option_a_username?: string;
  option_a_badge_emoji?: string;
  option_b_id: string;
  option_b_description: string;
  option_b_user_id: string;
  option_b_username?: string;
  option_b_badge_emoji?: string;
}

function normalizePair(data: Record<string, unknown>): VotePairData | null {
  if (data.option_a_id) {
    return data as unknown as VotePairData;
  }
  const a = data.option_a as Record<string, string> | undefined;
  const b = data.option_b as Record<string, string> | undefined;
  if (a?.id && b?.id) {
    return {
      option_a_id: a.id,
      option_a_description: a.description,
      option_a_user_id: a.user_id,
      option_a_username: (data.desc1_username as string) || undefined,
      option_a_badge_emoji: (data.desc1_badge_emoji as string) || undefined,
      option_b_id: b.id,
      option_b_description: b.description,
      option_b_user_id: b.user_id,
      option_b_username: (data.desc2_username as string) || undefined,
      option_b_badge_emoji: (data.desc2_badge_emoji as string) || undefined,
    };
  }
  return null;
}

function pairKey(pair: VotePairData): string {
  const ids = [pair.option_a_id, pair.option_b_id].sort();
  return `${ids[0]}:${ids[1]}`;
}

function getStorageKey(wordId: string): string {
  return `vote_progress_${wordId}_${getGameDate()}`;
}

export function useVoting(wordId: string | undefined, voterId: string | undefined) {
  const [pair, setPair] = useState<VotePairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [noMorePairs, setNoMorePairs] = useState(false);
  const [batchExhausted, setBatchExhausted] = useState(false);
  const seenPairs = useRef<Set<string>>(new Set());
  const supabase = createClient();

  // Restore vote count from localStorage
  useEffect(() => {
    if (!wordId) return;
    const key = getStorageKey(wordId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const count = parseInt(stored, 10);
      if (!isNaN(count)) {
        setVotesCount(count);
        if (count >= VOTE_BATCH_SIZE) {
          setBatchExhausted(true);
        }
      }
    }
  }, [wordId]);

  const fetchPairFallback = useCallback(async (): Promise<VotePairData | null> => {
    if (!wordId || !voterId) return null;
    const { data: descriptions, error } = await supabase
      .from('descriptions')
      .select('id, description, user_id')
      .eq('word_id', wordId)
      .neq('user_id', voterId);

    if (error) {
      console.error('Fallback descriptions query error:', error.code, error.message);
      return null;
    }
    if (!descriptions || descriptions.length < 2) return null;

    const shuffled = [...descriptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return {
      option_a_id: shuffled[0].id,
      option_a_description: shuffled[0].description,
      option_a_user_id: shuffled[0].user_id,
      option_b_id: shuffled[1].id,
      option_b_description: shuffled[1].description,
      option_b_user_id: shuffled[1].user_id,
    };
  }, [wordId, voterId]);

  const fetchPair = useCallback(async () => {
    if (!wordId || !voterId) return;
    if (batchExhausted) return;
    setLoading(true);

    const MAX_RETRIES = 5;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data, error } = await supabase.rpc('get_vote_pair', {
        p_word_id: wordId,
        p_voter_id: voterId,
      });

      if (error) {
        console.error('get_vote_pair RPC error:', error.code, error.message);
        break;
      }
      if (!data) break;

      const normalized = normalizePair(data);
      if (!normalized) {
        console.error('get_vote_pair returned unrecognized format:', data);
        break;
      }

      const key = pairKey(normalized);
      if (!seenPairs.current.has(key)) {
        seenPairs.current.add(key);
        setPair(normalized);
        setLoading(false);
        return;
      }
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const fallbackPair = await fetchPairFallback();
      if (!fallbackPair) break;
      const key = pairKey(fallbackPair);
      if (!seenPairs.current.has(key)) {
        seenPairs.current.add(key);
        setPair(fallbackPair);
        setLoading(false);
        return;
      }
    }

    setNoMorePairs(true);
    setLoading(false);
  }, [wordId, voterId, fetchPairFallback, batchExhausted]);

  async function submitVote(winnerId: string, loserId: string) {
    if (!wordId || !voterId) return;
    if (!checkRateLimit('vote')) return;

    const { error } = await supabase.rpc('submit_vote', {
      p_voter_id: voterId,
      p_word_id: wordId,
      p_winner_id: winnerId,
      p_loser_id: loserId,
    });
    if (error) {
      console.error('submit_vote RPC error:', error.code, error.message);
      const { error: insertError } = await supabase.from('votes').insert({
        voter_id: voterId,
        word_id: wordId,
        winner_id: winnerId,
        loser_id: loserId,
      });
      if (insertError) {
        console.error('Fallback vote insert error:', insertError.code, insertError.message);
        return;
      }
    }

    const newCount = votesCount + 1;
    setVotesCount(newCount);

    if (wordId) {
      localStorage.setItem(getStorageKey(wordId), newCount.toString());
    }

    if (newCount >= VOTE_BATCH_SIZE) {
      setBatchExhausted(true);
      setPair(null);
    } else {
      setPair(null);
      await fetchPair();
    }
  }

  return { pair, loading, votesCount, noMorePairs, batchExhausted, fetchPair, submitVote, VOTE_BATCH_SIZE };
}
