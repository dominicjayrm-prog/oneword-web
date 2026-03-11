'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useFriends } from '@/lib/hooks/useFriends';
import { createClient } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';
import { getCurrentBadge } from '@/lib/badges';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SearchResult {
  user_id: string;
  username: string;
  avatar_url: string | null;
  current_streak: number;
  is_friend: boolean;
  request_pending: boolean;
}

export default function FriendsPage() {
  const { user, profile } = useAuth();
  const locale = useLocale();
  const lang = profile?.language || locale;
  const t = useTranslations('friends_page');
  const { word, userDescription, fetchUserDescription } = useWord(lang);
  const { friends, friendsDescriptions, loading, fetchFriends, fetchFriendsDescriptions } =
    useFriends(user?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Array<{id: string; requester_id: string; username: string; avatar_url: string | null}>>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchFriends().then(() => {
        if (word) {
          fetchUserDescription(user.id);
          fetchFriendsDescriptions(word.id);
        }
      });
      fetchPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, word, fetchFriends, fetchFriendsDescriptions]);

  async function fetchPending() {
    if (!user) return;
    // Try RPC first
    const { data: rpcData } = await supabase.rpc('get_pending_requests', { p_user_id: user.id });
    if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      setPendingRequests(
        rpcData.map((d: Record<string, unknown>) => ({
          id: (d.friendship_id || d.id) as string,
          requester_id: d.requester_id as string,
          username: (d.requester_username || d.username) as string,
          avatar_url: (d.requester_avatar_url || d.avatar_url || null) as string | null,
        }))
      );
      return;
    }

    // Fallback: direct query
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester_id, profiles!friendships_requester_id_fkey(username, avatar_url)')
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
          avatar_url: (d.profiles as Record<string, string>)?.avatar_url || null,
        }))
      );
    }
  }

  async function handleAccept(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
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

  async function handleRemoveFriend(friendId: string) {
    if (!confirm(t('remove_confirm'))) return;
    if (!user) return;

    // Try both directions to find the friendship
    const { data: d1 } = await supabase
      .from('friendships')
      .select('id')
      .eq('requester_id', user.id)
      .eq('addressee_id', friendId)
      .eq('status', 'accepted')
      .maybeSingle();

    const friendship = d1 ?? (await supabase
      .from('friendships')
      .select('id')
      .eq('requester_id', friendId)
      .eq('addressee_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle()).data;

    if (friendship) {
      await supabase.from('friendships').delete().eq('id', friendship.id);
      fetchFriends();
    }
  }

  async function handleSearch() {
    if (!user || !searchQuery.trim()) return;
    if (!checkRateLimit('search')) return;
    setSearchLoading(true);
    setSearchError(null);

    // Try RPC
    const { data, error } = await supabase.rpc('search_users', {
      p_query: searchQuery.trim(),
      p_current_user: user.id,
      p_limit: 10,
      p_offset: 0,
    });

    if (data && Array.isArray(data) && data.length > 0) {
      setSearchResults(data as SearchResult[]);
    } else if (error) {
      // Fallback: direct query
      const { data: fallback } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, current_streak')
        .ilike('username', `%${searchQuery.trim()}%`)
        .neq('id', user.id)
        .limit(10);
      if (fallback) {
        setSearchResults(fallback.map((p: Record<string, unknown>) => ({
          user_id: p.id as string,
          username: p.username as string,
          avatar_url: (p.avatar_url || null) as string | null,
          current_streak: (p.current_streak ?? 0) as number,
          is_friend: friends.some((f) => f.id === p.id),
          request_pending: sentRequests.has(p.id as string),
        })));
      } else {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
    setSearchLoading(false);
  }

  async function handleSendRequest(targetUserId: string) {
    if (!user) return;
    if (!checkRateLimit('friend_request')) return;
    if (targetUserId === user.id) {
      setSearchError(t('cannot_add_self'));
      return;
    }

    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetUserId,
      status: 'pending',
    });
    if (error) {
      console.error('sendRequest error:', error.code, error.message);
      if (error.code === '23505') {
        setSearchError(t('already_friends'));
      } else {
        setSearchError(t('add_friend_error'));
      }
      return;
    }
    setSentRequests((prev) => new Set(prev).add(targetUserId));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state
  if (friends.length === 0 && pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-6xl">👥</span>
        <h2 className="mt-4 font-serif text-2xl font-bold text-text">{t('no_friends')}</h2>
        <Button variant="primary" className="mt-6" onClick={() => setShowAddModal(true)}>
          {t('add_friend')}
        </Button>

        {/* Add friend modal */}
        {showAddModal && renderAddModal()}
      </div>
    );
  }

  function renderAddModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-bg p-6">
          <h2 className="font-serif text-xl font-bold text-text">{t('add_friend_title')}</h2>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder={t('enter_username')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
            />
            <Button variant="primary" size="sm" onClick={handleSearch} disabled={searchLoading}>
              {t('search')}
            </Button>
          </div>
          {searchError && (
            <p className="mt-2 text-sm font-medium text-red-500">{searchError}</p>
          )}
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
              {searchResults.map((result) => {
                const badge = getCurrentBadge(result.current_streak);
                const isPending = result.request_pending || sentRequests.has(result.user_id);
                return (
                  <div key={result.user_id} className="flex items-center justify-between rounded-xl border border-border bg-white p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm">
                        {result.avatar_url || result.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text">@{result.username}</span>
                        {badge && <span className="ml-1 text-xs">{badge.emoji}</span>}
                      </div>
                    </div>
                    {result.is_friend ? (
                      <span className="text-xs text-text-muted">{t('already_friends_short')}</span>
                    ) : isPending ? (
                      <span className="text-xs text-text-muted">{t('pending')}</span>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleSendRequest(result.user_id)}>
                        {t('add')}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Button variant="ghost" className="mt-4 w-full" onClick={() => { setShowAddModal(false); setSearchResults([]); setSearchError(null); setSearchQuery(''); }}>
            {t('cancel')}
          </Button>
        </div>
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
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm">
                    {req.avatar_url || req.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="font-medium text-text">@{req.username}</span>
                </div>
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
          🔒 {t('play_to_see')}
        </p>
      )}

      {/* Friends list */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          {t('your_friends')}
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {friends.length > 0 ? (
            friends.map((friend) => {
              const badge = getCurrentBadge(friend.current_streak);
              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {friend.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-text">
                      @{friend.username} {badge?.emoji || ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {friend.current_streak > 0 && (
                      <span className="text-sm text-text-muted">
                        🔥 {friend.current_streak}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-xs text-text-muted/50 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-4 text-center text-text-muted">
              {t('no_friends')}
            </p>
          )}
        </div>
      </div>

      {/* Add friend modal */}
      {showAddModal && renderAddModal()}
    </div>
  );
}
