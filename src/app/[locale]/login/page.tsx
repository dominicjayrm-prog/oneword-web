'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // Prevent double-submit
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      router.push('/play');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 block text-center font-serif text-3xl font-bold">
          <span className="text-text">one</span>
          <span className="text-primary">word</span>
        </Link>

        <h1 className="text-center font-serif text-2xl font-bold text-text">{t('login_title')}</h1>
        <p className="mt-2 text-center text-sm text-text-muted">
          {t('login_subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-primary-light px-4 py-3 text-sm text-primary">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder={t('login_email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder={t('login_password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? t('login_loading') : t('login_button')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('login_no_account')}{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {t('login_signup_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
