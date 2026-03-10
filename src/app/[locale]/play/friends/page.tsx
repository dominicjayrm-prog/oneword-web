'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useFriends } from '@/lib/hooks/useFriends';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function FriendsPage() {
  const { user, profile } = useAuth();
  const locale = useLocale();
  const lang = profile?.language || locale;
  const t = useTranslations('friends_page');
  const { word, userDescription, fetchUserDescription } = useWord(lang);
  const { friends, friendsDescriptions, loading, fetchFriends, fetchFriendsDescriptions } =
    useFriends(user?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Array<{id: string; requester_id: string; username: string}>>([]);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      // Fetch friends first, then descriptions (fallback path needs friends list)
      fetchFriends().then(() => {
        if (word) {
          fetchUserDescription(user.id);
          fetchFriendsDescriptions(word.id);
        }
      });
      fetchPending();
    }
  }, [user, word]);

  async function fetchPending() {
    if (!user) return;
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester_id, profiles!friendships_requester_id_fkey(username)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending');
    if (error) {
      console.error('fetchPending error:', error.code, error.message);
      return;
    }
    if (data) {
      setPendingRequests(
        data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          requester_id: d.requester_id as string,
          username: (d.profiles as Record<string, string>)?.username || 'Unknown',
        }))
      );
    }
  }

  async function handleAccept(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    if (error) {
      console.error('handleAccept error:', error.code, error.message);
      return;
    }
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    fetchFriends();
  }

  async function handleDecline(friendshipId: string) {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) {
      console.error('handleDecline error:', error.code, error.message);
      return;
    }
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
  }

  async function handleAddFriend() {
    if (!user || !searchUsername.trim()) return;
    setSearchLoading(true);
    setSearchError(null);

    if (searchUsername.trim().toLowerCase() === profile?.username?.toLowerCase()) {
      setSearchError(t('cannot_add_self'));
      setSearchLoading(false);
      return;
    }

    const { data: targetUser, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', searchUsername.trim())
      .single();

    if (findError || !targetUser) {
      setSearchError(t('user_not_found'));
      setSearchLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetUser.id,
      status: 'pending',
    });

    if (insertError) {
      console.error('handleAddFriend insert error:', insertError.code, insertError.message);
      if (insertError.code === '23505') {
        setSearchError(t('already_friends'));
      } else {
        setSearchError(t('add_friend_error'));
      }
      setSearchLoading(false);
      return;
    }

    setShowAddModal(false);
    setSearchUsername('');
    setSearchLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-text">{t('title')}</h1>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          {t('add_friend')}
        </Button>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            {t('pending_requests')}
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
              >
                <span className="font-medium text-text">@{req.username}</span>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleAccept(req.id)}>
                    {t('accept')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDecline(req.id)}>
                    {t('decline')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends' descriptions for today */}
      {word && userDescription && friendsDescriptions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            {t('todays_word_label', { word: word.word?.toUpperCase() })}
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {friendsDescriptions.map((fd) => (
              <div
                key={fd.user_id}
                className="rounded-xl border border-border bg-white p-4"
              >
                <p className="text-sm font-medium text-text-muted">@{fd.username}</p>
                <p className="mt-1 font-serif text-lg italic text-text">
                  &ldquo;{fd.description}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {word && !userDescription && (
        <p className="mt-6 text-center text-text-muted">
          {t('play_to_see')}
        </p>
      )}

      {/* Friends list */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          {t('your_friends')}
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {friend.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="font-medium text-text">@{friend.username}</span>
                </div>
                {friend.current_streak > 0 && (
                  <span className="text-sm text-text-muted">
                    &#128293; {friend.current_streak}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-text-muted">
              {t('no_friends')}
            </p>
          )}
        </div>
      </div>

      {/* Add friend modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-bg p-6">
            <h2 className="font-serif text-xl font-bold text-text">{t('add_friend_title')}</h2>
            <input
              type="text"
              placeholder={t('enter_username')}
              value={searchUsername}
              onChange={(e) => { setSearchUsername(e.target.value); setSearchError(null); }}
              className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
            />
            {searchError && (
              <p className="mt-2 text-sm font-medium text-red-500">{searchError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                onClick={handleAddFriend}
                disabled={searchLoading}
                className="flex-1"
              >
                {searchLoading ? t('sending') : t('send_request')}
              </Button>
              <Button variant="ghost" onClick={() => { setShowAddModal(false); setSearchError(null); }}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
