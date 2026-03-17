'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/blog/types';

export default function BlogDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'es'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:blog_authors(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching posts:', error);
    }
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting post:', error);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (langFilter !== 'all' && p.language !== langFilter) return false;
    return true;
  });

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  function FilterButton({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          active
            ? 'bg-[#FF6B4A] text-white'
            : 'bg-[#F5F0E8] text-[#8B8697] hover:bg-[#E8E3D9]'
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A2E]">
          Blog Manager
        </h1>
        <Link
          href="/admin/blog/new"
          className="bg-[#FF6B4A] text-white px-4 py-2 rounded-lg hover:bg-[#e55a3a] transition-colors"
        >
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Posts', count: totalPosts },
          { label: 'Published', count: publishedCount },
          { label: 'Drafts', count: draftCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#F5F0E8] rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#1A1A2E]">{stat.count}</p>
            <p className="text-sm text-[#8B8697]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={statusFilter === 'published'} onClick={() => setStatusFilter('published')}>
            Published
          </FilterButton>
          <FilterButton active={statusFilter === 'draft'} onClick={() => setStatusFilter('draft')}>
            Draft
          </FilterButton>
        </div>
        <div className="flex items-center gap-1">
          <FilterButton active={langFilter === 'all'} onClick={() => setLangFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={langFilter === 'en'} onClick={() => setLangFilter('en')}>
            EN
          </FilterButton>
          <FilterButton active={langFilter === 'es'} onClick={() => setLangFilter('es')}>
            ES
          </FilterButton>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-[#F5F0E8] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#8B8697] py-12">No posts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E3D9]">
                <th className="pb-3 text-sm font-medium text-[#8B8697]">Title</th>
                <th className="pb-3 text-sm font-medium text-[#8B8697]">Status</th>
                <th className="pb-3 text-sm font-medium text-[#8B8697]">Language</th>
                <th className="pb-3 text-sm font-medium text-[#8B8697]">Author</th>
                <th className="pb-3 text-sm font-medium text-[#8B8697]">Published</th>
                <th className="pb-3 text-sm font-medium text-[#8B8697]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[#E8E3D9] hover:bg-[#FFFDF7]"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/blog/edit/${post.id}`}
                      className="text-[#1A1A2E] font-medium hover:text-[#FF6B4A] transition-colors"
                    >
                      {post.title || 'Untitled'}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-[#F5F0E8] text-[#8B8697]'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#8B8697] uppercase">
                      {post.language}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-[#8B8697]">
                    {post.author?.name ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-sm text-[#8B8697]">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="text-sm text-[#FF6B4A] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Authors link */}
      <div className="mt-8 pt-6 border-t border-[#E8E3D9]">
        <Link
          href="/admin/blog/authors"
          className="text-[#FF6B4A] hover:underline text-sm"
        >
          Manage Authors
        </Link>
      </div>
    </div>
  );
}
