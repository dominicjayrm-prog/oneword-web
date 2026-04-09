'use client';

import { useState } from 'react';

export function FaqAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-primary/20 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium text-text hover:text-primary transition-colors"
        aria-expanded={open}
      >
        <span>{question}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed text-text-muted">
          {answer}
        </div>
      )}
    </div>
  );
}
