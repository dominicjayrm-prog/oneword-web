'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { AvatarPicker } from '@/components/game/AvatarPicker';
import { BadgePill } from '@/components/game/BadgePill';
import { BadgeProgress } from '@/components/game/BadgeProgress';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from '@/i18n/navigation';
import { checkRateLimit } from '@/lib/rateLimit';
import { FavouritePhrases } from '@/components/game/FavouritePhrases';

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showFavourites, setShowFavourites] = useState(false);
  const tFav = useTranslations('favourites');

  useEffect(() => {
    if (profile?.language) setLanguage(profile.language); // eslint-disable-line react-hooks/set-state-in-effect
  }, [profile?.language]);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const passwordTrapRef = useFocusTrap<HTMLDivElement>(passwordRecovery);

  const dismissPasswordRecovery = useCallback(() => {
    setPasswordRecovery(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  }, []);

  // Listen for PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Escape key for password recovery modal
  useEffect(() => {
    if (!passwordRecovery) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismissPasswordRecovery();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [passwordRecovery, dismissPasswordRecovery]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showFavourites && user) {
    return <FavouritePhrases userId={user.id} onBack={() => setShowFavourites(false)} />;
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
      setDeleteError(t('delete_error'));
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
    if (newPassword.trim().length < 6) {
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
        <div
          ref={passwordTrapRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={(e) => { if (e.target === e.currentTarget) dismissPasswordRecovery(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-recovery-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-bg p-6">
            <div className="flex items-center justify-between">
              <h2 id="password-recovery-title" className="font-serif text-xl font-bold text-text">{t('set_new_password')}</h2>
              <button
                onClick={dismissPasswordRecovery}
                className="text-text-muted hover:text-text transition-colors cursor-pointer text-xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
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

      {/* Favourite Phrases */}
      <button
        onClick={() => setShowFavourites(true)}
        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-border bg-white p-4 transition-colors hover:border-primary/50 cursor-pointer"
      >
        <span className="text-sm font-semibold text-text">
          <span className="text-primary">&hearts;</span> {tFav('title')}
        </span>
        <span className="text-text-muted">&rsaquo;</span>
      </button>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-border bg-white p-4"
          >
            <span className="text-2xl" aria-hidden="true">{stat.emoji}</span>
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
        {!showLogoutConfirm ? (
          <Button variant="outline" onClick={() => setShowLogoutConfirm(true)}>
            {t('log_out')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={handleLogout}>
              {t('logout_confirm_yes')}
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
              {t('cancel')}
            </Button>
          </div>
        )}

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
            {deleteError && (
              <p className="mt-2 text-sm font-medium text-red-500">{deleteError}</p>
            )}
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
              <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteUsername(''); setDeleteError(null); }}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
