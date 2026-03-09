'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export default function EmailCapture() {
  const locale = useLocale();
  const t = useTranslations('email_capture');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/subscriber-count')
      .then((r) => r.json())
      .then((data) => setSubscriberCount(data.count))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg(t('error_empty'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t('error_invalid'));
      return;
    }

    setStatus('loading');
    const supabase = createClient();

    const { error } = await supabase.from('email_subscribers').insert({
      email: email.toLowerCase().trim(),
      language: locale,
      source: 'website',
      referrer: typeof window !== 'undefined' ? document.referrer || null : null,
    });

    if (error) {
      if (error.code === '23505') {
        setStatus('success');
        setErrorMsg(t('already_subscribed'));
      } else {
        setStatus('error');
        setErrorMsg(t('error_generic'));
      }
    } else {
      setStatus('success');
      if (subscriberCount !== null) setSubscriberCount(subscriberCount + 1);
    }
  };

  const isSuccess = status === 'success';

  return (
    <section className="relative py-20 bg-bg">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[200px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-[520px] px-6 text-center">
        <span className="mb-4 block text-xs font-semibold uppercase tracking-[4px] text-primary">
          {t('label')}
        </span>

        <h2 className="font-serif text-3xl font-bold text-text md:text-4xl">
          {t('title')}
        </h2>

        <p className="mt-4 text-base leading-relaxed text-text-muted">
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
            placeholder={t('placeholder')}
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
              ? t('button_success')
              : status === 'loading'
                ? t('button_loading')
                : t('button')}
          </button>
        </form>

        {errorMsg && (
          <p className={`mt-3 text-sm font-medium ${isSuccess ? 'text-[#2ECC71]' : 'text-red-500'}`}>
            {errorMsg}
          </p>
        )}

        {isSuccess && !errorMsg && (
          <p className="mt-3 text-sm font-medium text-[#2ECC71]">
            {t('success_message')}
          </p>
        )}

        {subscriberCount !== null && (
          <p className="mt-5 text-sm text-text-muted">
            {subscriberCount === 0
              ? t('counter_zero')
              : t('counter', { count: subscriberCount })}
          </p>
        )}
      </div>
    </section>
  );
}
