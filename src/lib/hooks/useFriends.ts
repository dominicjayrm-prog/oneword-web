'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<unknown[]>([]);
  const [friendsDescriptions, setFriendsDescriptions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.rpc('get_friends', { p_user_id: userId });
    if (data) setFriends(data);
    setLoading(false);
  }, [userId]);

  const fetchFriendsDescriptions = useCallback(async (wordId: string) => {
    if (!userId) return;
    const { data } = await supabase.rpc('get_friends_descriptions', {
      p_user_id: userId,
      p_word_id: wordId,
    });
    if (data) setFriendsDescriptions(data);
  }, [userId]);

  return { friends, friendsDescriptions, loading, fetchFriends, fetchFriendsDescriptions };
}
