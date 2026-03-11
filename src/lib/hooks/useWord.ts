'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getGameDate, hasWordRolledOver } from '@/lib/gameDate';
import type { DailyWord, Description } from '@/types';

function extractWord(data: unknown): DailyWord | null {
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (row && typeof row === 'object' && 'id' in row && 'word' in row) {
    return row as DailyWord;
  }
  return null;
}

export function useWord(language = 'en') {
  const [word, setWord] = useState<DailyWord | null>(null);
  const [userDescription, setUserDescription] = useState<Description | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gameDateRef = useRef(getGameDate());
  const supabase = useMemo(() => createClient(), []);

  const fetchWord = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('get_today_word', { p_language: language });
    const extracted = extractWord(data);
    if (extracted) {
      setWord(extracted);
      setLoading(false);
      gameDateRef.current = getGameDate();
      return;
    }

    const today = getGameDate();
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('daily_words')
      .select('*')
      .eq('date', today)
      .eq('language', language)
      .single();

    const fallbackWord = extractWord(fallbackData);
    if (fallbackWord) {
      setWord(fallbackWord);
    } else {
      console.error('Failed to fetch today\'s word:', rpcError, fallbackError);
      setError('no_word_available');
    }
    gameDateRef.current = getGameDate();
    setLoading(false);
  }, [language]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  // Auto-refresh on rollover: poll every 60s + visibility change
  useEffect(() => {
    function checkRollover() {
      if (hasWordRolledOver(gameDateRef.current)) {
        setUserDescription(null);
        fetchWord();
      }
    }

    const interval = setInterval(checkRollover, 60_000);
    function handleVisibility() {
      if (document.visibilityState === 'visible') checkRollover();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchWord]);

  async function fetchUserDescription(userId: string) {
    if (!word) return;
    const { data, error } = await supabase
      .from('descriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', word.id)
      .single();
    if (error) {
      console.error('fetchUserDescription error:', error.code, error.message);
    }
    if (data) {
      setUserDescription(data);
    } else {
      setUserDescription(null);
    }
  }

  async function submitDescription(userId: string, description: string): Promise<{ oldStreak: number } | null> {
    if (!word) return null;

    // Get current streak BEFORE insert to avoid race condition with triggers
    const { data: profileData } = await supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', userId)
      .single();
    const oldStreak = profileData?.current_streak ?? 0;

    const { data, error } = await supabase
      .from('descriptions')
      .insert({
        user_id: userId,
        word_id: word.id,
        description,
      })
      .select()
      .single();
    if (error) {
      console.error('Supabase insert error:', error.code, error.message, error.details, error.hint);
      throw new Error(error.message);
    }
    setUserDescription(data);

    // Call update_streak RPC
    const { error: streakError } = await supabase.rpc('update_streak', { p_user_id: userId });
    if (streakError) {
      console.error('update_streak error:', streakError.code, streakError.message);
    }

    return { oldStreak };
  }

  return { word, userDescription, loading, error, fetchUserDescription, submitDescription, refetch: fetchWord };
}
