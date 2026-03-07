'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyWord, Description } from '@/types';

export function useWord(language = 'en') {
  const [word, setWord] = useState<DailyWord | null>(null);
  const [userDescription, setUserDescription] = useState<Description | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchWord() {
      setLoading(true);
      const { data } = await supabase.rpc('get_today_word', { p_language: language });
      if (data) {
        setWord(data);
      }
      setLoading(false);
    }
    fetchWord();
  }, [language]);

  async function fetchUserDescription(userId: string) {
    if (!word) return;
    const { data } = await supabase
      .from('descriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', word.id)
      .single();
    if (data) {
      setUserDescription(data);
    }
  }

  async function submitDescription(userId: string, description: string) {
    if (!word) return null;
    const { data, error } = await supabase
      .from('descriptions')
      .insert({
        user_id: userId,
        word_id: word.id,
        description,
        language,
      })
      .select()
      .single();
    if (error) throw error;
    setUserDescription(data);
    return data;
  }

  return { word, userDescription, loading, fetchUserDescription, submitDescription };
}
