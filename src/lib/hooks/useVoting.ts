'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface VotePairData {
  option_a_id: string;
  option_a_description: string;
  option_a_user_id: string;
  option_b_id: string;
  option_b_description: string;
  option_b_user_id: string;
}

function normalizePair(data: Record<string, unknown>): VotePairData | null {
  // Handle flat format: { option_a_id, option_a_description, ... }
  if (data.option_a_id) {
    return data as unknown as VotePairData;
  }
  // Handle nested format: { option_a: { id, description, user_id }, option_b: { ... } }
  const a = data.option_a as Record<string, string> | undefined;
  const b = data.option_b as Record<string, string> | undefined;
  if (a?.id && b?.id) {
    return {
      option_a_id: a.id,
      option_a_description: a.description,
      option_a_user_id: a.user_id,
      option_b_id: b.id,
      option_b_description: b.description,
      option_b_user_id: b.user_id,
    };
  }
  return null;
}

function pairKey(pair: VotePairData): string {
  // Normalize key so (A,B) and (B,A) are the same
  const ids = [pair.option_a_id, pair.option_b_id].sort();
  return `${ids[0]}:${ids[1]}`;
}

export function useVoting(wordId: string | undefined, voterId: string | undefined) {
  const [pair, setPair] = useState<VotePairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [noMorePairs, setNoMorePairs] = useState(false);
  const seenPairs = useRef<Set<string>>(new Set());
  const supabase = createClient();

  const fetchPair = useCallback(async () => {
    if (!wordId || !voterId) return;
    setLoading(true);

    // Retry up to 5 times to find a pair we haven't seen
    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data } = await supabase.rpc('get_vote_pair', {
        p_word_id: wordId,
        p_voter_id: voterId,
      });

      if (!data) {
        setNoMorePairs(true);
        setLoading(false);
        return;
      }

      const normalized = normalizePair(data);
      if (!normalized) {
        setNoMorePairs(true);
        setLoading(false);
        return;
      }

      const key = pairKey(normalized);
      if (!seenPairs.current.has(key)) {
        seenPairs.current.add(key);
        setPair(normalized);
        setLoading(false);
        return;
      }
      // Pair already seen — loop and try again
    }

    // If we exhausted retries, all returned pairs are duplicates
    setNoMorePairs(true);
    setLoading(false);
  }, [wordId, voterId]);

  async function submitVote(winnerId: string, loserId: string) {
    if (!wordId || !voterId) return;
    await supabase.rpc('submit_vote', {
      p_voter_id: voterId,
      p_word_id: wordId,
      p_winner_id: winnerId,
      p_loser_id: loserId,
    });
    setVotesCount((c) => c + 1);
    setPair(null);
    await fetchPair();
  }

  return { pair, loading, votesCount, noMorePairs, fetchPair, submitVote };
}
