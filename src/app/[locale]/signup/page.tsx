'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState(locale === 'es' ? 'es' : 'en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, language },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      setError(t('signup_check_email'));
      setLoading(false);
      return;
    }

    if (data.user) {
      await new Promise((r) => setTimeout(r, 500));
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          language,
        });
      }
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

        <h1 className="text-center font-serif text-2xl font-bold text-text">{t('signup_title')}</h1>
        <p className="mt-2 text-center text-sm text-text-muted">
          {t('signup_subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-primary-light px-4 py-3 text-sm text-primary">
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder={t('signup_username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <input
            type="email"
            placeholder={t('signup_email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder={t('signup_password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          >
            <option value="en">&#127468;&#127463; {t('language_en')}</option>
            <option value="es">&#127466;&#127480; {t('language_es')}</option>
          </select>
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? t('signup_loading') : t('signup_button')}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          {t('signup_terms')}{' '}
          <Link href="/terms" className="text-primary hover:underline">{t('signup_terms_link')}</Link>{' '}
          {t('signup_and')}{' '}
          <Link href="/privacy" className="text-primary hover:underline">{t('signup_privacy_link')}</Link>.
        </p>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('signup_has_account')}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('signup_login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
