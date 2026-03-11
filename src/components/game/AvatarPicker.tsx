'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const AVATAR_OPTIONS = ['🎭', '🦊', '🐙', '🌟', '🎨', '🔥', '💎', '🌙', '🦄', '🍕', '🎯', '🧊', '🪐', '🎸', '🌊', '🦅'];

interface AvatarPickerProps {
  currentAvatar: string | null;
  onSelect: (emoji: string) => void;
}

export function AvatarPicker({ currentAvatar, onSelect }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('profile');

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl transition-transform hover:scale-105 cursor-pointer"
        aria-label={t('change_avatar')}
      >
        <span aria-hidden="true">{currentAvatar || '🎭'}</span>
      </button>
      <button
        onClick={() => setOpen(!open)}
        className="mt-1 text-xs text-primary cursor-pointer hover:underline"
      >
        {t('change_avatar')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div
              className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-8"
              role="group"
              aria-label={t('change_avatar')}
            >
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onSelect(emoji); setOpen(false); }}
                  aria-label={emoji}
                  aria-pressed={currentAvatar === emoji}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all cursor-pointer hover:bg-surface',
                    currentAvatar === emoji && 'ring-2 ring-primary bg-primary-light'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
