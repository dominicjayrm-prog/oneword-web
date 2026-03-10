'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { AvatarPicker } from '@/components/game/AvatarPicker';
import { BadgePill } from '@/components/game/BadgePill';
import { BadgeProgress } from '@/components/game/BadgeProgress';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from '@/i18n/navigation';
import { checkRateLimit } from '@/lib/rateLimit';

export default function ProfilePage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const locale = useLocale();
  const t = useTranslations('profile');
  const [language, setLanguage] = useState(profile?.language || 'en');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUsername, setDeleteUsername] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.language) setLanguage(profile.language);
  }, [profile?.language]);

  const router = useRouter();
  const supabase = createClient();

  // Listen for PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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

  async function handleAvatarChange(emoji: string) {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_url: emoji }).eq('id', user.id);
    await refreshProfile();
  }

  async function handleLogout() {
    if (!confirm(t('logout_confirm'))) return;
    await signOut();
    router.push('/');
  }

  async function handleDeleteAccount() {
    if (!user || !profile) return;
    if (deleteUsername !== profile.username) return;
    setDeleting(true);
    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      console.error('delete_own_account error:', error.code, error.message);
      alert(t('delete_error'));
      setDeleting(false);
      return;
    }
    await signOut();
    router.push('/');
  }

  async function handlePasswordResetRequest() {
    if (!resetEmail.trim()) return;
    if (!checkRateLimit('password_reset')) return;
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/${locale}/play/profile`,
    });
    if (error) {
      console.error('resetPassword error:', error.message);
      return;
    }
    setResetSent(true);
  }

  async function handlePasswordUpdate() {
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError(t('password_too_short'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwords_mismatch'));
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordRecovery(false);
    setNewPassword('');
    setConfirmPassword('');
  }

  const stats = [
    { label: t('current_streak'), value: profile.current_streak, emoji: '🔥' },
    { label: t('best_streak'), value: profile.longest_streak, emoji: '⭐' },
    { label: t('total_plays'), value: profile.total_plays, emoji: '🎮' },
    { label: t('votes_received'), value: profile.total_votes_received, emoji: '👍' },
    { label: t('best_rank'), value: profile.best_rank ?? '-', emoji: '🏆' },
  ];

  return (
    <div>
      {/* Password recovery modal */}
      {passwordRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-bg p-6">
            <h2 className="font-serif text-xl font-bold text-text">{t('set_new_password')}</h2>
            <input
              type="password"
              placeholder={t('new_password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
            />
            <input
              type="password"
              placeholder={t('confirm_password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
            />
            {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
            <Button variant="primary" className="mt-4 w-full" onClick={handlePasswordUpdate}>
              {t('update_password')}
            </Button>
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col items-center text-center">
        <AvatarPicker
          currentAvatar={profile.avatar_url}
          onSelect={handleAvatarChange}
        />
        <h1 className="mt-4 font-serif text-2xl font-bold text-text">@{profile.username}</h1>
        <BadgePill streak={profile.current_streak} locale={locale} />
        <p className="mt-1 text-sm text-text-muted">
          {t('member_since', { date: new Date(profile.created_at).toLocaleDateString() })}
        </p>
      </div>

      {/* Badge progress */}
      <div className="mt-6">
        <BadgeProgress streak={profile.current_streak} locale={locale} />
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
        <div className="mt-2 flex gap-2">
          {[
            { code: 'en', label: '🇬🇧 English' },
            { code: 'es', label: '🇪🇸 Español' },
          ].map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-all cursor-pointer ${
                language === code
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border bg-white text-text-muted hover:border-primary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Password reset */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          {t('security')}
        </h2>
        {!showPasswordReset ? (
          <button
            onClick={() => setShowPasswordReset(true)}
            className="mt-2 text-sm text-primary hover:underline cursor-pointer"
          >
            {t('reset_password')}
          </button>
        ) : !resetSent ? (
          <div className="mt-2 flex gap-2">
            <input
              type="email"
              placeholder={t('enter_email')}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-white px-4 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <Button variant="primary" size="sm" onClick={handlePasswordResetRequest}>
              {t('send_reset')}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-green-600">{t('reset_sent')}</p>
        )}
      </div>

      {/* Support */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          {t('support')}
        </h2>
        <div className="mt-2 flex flex-col gap-1 text-sm text-text-muted">
          <p>support@playoneword.app</p>
          <p>playoneword.app</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <Button variant="outline" onClick={handleLogout}>
          {t('log_out')}
        </Button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-text-muted hover:text-red-500 transition-colors cursor-pointer"
          >
            {t('delete_account')}
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">{t('delete_confirm')}</p>
            <p className="mt-2 text-xs text-red-500">{t('type_username', { username: profile.username })}</p>
            <input
              type="text"
              placeholder={profile.username}
              value={deleteUsername}
              onChange={(e) => setDeleteUsername(e.target.value)}
              className="mt-2 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-text outline-none focus:border-red-400"
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteUsername !== profile.username}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleting ? t('deleting') : t('confirm_delete')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteUsername(''); }}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
