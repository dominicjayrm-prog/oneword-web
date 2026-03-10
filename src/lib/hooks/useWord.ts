'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyWord, Description } from '@/types';

function extractWord(data: unknown): DailyWord | null {
  if (!data) return null;
  // Handle array response (Supabase RPCs can return arrays)
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
  const supabase = createClient();

  useEffect(() => {
    async function fetchWord() {
      setLoading(true);
      setError(null);

      // Try the RPC first
      const { data, error: rpcError } = await supabase.rpc('get_today_word', { p_language: language });
      const extracted = extractWord(data);
      if (extracted) {
        setWord(extracted);
        setLoading(false);
        return;
      }

      // Fallback: query daily_words table directly
      const today = new Date().toISOString().split('T')[0];
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
        setError('No word available for today');
      }
      setLoading(false);
    }
    fetchWord();
  }, [language]);

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
      })
      .select()
      .single();
    if (error) {
      console.error('Supabase insert error:', error.code, error.message, error.details, error.hint);
      throw new Error(error.message);
    }
    setUserDescription(data);
    return data;
  }

  return { word, userDescription, loading, error, fetchUserDescription, submitDescription };
}
