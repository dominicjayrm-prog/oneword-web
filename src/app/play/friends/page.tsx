'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWord } from '@/lib/hooks/useWord';
import { useFriends } from '@/lib/hooks/useFriends';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function FriendsPage() {
  const { user } = useAuth();
  const { word, userDescription, fetchUserDescription } = useWord();
  const { friends, friendsDescriptions, loading, fetchFriends, fetchFriendsDescriptions } =
    useFriends(user?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Array<{id: string; requester_id: string; username: string}>>([]);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchFriends();
      if (word) {
        fetchUserDescription(user.id);
        fetchFriendsDescriptions(word.id);
      }
      // Fetch pending requests
      fetchPending();
    }
  }, [user, word]);

  async function fetchPending() {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select('id, requester_id, profiles!friendships_requester_id_fkey(username)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending');
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
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    fetchFriends();
  }

  async function handleDecline(friendshipId: string) {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
  }

  async function handleAddFriend() {
    if (!user || !searchUsername.trim()) return;
    setSearchLoading(true);
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', searchUsername.trim())
      .single();
    if (targetUser) {
      await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: targetUser.id,
        status: 'pending',
      });
      setShowAddModal(false);
      setSearchUsername('');
    }
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
        <h1 className="font-serif text-2xl font-bold text-text">Friends</h1>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          Add Friend
        </Button>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Pending Requests
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
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDecline(req.id)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends' descriptions for today */}
      {word && userDescription && (friendsDescriptions as Array<{user_id: string; username: string; description: string}>).length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Today&apos;s Word: {word.word.toUpperCase()}
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {(friendsDescriptions as Array<{user_id: string; username: string; description: string}>).map((fd) => (
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
          Play today&apos;s word to see your friends&apos; descriptions!
        </p>
      )}

      {/* Friends list */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          Your Friends
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {(friends as Array<{id: string; username: string; current_streak: number}>).length > 0 ? (
            (friends as Array<{id: string; username: string; current_streak: number}>).map((friend) => (
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
              No friends yet. Add some to compete!
            </p>
          )}
        </div>
      </div>

      {/* Add friend modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-bg p-6">
            <h2 className="font-serif text-xl font-bold text-text">Add Friend</h2>
            <input
              type="text"
              placeholder="Enter username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-text outline-none focus:border-primary"
            />
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                onClick={handleAddFriend}
                disabled={searchLoading}
                className="flex-1"
              >
                {searchLoading ? 'Sending...' : 'Send Request'}
              </Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
