'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/blog/types';

export default function PostsListPage() {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'es'>('all');
  const [search, setSearch] = useState('');

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
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function FilterPill({
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
        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
          active
            ? 'bg-[#1A1A2E] text-white shadow-sm'
            : 'bg-white text-[#8B8697] hover:bg-[#E8E3D9]/50 border border-[#E8E3D9]/50'
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Posts</h1>
          <p className="text-sm text-[#8B8697] mt-1">{posts.length} total posts</p>
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8697]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E8E3D9] rounded-lg focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] placeholder-[#8B8697]"
            />
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</FilterPill>
            <FilterPill active={statusFilter === 'published'} onClick={() => setStatusFilter('published')}>Published</FilterPill>
            <FilterPill active={statusFilter === 'draft'} onClick={() => setStatusFilter('draft')}>Draft</FilterPill>
          </div>
          {/* Language filter */}
          <div className="flex items-center gap-1.5">
            <FilterPill active={langFilter === 'all'} onClick={() => setLangFilter('all')}>All</FilterPill>
            <FilterPill active={langFilter === 'en'} onClick={() => setLangFilter('en')}>EN</FilterPill>
            <FilterPill active={langFilter === 'es'} onClick={() => setLangFilter('es')}>ES</FilterPill>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-[#F8F6F1] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-[#E8E3D9] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-[#8B8697] text-sm">No posts found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E3D9]/50 bg-[#F8F6F1]">
                <th className="px-5 py-3 text-xs font-medium text-[#8B8697] uppercase tracking-wide">Title</th>
                <th className="px-5 py-3 text-xs font-medium text-[#8B8697] uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-[#8B8697] uppercase tracking-wide">Lang</th>
                <th className="px-5 py-3 text-xs font-medium text-[#8B8697] uppercase tracking-wide">Author</th>
                <th className="px-5 py-3 text-xs font-medium text-[#8B8697] uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-xs font-medium text-[#8B8697] uppercase tracking-wide w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/50">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-[#F8F6F1]/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/blog/edit/${post.id}`}
                      className="text-sm text-[#1A1A2E] font-medium hover:text-[#FF6B4A] transition-colors"
                    >
                      {post.title || 'Untitled'}
                    </Link>
                    {post.excerpt && (
                      <p className="text-xs text-[#8B8697] mt-0.5 truncate max-w-md">
                        {post.excerpt}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                        post.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-green-500' : 'bg-amber-400'}`} />
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-[#8B8697] uppercase">
                      {post.language}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#8B8697]">
                    {post.author?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#8B8697]">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="p-1.5 rounded-lg text-[#8B8697] hover:bg-[#F5F0E8] hover:text-[#FF6B4A] transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg text-[#8B8697] hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
