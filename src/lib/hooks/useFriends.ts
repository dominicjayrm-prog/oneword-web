'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FriendProfile {
  id: string;
  username: string;
  current_streak: number;
}

interface FriendDescription {
  user_id: string;
  username: string;
  description: string;
  vote_count: number;
}

function normalizeFriend(row: Record<string, unknown>): FriendProfile {
  return {
    id: (row.id || row.friend_id || '') as string,
    username: (row.username || row.display_name || '') as string,
    current_streak: (row.current_streak ?? row.streak ?? 0) as number,
  };
}

function normalizeFriendDesc(row: Record<string, unknown>): FriendDescription {
  return {
    user_id: (row.user_id || '') as string,
    username: (row.username || row.display_name || '') as string,
    description: (row.description || row.description_text || '') as string,
    vote_count: (row.vote_count ?? row.votes ?? 0) as number,
  };
}

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendsDescriptions, setFriendsDescriptions] = useState<FriendDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Try RPC
    const { data } = await supabase.rpc('get_friends', { p_user_id: userId });
    if (data && Array.isArray(data) && data.length > 0) {
      const normalized = data.map((r: Record<string, unknown>) => normalizeFriend(r));
      if (normalized.some((f) => f.username)) {
        setFriends(normalized);
        setLoading(false);
        return;
      }
    }

    // Fallback: query friendships + profiles directly
    const { data: sent } = await supabase
      .from('friendships')
      .select('addressee_id, profiles!friendships_addressee_id_fkey(id, username, current_streak)')
      .eq('requester_id', userId)
      .eq('status', 'accepted');

    const { data: received } = await supabase
      .from('friendships')
      .select('requester_id, profiles!friendships_requester_id_fkey(id, username, current_streak)')
      .eq('addressee_id', userId)
      .eq('status', 'accepted');

    const friendsList: FriendProfile[] = [];
    if (sent) {
      for (const row of sent) {
        const p = (row as Record<string, unknown>).profiles as Record<string, unknown> | undefined;
        if (p) friendsList.push({ id: p.id as string, username: (p.username || '') as string, current_streak: (p.current_streak ?? 0) as number });
      }
    }
    if (received) {
      for (const row of received) {
        const p = (row as Record<string, unknown>).profiles as Record<string, unknown> | undefined;
        if (p) friendsList.push({ id: p.id as string, username: (p.username || '') as string, current_streak: (p.current_streak ?? 0) as number });
      }
    }
    setFriends(friendsList);
    setLoading(false);
  }, [userId]);

  const fetchFriendsDescriptions = useCallback(async (wordId: string) => {
    if (!userId) return;

    // Try RPC
    const { data } = await supabase.rpc('get_friends_descriptions', {
      p_user_id: userId,
      p_word_id: wordId,
    });
    if (data && Array.isArray(data) && data.length > 0) {
      const normalized = data.map((r: Record<string, unknown>) => normalizeFriendDesc(r));
      if (normalized.some((d) => d.description)) {
        setFriendsDescriptions(normalized);
        return;
      }
    }

    // Fallback: get friend IDs then query descriptions
    const friendIds = friends.map((f) => f.id);
    if (friendIds.length === 0) return;

    const { data: descs } = await supabase
      .from('descriptions')
      .select('user_id, description, vote_count, profiles!inner(username)')
      .eq('word_id', wordId)
      .in('user_id', friendIds);

    if (descs) {
      const mapped = descs.map((row: Record<string, unknown>) => {
        const profile = row.profiles as Record<string, unknown> | undefined;
        return {
          user_id: row.user_id as string,
          username: (profile?.username || '') as string,
          description: (row.description || '') as string,
          vote_count: (row.vote_count ?? 0) as number,
        };
      });
      setFriendsDescriptions(mapped);
    }
  }, [userId, friends]);

  return { friends, friendsDescriptions, loading, fetchFriends, fetchFriendsDescriptions };
}
