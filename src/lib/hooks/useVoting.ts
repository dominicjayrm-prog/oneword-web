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

  const fetchPairFallback = useCallback(async (): Promise<VotePairData | null> => {
    if (!wordId || !voterId) return null;

    // Fetch descriptions for this word, excluding the current user's
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

    // Pick two random descriptions
    const shuffled = descriptions.sort(() => Math.random() - 0.5);
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
    setLoading(true);

    // Retry up to 5 times to find a pair we haven't seen
    const MAX_RETRIES = 5;
    let rpcFailed = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data, error } = await supabase.rpc('get_vote_pair', {
        p_word_id: wordId,
        p_voter_id: voterId,
      });

      if (error) {
        console.error('get_vote_pair RPC error:', error.code, error.message, error.details, error.hint);
        rpcFailed = true;
        break;
      }

      if (!data) {
        break;
      }

      const normalized = normalizePair(data);
      if (!normalized) {
        console.error('get_vote_pair returned unrecognized format:', data);
        rpcFailed = true;
        break;
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

    // RPC failed or returned no data — try direct query fallback
    if (rpcFailed) {
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
    }

    setNoMorePairs(true);
    setLoading(false);
  }, [wordId, voterId, fetchPairFallback]);

  async function submitVote(winnerId: string, loserId: string) {
    if (!wordId || !voterId) return;
    const { error } = await supabase.rpc('submit_vote', {
      p_voter_id: voterId,
      p_word_id: wordId,
      p_winner_id: winnerId,
      p_loser_id: loserId,
    });
    if (error) {
      console.error('submit_vote RPC error:', error.code, error.message, error.details, error.hint);
      // Fallback: insert vote directly
      const { error: insertError } = await supabase.from('votes').insert({
        voter_id: voterId,
        word_id: wordId,
        winner_id: winnerId,
        loser_id: loserId,
      });
      if (insertError) {
        console.error('Fallback vote insert error:', insertError.code, insertError.message);
      }
    }
    setVotesCount((c) => c + 1);
    setPair(null);
    await fetchPair();
  }

  return { pair, loading, votesCount, noMorePairs, fetchPair, submitVote };
}
