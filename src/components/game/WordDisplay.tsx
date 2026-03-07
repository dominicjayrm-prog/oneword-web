'use client';

import { motion } from 'framer-motion';

interface WordDisplayProps {
  word: string;
  category?: string;
}

export function WordDisplay({ word, category }: WordDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
        today&apos;s word
      </span>
      <h1 className="mt-2 font-serif text-6xl font-black tracking-tight text-text md:text-7xl">
        {word?.toUpperCase() ?? ''}
      </h1>
      {category && (
        <span className="mt-2 inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted">
          {category}
        </span>
      )}
    </motion.div>
  );
}
