'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { getTranslations } from '@/lib/i18n';

function detectLanguage(): 'en' | 'es' {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = getTranslations(language);

  // Auto-detect browser language on mount
  useEffect(() => {
    setLanguage(detectLanguage());
  }, []);

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

    // If email confirmation is required, user won't have a session yet
    if (data.user && !data.session) {
      setError(t.checkEmail);
      setLoading(false);
      return;
    }

    if (data.user) {
      // handle_new_user trigger auto-creates the profile from auth metadata.
      // Wait briefly then verify the profile exists (fallback if trigger is slow).
      await new Promise((r) => setTimeout(r, 500));
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      if (!profile) {
        // Fallback: manually create profile if trigger didn't fire
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

        <h1 className="text-center font-serif text-2xl font-bold text-text">{t.createAccount}</h1>
        <p className="mt-2 text-center text-sm text-text-muted">
          {t.joinPlayers}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-primary-light px-4 py-3 text-sm text-primary">
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder={t.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder={t.passwordPlaceholder}
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
            <option value="en">&#127468;&#127463; English</option>
            <option value="es">&#127466;&#127480; Espa&ntilde;ol</option>
          </select>
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? t.creatingAccount : t.signUp}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t.alreadyHaveAccount}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
