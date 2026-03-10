'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from '@/i18n/navigation';

export default function ProfilePage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const locale = useLocale();
  const t = useTranslations('profile');
  const [language, setLanguage] = useState(profile?.language || 'en');
  const [deleting, setDeleting] = useState(false);

  // Sync language state when profile loads (initial render may have null profile)
  useEffect(() => {
    if (profile?.language) setLanguage(profile.language);
  }, [profile?.language]);
  const router = useRouter();
  const supabase = createClient();

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  async function handleLanguageChange(newLang: string) {
    setLanguage(newLang);
    if (user) {
      await supabase.from('profiles').update({ language: newLang }).eq('id', user.id);
      await refreshProfile();
    }
  }

  async function handleLogout() {
    await signOut();
    router.push('/');
  }

  async function handleDeleteAccount() {
    if (!confirm(t('delete_confirm'))) return;
    if (!user) return;
    setDeleting(true);
    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      console.error('delete_own_account error:', error.code, error.message);
      alert(t('delete_error') || 'Failed to delete account. Please try again.');
      setDeleting(false);
      return;
    }
    await signOut();
    router.push('/');
  }

  const stats = [
    { label: t('current_streak'), value: profile.current_streak, emoji: '\uD83D\uDD25' },
    { label: t('best_streak'), value: profile.longest_streak, emoji: '\u2B50' },
    { label: t('total_plays'), value: profile.total_plays, emoji: '\uD83C\uDFAE' },
    { label: t('votes_received'), value: profile.total_votes_received, emoji: '\uD83D\uDDF3\uFE0F' },
    { label: t('best_rank'), value: profile.best_rank ?? '-', emoji: '\uD83C\uDFC6' },
  ];

  return (
    <div>
      {/* Profile header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
          {profile.username?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-text">@{profile.username}</h1>
        <p className="text-sm text-text-muted">
          {t('member_since', { date: new Date(profile.created_at).toLocaleDateString() })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-border bg-white p-4"
          >
            <span className="text-2xl">{stat.emoji}</span>
            <span className="mt-1 font-mono text-2xl font-bold text-text">{stat.value}</span>
            <span className="text-xs text-text-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Language switcher */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          {t('language')}
        </h2>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
        >
          <option value="en">&#127468;&#127463; English</option>
          <option value="es">&#127466;&#127480; Espa&ntilde;ol</option>
        </select>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <Button variant="outline" onClick={handleLogout}>
          {t('log_out')}
        </Button>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="text-sm text-text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          {deleting ? t('deleting') || 'Deleting...' : t('delete_account')}
        </button>
      </div>
    </div>
  );
}
