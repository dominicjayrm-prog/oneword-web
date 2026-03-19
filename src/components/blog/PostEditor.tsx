'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import type { BlogPost, BlogAuthor, ContentBlock } from '@/lib/blog/types';
import { contentBlocksToHtml, htmlToContentBlocks } from '@/lib/blog/content-utils';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-surface" />,
});

interface FaqItem {
  question: string;
  answer: string;
}

interface PostEditorProps {
  initialPost?: BlogPost;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function PostEditor({ initialPost }: PostEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const isEditing = !!initialPost;

  // Form state
  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!initialPost);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '');
  const [bannerUrl, setBannerUrl] = useState(initialPost?.banner_url ?? '');
  const [bannerAlt, setBannerAlt] = useState(initialPost?.banner_alt ?? '');
  const [contentHtml, setContentHtml] = useState(() => {
    if (initialPost?.content) {
      return contentBlocksToHtml(initialPost.content);
    }
    return '';
  });
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status ?? 'draft');
  const [language, setLanguage] = useState<'en' | 'es'>(initialPost?.language ?? 'en');
  const [authorId, setAuthorId] = useState(initialPost?.author_id ?? '');
  const [tags, setTags] = useState(initialPost?.tags?.join(', ') ?? '');
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description ?? '');
  const [readTime, setReadTime] = useState(initialPost?.read_time_minutes ?? 1);
  const [publishedAt, setPublishedAt] = useState(
    initialPost?.published_at ? initialPost.published_at.slice(0, 16) : ''
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() => {
    if (initialPost?.content) {
      const faqBlock = initialPost.content.find((b): b is Extract<ContentBlock, { type: 'faq' }> => b.type === 'faq');
      return faqBlock?.items ?? [];
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<'settings' | 'seo'>('settings');

  // Data
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch authors
  useEffect(() => {
    supabase
      .from('blog_authors')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setAuthors(data);
      });
  }, [supabase]);

  // Auto-slug
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title)); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [title, slugManual]);

  // Auto read-time from HTML content
  useEffect(() => {
    const text = contentHtml.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    setReadTime(Math.max(1, Math.round(words / 200))); // eslint-disable-line react-hooks/set-state-in-effect
  }, [contentHtml]);

  // Banner upload
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      .upload(`banners/${Date.now()}-${file.name}`, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const url = supabase.storage.from('blog-images').getPublicUrl(data.path).data.publicUrl;
    setBannerUrl(url);
    setUploading(false);
  }

  // Image upload for rich text editor
  const handleContentImageUpload = useCallback(
    async (file: File): Promise<string | null> => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB');
        return null;
      }
      setError('');
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(`content/${Date.now()}-${file.name}`, file);
      if (uploadError) {
        setError(uploadError.message);
        return null;
      }
      return supabase.storage.from('blog-images').getPublicUrl(data.path).data.publicUrl;
    },
    [supabase]
  );

  // Save
  const handleSave = useCallback(
    async (saveStatus: 'draft' | 'published') => {
      if (!title.trim()) {
        setError('Title is required');
        return;
      }
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const contentBlocks: ContentBlock[] = htmlToContentBlocks(contentHtml);
      const validFaqItems = faqItems.filter((item) => item.question.trim() && item.answer.trim());
      if (validFaqItems.length > 0) {
        contentBlocks.push({ type: 'faq', items: validFaqItems });
      }
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const postData = {
        title,
        slug,
        excerpt: excerpt || null,
        content: contentBlocks,
        banner_url: bannerUrl || null,
        banner_alt: bannerAlt || null,
        author_id: authorId || null,
        status: saveStatus,
        language,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        tags: parsedTags.length > 0 ? parsedTags : null,
        read_time_minutes: readTime,
        published_at:
          saveStatus === 'published'
            ? publishedAt
              ? new Date(publishedAt).toISOString()
              : new Date().toISOString()
            : publishedAt
              ? new Date(publishedAt).toISOString()
              : null,
      };

      let result;
      if (isEditing && initialPost) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', initialPost.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
      }

      if (result.error) {
        setError(result.error.message);
        setSaving(false);
        return;
      }

      setSuccessMsg(saveStatus === 'published' ? 'Post published!' : 'Draft saved!');
      setTimeout(() => {
        router.push('/admin/blog/posts');
      }, 800);
      setSaving(false);
    },
    [
      title, slug, excerpt, contentHtml, bannerUrl, bannerAlt, authorId,
      language, metaTitle, metaDescription, tags, readTime, publishedAt,
      faqItems, isEditing, initialPost, supabase, router,
    ]
  );

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/blog/posts')}
            className="p-2 rounded-lg text-[#8B8697] hover:bg-white hover:text-[#1A1A2E] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#1A1A2E]">
            {isEditing ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !title}
            className="px-5 py-2 rounded-xl border border-[#E8E3D9] text-[#1A1A2E] text-sm font-medium hover:bg-white disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving || !title}
            className="px-5 py-2 rounded-xl bg-[#FF6B4A] text-white text-sm font-medium hover:bg-[#e55a3a] disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main Content */}
        <div className="space-y-5">
          {/* Title */}
          <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full text-2xl font-bold text-[#1A1A2E] placeholder-[#D0CCC4] border-0 focus:outline-none bg-transparent"
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-[#8B8697]">
              <span>playoneword.app/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(slugify(e.target.value));
                }}
                className="flex-1 text-xs border border-[#E8E3D9] rounded-md px-2 py-1 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E]"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-5">
            <label className="block text-xs font-medium text-[#8B8697] uppercase tracking-wide mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for cards and SEO..."
              rows={2}
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] resize-none placeholder-[#B0ACBA]"
            />
          </div>

          {/* Banner */}
          <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-5">
            <label className="block text-xs font-medium text-[#8B8697] uppercase tracking-wide mb-2">
              Banner Image
            </label>
            {bannerUrl ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerUrl}
                  alt={bannerAlt || 'Banner preview'}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => {
                      setBannerUrl('');
                      setBannerAlt('');
                    }}
                    className="bg-white text-red-500 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#E8E3D9] rounded-xl cursor-pointer hover:border-[#FF6B4A] hover:bg-[#FFF0EC]/30 transition-all">
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8E3D9] border-t-[#FF6B4A]" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-[#C0BAD0] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#8B8697]">Click to upload banner (max 5MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>
            )}
            <div className="mt-3">
              <label className="block text-xs font-medium text-[#8B8697] mb-1">Alt Text</label>
              <input
                type="text"
                value={bannerAlt}
                onChange={(e) => setBannerAlt(e.target.value)}
                placeholder="Describe the banner image for accessibility..."
                className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] placeholder-[#B0ACBA]"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xs font-medium text-[#8B8697] uppercase tracking-wide mb-2">
              Content
            </label>
            <RichTextEditor
              content={contentHtml}
              onChange={setContentHtml}
              onImageUpload={handleContentImageUpload}
              placeholder="Start writing your blog post here... You can paste content, then highlight text to format it as headings, bold, lists, etc."
            />
          </div>

          {/* FAQ Block Editor */}
          <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-medium text-[#8B8697] uppercase tracking-wide">
                FAQ Block
              </label>
              <button
                type="button"
                onClick={() => setFaqItems((prev) => [...prev, { question: '', answer: '' }])}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FF6B4A] hover:text-[#e55a3a] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>

            {faqItems.length === 0 ? (
              <p className="text-sm text-[#B0ACBA] text-center py-4">
                No FAQ items yet. Click &quot;Add Question&quot; to start.
              </p>
            ) : (
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border border-[#E8E3D9] rounded-lg p-4 bg-[#F8F6F1]/50">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-[#8B8697] mt-1">Q{index + 1}</span>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFaqItems((prev) => {
                                const updated = [...prev];
                                [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
                                return updated;
                              });
                            }}
                            className="p-1 rounded text-[#8B8697] hover:bg-white hover:text-[#1A1A2E] transition-colors"
                            title="Move up"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                        )}
                        {index < faqItems.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFaqItems((prev) => {
                                const updated = [...prev];
                                [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                                return updated;
                              });
                            }}
                            className="p-1 rounded text-[#8B8697] hover:bg-white hover:text-[#1A1A2E] transition-colors"
                            title="Move down"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setFaqItems((prev) => prev.filter((_, i) => i !== index))}
                          className="p-1 rounded text-[#8B8697] hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) =>
                        setFaqItems((prev) =>
                          prev.map((faq, i) => (i === index ? { ...faq, question: e.target.value } : faq))
                        )
                      }
                      placeholder="Question"
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] placeholder-[#B0ACBA] mb-2"
                    />
                    <textarea
                      value={item.answer}
                      onChange={(e) =>
                        setFaqItems((prev) =>
                          prev.map((faq, i) => (i === index ? { ...faq, answer: e.target.value } : faq))
                        )
                      }
                      placeholder="Answer"
                      rows={2}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none placeholder-[#B0ACBA]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-[#E8E3D9]/50 shadow-sm overflow-hidden">
            <div className="flex border-b border-[#E8E3D9]/50">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wide transition-colors ${
                  activeTab === 'settings'
                    ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A] bg-[#FFF0EC]/30'
                    : 'text-[#8B8697] hover:text-[#1A1A2E]'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wide transition-colors ${
                  activeTab === 'seo'
                    ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A] bg-[#FFF0EC]/30'
                    : 'text-[#8B8697] hover:text-[#1A1A2E]'
                }`}
              >
                SEO
              </button>
            </div>

            <div className="p-4 space-y-4">
              {activeTab === 'settings' && (
                <>
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">Status</label>
                    <div className="flex gap-1 bg-[#F8F6F1] rounded-lg p-1">
                      <button
                        onClick={() => setStatus('draft')}
                        className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${
                          status === 'draft'
                            ? 'bg-white text-[#1A1A2E] shadow-sm'
                            : 'text-[#8B8697] hover:text-[#1A1A2E]'
                        }`}
                      >
                        Draft
                      </button>
                      <button
                        onClick={() => setStatus('published')}
                        className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${
                          status === 'published'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'text-[#8B8697] hover:text-[#1A1A2E]'
                        }`}
                      >
                        Published
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">Language</label>
                    <div className="flex gap-1 bg-[#F8F6F1] rounded-lg p-1">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${
                          language === 'en'
                            ? 'bg-[#FF6B4A] text-white shadow-sm'
                            : 'text-[#8B8697] hover:text-[#1A1A2E]'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('es')}
                        className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${
                          language === 'es'
                            ? 'bg-[#FF6B4A] text-white shadow-sm'
                            : 'text-[#8B8697] hover:text-[#1A1A2E]'
                        }`}
                      >
                        Spanish
                      </button>
                    </div>
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">Author</label>
                    <select
                      value={authorId}
                      onChange={(e) => setAuthorId(e.target.value)}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E]"
                    >
                      <option value="">Select author...</option>
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] placeholder-[#B0ACBA]"
                    />
                    {tags && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2.5 py-1 rounded-full bg-[#FFF0EC] text-[#FF6B4A] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">
                      Read Time (min)
                    </label>
                    <input
                      type="number"
                      value={readTime}
                      onChange={(e) => setReadTime(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E]"
                    />
                  </div>

                  {/* Published Date */}
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E]"
                    />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title || 'Page title'}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] placeholder-[#B0ACBA]"
                    />
                    <p className="text-xs text-[#8B8697] mt-1">{(metaTitle || title).length}/60</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B8697] mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={excerpt || 'Page description'}
                      rows={3}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#F8F6F1] text-[#1A1A2E] resize-none placeholder-[#B0ACBA]"
                    />
                    <p className="text-xs text-[#8B8697] mt-1">
                      {(metaDescription || excerpt).length}/160
                    </p>
                  </div>

                  {/* Google Preview */}
                  <div>
                    <p className="text-xs font-medium text-[#8B8697] mb-2">Google Preview</p>
                    <div className="bg-[#F8F6F1] border border-[#E8E3D9] rounded-lg p-4">
                      <p className="text-blue-700 text-sm font-medium truncate">
                        {metaTitle || title || 'Page Title'}
                      </p>
                      <p className="text-green-700 text-xs truncate mt-0.5">
                        playoneword.app/blog/{slug || 'your-slug'}
                      </p>
                      <p className="text-xs text-[#8B8697] line-clamp-2 mt-1">
                        {metaDescription || excerpt || 'Page description will appear here...'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
