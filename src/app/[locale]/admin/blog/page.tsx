'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/blog/types';

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*, author:blog_authors(*)')
        .order('created_at', { ascending: false });
      setPosts((data as BlogPost[]) ?? []);
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const recentPosts = posts.slice(0, 5);

  const stats = [
    {
      label: 'Total Posts',
      value: totalPosts,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Published',
      value: publishedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Drafts',
      value: draftCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Dashboard</h1>
          <p className="text-sm text-[#8B8697] mt-1">Welcome back! Here&apos;s an overview of your blog.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-[#FF6B4A] text-white px-5 py-2.5 rounded-xl hover:bg-[#e55a3a] transition-colors text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-[#E8E3D9]/50 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#1A1A2E]">{stat.value}</p>
                  <p className="text-sm text-[#8B8697] mt-1">{stat.label}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/blog/posts"
          className="bg-white rounded-xl p-5 border border-[#E8E3D9]/50 shadow-sm hover:shadow-md hover:border-[#FF6B4A]/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FFF0EC] flex items-center justify-center text-[#FF6B4A] group-hover:bg-[#FF6B4A] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1A1A2E] text-sm">Manage Posts</p>
              <p className="text-xs text-[#8B8697]">View, edit, and delete blog posts</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/blog/authors"
          className="bg-white rounded-xl p-5 border border-[#E8E3D9]/50 shadow-sm hover:shadow-md hover:border-[#FF6B4A]/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FFF0EC] flex items-center justify-center text-[#FF6B4A] group-hover:bg-[#FF6B4A] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1A1A2E] text-sm">Manage Authors</p>
              <p className="text-xs text-[#8B8697]">Add and edit blog authors</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E3D9]/50 flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1A2E] text-sm">Recent Posts</h2>
          <Link href="/admin/blog/posts" className="text-xs text-[#FF6B4A] hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-[#F8F6F1] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-[#E8E3D9] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-[#8B8697] text-sm">No posts yet</p>
            <Link href="/admin/blog/new" className="text-[#FF6B4A] text-sm hover:underline mt-1 inline-block">
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E3D9]/50">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/blog/edit/${post.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8F6F1] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                      post.status === 'published' ? 'bg-green-500' : 'bg-amber-400'
                    }`}
                  />
                  <p className="text-sm text-[#1A1A2E] font-medium truncate">
                    {post.title || 'Untitled'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs text-[#8B8697] uppercase">{post.language}</span>
                  <span className="text-xs text-[#8B8697]">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
