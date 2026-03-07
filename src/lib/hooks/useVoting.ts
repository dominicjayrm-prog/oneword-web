'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface VotePairData {
  option_a_id: string;
  option_a_description: string;
  option_a_user_id: string;
  option_b_id: string;
  option_b_description: string;
  option_b_user_id: string;
}

export function useVoting(wordId: string | undefined, voterId: string | undefined) {
  const [pair, setPair] = useState<VotePairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [noMorePairs, setNoMorePairs] = useState(false);
  const supabase = createClient();

  const fetchPair = useCallback(async () => {
    if (!wordId || !voterId) return;
    setLoading(true);
    const { data } = await supabase.rpc('get_vote_pair', {
      p_word_id: wordId,
      p_voter_id: voterId,
    });
    if (data && data.option_a_id) {
      setPair(data);
    } else {
      setNoMorePairs(true);
    }
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
