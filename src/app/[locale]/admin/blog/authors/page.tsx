'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
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
  bio: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
  website_url: string;
}

const emptyForm: AuthorFormData = {
  name: '',
  slug: '',
  bio: '',
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

  useEffect(() => {
    fetchAuthors();
  }, []);

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
      bio: author.bio ?? '',
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
      bio: form.bio || null,
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1A1A2E]">Authors</h1>
          <Link
            href="/admin/blog"
            className="text-sm text-[#8B8697] hover:text-[#FF6B4A] transition-colors"
          >
            Back to Blog Manager
          </Link>
        </div>
        <button
          onClick={openNew}
          className="bg-[#FF6B4A] text-white px-4 py-2 rounded-lg hover:bg-[#e55a3a] transition-colors text-sm"
        >
          Add Author
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-[#1A1A2E]">
                {editingId ? 'Edit Author' : 'New Author'}
              </h2>
              <button
                onClick={closeForm}
                className="text-[#8B8697] hover:text-[#1A1A2E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs text-[#8B8697] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Author name"
                  className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs text-[#8B8697] mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    updateForm('slug', slugify(e.target.value));
                  }}
                  className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs text-[#8B8697] mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  placeholder="Short author bio..."
                  rows={3}
                  className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none"
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs text-[#8B8697] mb-1">Avatar</label>
                {form.avatar_url ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={form.avatar_url}
                      alt={form.name || 'Avatar'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <button
                      onClick={() => setForm((prev) => ({ ...prev, avatar_url: '' }))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-[#E8E3D9] rounded-lg cursor-pointer hover:border-[#FF6B4A] transition-colors">
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

              {/* Social links */}
              <div className="space-y-3">
                <p className="text-xs text-[#8B8697] font-medium">Social Links</p>
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
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E8E3D9]">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-[#8B8697] hover:text-[#1A1A2E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-6 py-2 rounded-lg bg-[#FF6B4A] text-white text-sm font-medium hover:bg-[#e55a3a] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Update Author' : 'Create Author'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authors list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[#F5F0E8] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : authors.length === 0 ? (
        <p className="text-center text-[#8B8697] py-12">
          No authors yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {authors.map((author) => (
            <div
              key={author.id}
              className="flex items-center justify-between border border-[#E8E3D9] rounded-lg p-4 hover:bg-[#FFFDF7] transition-colors"
            >
              <div className="flex items-center gap-4">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#8B8697] font-medium">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-[#1A1A2E]">{author.name}</p>
                  <p className="text-xs text-[#8B8697]">{author.slug}</p>
                  {author.bio && (
                    <p className="text-sm text-[#8B8697] mt-0.5 line-clamp-1 max-w-md">
                      {author.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEdit(author)}
                  className="text-sm text-[#FF6B4A] hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(author.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
