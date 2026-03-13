'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useFavourites(userId: string | undefined) {
  const [favouritedIds, setFavouritedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchFavouritedIds = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('favourites')
      .select('description_id')
      .eq('user_id', userId);
    if (data) {
      setFavouritedIds(new Set(data.map((d) => d.description_id)));
    }
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchFavouritedIds();
  }, [fetchFavouritedIds]);

  const toggleFavourite = useCallback(
    async (descriptionId: string): Promise<boolean> => {
      if (!userId) return false;
      const wasFavourited = favouritedIds.has(descriptionId);

      // Optimistic update
      setFavouritedIds((prev) => {
        const next = new Set(prev);
        if (wasFavourited) {
          next.delete(descriptionId);
        } else {
          next.add(descriptionId);
        }
        return next;
      });

      // Try RPC first
      const { data, error } = await supabase.rpc('toggle_favourite', {
        p_user_id: userId,
        p_description_id: descriptionId,
      });

      if (error) {
        // Fallback: manual insert/delete
        if (wasFavourited) {
          const { error: delErr } = await supabase
            .from('favourites')
            .delete()
            .eq('user_id', userId)
            .eq('description_id', descriptionId);
          if (delErr) {
            // Revert optimistic update
            setFavouritedIds((prev) => new Set(prev).add(descriptionId));
            return wasFavourited;
          }
        } else {
          const { error: insErr } = await supabase
            .from('favourites')
            .insert({ user_id: userId, description_id: descriptionId });
          if (insErr) {
            // Revert optimistic update
            setFavouritedIds((prev) => {
              const next = new Set(prev);
              next.delete(descriptionId);
              return next;
            });
            return wasFavourited;
          }
        }
        return !wasFavourited;
      }

      // RPC returns boolean: true = now favourited, false = now unfavourited
      const isNowFavourited = typeof data === 'boolean' ? data : !wasFavourited;
      return isNowFavourited;
    },
    [userId, favouritedIds, supabase]
  );

  const isFavourited = useCallback(
    (descriptionId: string) => favouritedIds.has(descriptionId),
    [favouritedIds]
  );

  return { favouritedIds, loading, isFavourited, toggleFavourite, fetchFavouritedIds };
}

export interface FavouritePhrase {
  description_id: string;
  word: string;
  description: string;
  username: string;
  rank: number | null;
  vote_count: number;
  is_own: boolean;
  created_at: string;
}

export function useFavouritePhrases(userId: string | undefined) {
  const [phrases, setPhrases] = useState<FavouritePhrase[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchPhrases = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Try RPC first
    const { data, error } = await supabase.rpc('get_favourites', {
      p_user_id: userId,
    });

    if (data && Array.isArray(data) && data.length > 0) {
      setPhrases(
        data.map((d: Record<string, unknown>) => ({
          description_id: (d.description_id || d.id) as string,
          word: (d.word || '') as string,
          description: (d.description || '') as string,
          username: (d.username || d.author || '') as string,
          rank: (d.rank ?? null) as number | null,
          vote_count: (d.vote_count ?? d.votes ?? 0) as number,
          is_own: (d.is_own ?? false) as boolean,
          created_at: (d.created_at || '') as string,
        }))
      );
    } else if (error) {
      // Fallback: direct query with join
      const { data: fallback } = await supabase
        .from('favourites')
        .select(`
          description_id,
          created_at,
          descriptions!inner(
            id,
            description,
            vote_count,
            rank,
            user_id,
            word_id,
            daily_words!inner(word),
            profiles!inner(username)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fallback) {
        setPhrases(
          fallback.map((row: Record<string, unknown>) => {
            const desc = row.descriptions as Record<string, unknown>;
            const wordObj = desc?.daily_words as Record<string, unknown>;
            const profile = desc?.profiles as Record<string, unknown>;
            return {
              description_id: row.description_id as string,
              word: (wordObj?.word || '') as string,
              description: (desc?.description || '') as string,
              username: (profile?.username || '') as string,
              rank: (desc?.rank ?? null) as number | null,
              vote_count: (desc?.vote_count ?? 0) as number,
              is_own: desc?.user_id === userId,
              created_at: (row.created_at || '') as string,
            };
          })
        );
      }
    } else {
      setPhrases([]);
    }

    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases]);

  return { phrases, loading, fetchPhrases };
}
