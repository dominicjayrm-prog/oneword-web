'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export function CTA() {
  const t = useTranslations('cta');
  const te = useTranslations('email_capture');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg(te('error_empty'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(te('error_invalid'));
      return;
    }

    setStatus('loading');
    const supabase = createClient();

    const { error } = await supabase.from('email_subscribers').insert({
      email: email.toLowerCase().trim(),
      language: locale,
      source: 'website_cta',
      referrer: typeof window !== 'undefined' ? document.referrer || null : null,
    });

    if (error) {
      if (error.code === '23505') {
        setStatus('success');
        setErrorMsg(te('already_subscribed'));
      } else {
        setStatus('error');
        setErrorMsg(te('error_generic'));
      }
    } else {
      setStatus('success');
    }
  };

  const isSuccess = status === 'success';

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-xl px-6 text-center"
      >
        <h2 className="font-serif text-4xl font-bold text-text md:text-6xl">
          {t('title')}
          <br />
          <span className="italic text-primary">{t('tagline')}</span>
        </h2>
        <p className="mt-6 text-lg text-text-muted">
          {t('subtitle')}
        </p>

        <form
          onSubmit={handleSubmit}
          className={`mt-8 flex flex-col gap-3 sm:flex-row${status === 'error' && errorMsg ? ' animate-shake' : ''}`}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={te('placeholder')}
            aria-label={te('placeholder')}
            disabled={isSuccess}
            className="h-[52px] flex-1 rounded-[14px] border border-border bg-white px-5 text-base text-text outline-none transition-colors placeholder:text-text-muted/50 focus:border-primary disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading' || isSuccess}
            className={`h-[52px] rounded-[14px] px-7 text-base font-bold text-white transition-all ${
              isSuccess
                ? 'bg-[#2ECC71] shadow-lg shadow-[#2ECC71]/20'
                : 'bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-70'
            }`}
          >
            {isSuccess
              ? te('button_success')
              : status === 'loading'
                ? te('button_loading')
                : te('button')}
          </button>
        </form>

        {errorMsg && (
          <p className={`mt-3 text-sm font-medium ${isSuccess ? 'text-[#2ECC71]' : 'text-red-500'}`}>
            {errorMsg}
          </p>
        )}

        {isSuccess && !errorMsg && (
          <p className="mt-3 text-sm font-medium text-[#2ECC71]">
            {te('success_message')}
          </p>
        )}
      </motion.div>
    </section>
  );
}
