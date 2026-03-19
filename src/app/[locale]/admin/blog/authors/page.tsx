'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BlogAuthor } from '@/lib/blog/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface AuthorFormData {
  name: string;
  slug: string;
  bio_en: string;
  bio_es: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
  website_url: string;
}

const emptyForm: AuthorFormData = {
  name: '',
  slug: '',
  bio_en: '',
  bio_es: '',
  avatar_url: '',
  twitter_url: '',
  linkedin_url: '',
  instagram_url: '',
  website_url: '',
};

export default function AuthorsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AuthorFormData>(emptyForm);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function fetchAuthors() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('blog_authors')
      .select('*')
      .order('name');
    if (fetchError) {
      console.error('Error fetching authors:', fetchError);
    }
    setAuthors((data as BlogAuthor[]) ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAuthors(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugManual(false);
    setShowForm(true);
    setError('');
  }

  function openEdit(author: BlogAuthor) {
    setForm({
      name: author.name,
      slug: author.slug,
      bio_en: author.bio_en ?? '',
      bio_es: author.bio_es ?? '',
      avatar_url: author.avatar_url ?? '',
      twitter_url: author.twitter_url ?? '',
      linkedin_url: author.linkedin_url ?? '',
      instagram_url: author.instagram_url ?? '',
      website_url: author.website_url ?? '',
    });
    setEditingId(author.id);
    setSlugManual(true);
    setShowForm(true);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function updateForm(field: keyof AuthorFormData, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !slugManual) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setUploading(true);
    setError('');
    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(`avatars/${Date.now()}-${file.name}`, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const url = supabase.storage.from('blog-images').getPublicUrl(data.path).data.publicUrl;
    setForm((prev) => ({ ...prev, avatar_url: url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');

    const authorData = {
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      bio_en: form.bio_en || null,
      bio_es: form.bio_es || null,
      avatar_url: form.avatar_url || null,
      twitter_url: form.twitter_url || null,
      linkedin_url: form.linkedin_url || null,
      instagram_url: form.instagram_url || null,
      website_url: form.website_url || null,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from('blog_authors')
        .update(authorData)
        .eq('id', editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('blog_authors')
        .insert(authorData)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    await fetchAuthors();
    closeForm();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this author?')) return;
    const { error: deleteError } = await supabase
      .from('blog_authors')
      .delete()
      .eq('id', id);
    if (deleteError) {
      console.error('Error deleting author:', deleteError);
      return;
    }
    setAuthors((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Authors</h1>
          <p className="text-sm text-[#8B8697] mt-1">{authors.length} authors</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-[#FF6B4A] text-white px-5 py-2.5 rounded-xl hover:bg-[#e55a3a] transition-colors text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Author
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3D9]/50">
              <h2 className="text-lg font-bold text-[#1A1A2E]">
                {editingId ? 'Edit Author' : 'New Author'}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-[#8B8697] hover:bg-[#F5F0E8] hover:text-[#1A1A2E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-[#8B8697] mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Author name"
                  className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2.5 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] placeholder-[#B0ACBA]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-[#8B8697] mb-1.5">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    updateForm('slug', slugify(e.target.value));
                  }}
                  className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2.5 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E]"
                />
              </div>

              {/* Bilingual Bios */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8B8697] mb-1.5">Bio (English)</label>
                  <textarea
                    value={form.bio_en}
                    onChange={(e) => updateForm('bio_en', e.target.value)}
                    placeholder="Short author bio in English..."
                    rows={3}
                    className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2.5 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] resize-none placeholder-[#B0ACBA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8B8697] mb-1.5">Bio (Español)</label>
                  <textarea
                    value={form.bio_es}
                    onChange={(e) => updateForm('bio_es', e.target.value)}
                    placeholder="Biografía breve del autor en español..."
                    rows={3}
                    className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2.5 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] resize-none placeholder-[#B0ACBA]"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-[#8B8697] mb-1.5">Avatar</label>
                {form.avatar_url ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.avatar_url}
                      alt={form.name || 'Avatar'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#E8E3D9]"
                    />
                    <button
                      onClick={() => setForm((prev) => ({ ...prev, avatar_url: '' }))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-[#E8E3D9] rounded-xl cursor-pointer hover:border-[#FF6B4A] hover:bg-[#FFF0EC]/30 transition-all">
                    {uploading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E8E3D9] border-t-[#FF6B4A]" />
                    ) : (
                      <span className="text-sm text-[#8B8697]">Upload avatar</span>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#8B8697] uppercase tracking-wide">Social Links</p>
                {(
                  [
                    { key: 'twitter_url' as const, label: 'Twitter', placeholder: 'https://twitter.com/...' },
                    { key: 'linkedin_url' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                    { key: 'instagram_url' as const, label: 'Instagram', placeholder: 'https://instagram.com/...' },
                    { key: 'website_url' as const, label: 'Website', placeholder: 'https://...' },
                  ] as const
                ).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-[#8B8697] mb-1">{label}</label>
                    <input
                      type="url"
                      value={form[key]}
                      onChange={(e) => updateForm(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] placeholder-[#B0ACBA]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E3D9]/50 bg-[#F8F6F1]/50 rounded-b-2xl">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-[#8B8697] hover:text-[#1A1A2E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-6 py-2 rounded-xl bg-[#FF6B4A] text-white text-sm font-medium hover:bg-[#e55a3a] disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : editingId ? 'Update Author' : 'Create Author'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-[#E8E3D9] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-[#8B8697] text-sm mb-2">No authors yet</p>
          <button onClick={openNew} className="text-[#FF6B4A] text-sm hover:underline">
            Create your first author
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-5 hover:shadow-md hover:border-[#FF6B4A]/20 transition-all group"
            >
              <div className="flex items-start gap-4">
                {author.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#E8E3D9] flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B4A] to-[#FF8F73] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A2E]">{author.name}</p>
                  <p className="text-xs text-[#8B8697] mt-0.5">/{author.slug}</p>
                  {author.bio_en && (
                    <p className="text-sm text-[#8B8697] mt-2 line-clamp-2">{author.bio_en}</p>
                  )}
                  {/* Social icons */}
                  <div className="flex items-center gap-2 mt-3">
                    {author.twitter_url && (
                      <span className="w-6 h-6 rounded bg-[#F5F0E8] flex items-center justify-center text-[#8B8697] text-xs">X</span>
                    )}
                    {author.linkedin_url && (
                      <span className="w-6 h-6 rounded bg-[#F5F0E8] flex items-center justify-center text-[#8B8697] text-xs">in</span>
                    )}
                    {author.instagram_url && (
                      <span className="w-6 h-6 rounded bg-[#F5F0E8] flex items-center justify-center text-[#8B8697] text-xs">ig</span>
                    )}
                    {author.website_url && (
                      <span className="w-6 h-6 rounded bg-[#F5F0E8] flex items-center justify-center text-[#8B8697] text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(author)}
                    className="p-1.5 rounded-lg text-[#8B8697] hover:bg-[#F5F0E8] hover:text-[#FF6B4A] transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(author.id)}
                    className="p-1.5 rounded-lg text-[#8B8697] hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
