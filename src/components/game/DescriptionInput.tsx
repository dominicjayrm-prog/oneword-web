'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface DescriptionInputProps {
  onSubmit: (description: string) => Promise<void>;
}

export function DescriptionInput({ onSubmit }: DescriptionInputProps) {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const words = input.trim().split(/\s+/).filter(Boolean);
  const wordCount = input.trim() === '' ? 0 : words.length;

  async function handleSubmit() {
    if (wordCount !== 5) return;
    setSubmitting(true);
    await onSubmit(words.join(' '));
    setSubmitting(false);
  }

  return (
    <div className="mt-8">
      {/* Word pills */}
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

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your five words..."
        rows={2}
        className="w-full resize-none rounded-2xl border border-border bg-white px-5 py-4 text-center text-lg text-text outline-none focus:border-primary"
      />

      {/* Counter */}
      <p
        className={`mt-2 text-center font-mono text-sm ${
          wordCount === 5 ? 'text-primary' : 'text-text-muted'
        }`}
      >
        {wordCount}/5 words {wordCount === 5 ? '\u2713' : ''}
      </p>

      {/* Submit */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="primary"
          size="lg"
          disabled={wordCount !== 5 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Locking in...' : 'Lock it in'}
        </Button>
      </div>
    </div>
  );
}
