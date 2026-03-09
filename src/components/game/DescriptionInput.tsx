'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface DescriptionInputProps {
  onSubmit: (description: string) => Promise<void>;
}

export function DescriptionInput({ onSubmit }: DescriptionInputProps) {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const t = useTranslations('game');

  const words = input.trim().split(/\s+/).filter(Boolean);
  const wordCount = input.trim() === '' ? 0 : words.length;

  async function handleSubmit() {
    if (wordCount !== 5) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(words.join(' '));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Submit failed:', err);
      setErrorMsg(message || t('submit_error'));
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex min-h-[48px] flex-wrap justify-center gap-2">
        <AnimatePresence>
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="rounded-full border-2 border-primary bg-primary-light px-4 py-1.5 text-sm font-medium text-primary"
            >
              {word}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('placeholder')}
        rows={2}
        className="w-full resize-none rounded-2xl border border-border bg-white px-5 py-4 text-center text-lg text-text outline-none focus:border-primary"
      />

      <p
        className={`mt-2 text-center font-mono text-sm ${
          wordCount === 5 ? 'text-primary' : 'text-text-muted'
        }`}
      >
        {t('word_count', { count: wordCount })} {wordCount === 5 ? '\u2713' : ''}
      </p>

      <div className="mt-4 flex justify-center">
        <Button
          variant="primary"
          size="lg"
          disabled={wordCount !== 5 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? t('locking_in') : t('lock_it_in')}
        </Button>
      </div>

      {errorMsg && (
        <p className="mt-3 text-center text-sm font-medium text-red-500">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
