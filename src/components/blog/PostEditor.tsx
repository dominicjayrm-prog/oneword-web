'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import type { BlogPost, BlogAuthor, ContentBlock } from '@/lib/blog/types';

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

function countWords(blocks: ContentBlock[]): number {
  let count = 0;
  for (const block of blocks) {
    if ('text' in block && block.text) {
      count += block.text.split(/\s+/).filter(Boolean).length;
    }
    if (block.type === 'list') {
      for (const item of block.items) {
        count += item.split(/\s+/).filter(Boolean).length;
      }
    }
    if (block.type === 'code' && block.code) {
      count += block.code.split(/\s+/).filter(Boolean).length;
    }
  }
  return count;
}

function emptyBlock(type: ContentBlock['type']): ContentBlock {
  switch (type) {
    case 'heading':
      return { type: 'heading', level: 2, text: '' };
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'image':
      return { type: 'image', url: '', alt: '' };
    case 'list':
      return { type: 'list', style: 'bullet', items: [''] };
    case 'quote':
      return { type: 'quote', text: '' };
    case 'divider':
      return { type: 'divider' };
    case 'callout':
      return { type: 'callout', text: '' };
    case 'code':
      return { type: 'code', code: '', language: '' };
    default:
      return { type: 'paragraph', text: '' };
  }
}

const BLOCK_TYPES: { value: ContentBlock['type']; label: string }[] = [
  { value: 'heading', label: 'Heading' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'image', label: 'Image' },
  { value: 'list', label: 'List' },
  { value: 'quote', label: 'Quote' },
  { value: 'divider', label: 'Divider' },
  { value: 'callout', label: 'Callout' },
  { value: 'code', label: 'Code' },
];

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
  const [content, setContent] = useState<ContentBlock[]>(initialPost?.content ?? []);
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status ?? 'draft');
  const [language, setLanguage] = useState<'en' | 'es'>(initialPost?.language ?? 'en');
  const [authorId, setAuthorId] = useState(initialPost?.author_id ?? '');
  const [tags, setTags] = useState(initialPost?.tags?.join(', ') ?? '');
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description ?? '');
  const [readTime, setReadTime] = useState(initialPost?.read_time_minutes ?? 1);
  const [publishedAt, setPublishedAt] = useState(
    initialPost?.published_at
      ? initialPost.published_at.slice(0, 16)
      : ''
  );
  const [seoOpen, setSeoOpen] = useState(false);

  // Data
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // Auto read-time
  useEffect(() => {
    const words = countWords(content);
    setReadTime(Math.max(1, Math.round(words / 200)));
  }, [content]);

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

  // Content block image upload
  async function handleBlockImageUpload(index: number, file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setError('');
    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(`content/${Date.now()}-${file.name}`, file);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const url = supabase.storage.from('blog-images').getPublicUrl(data.path).data.publicUrl;
    updateBlock(index, { url } as Partial<ContentBlock>);
  }

  // Block helpers
  function updateBlock(index: number, updates: Partial<ContentBlock>) {
    setContent((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates } as ContentBlock;
      return copy;
    });
  }

  function removeBlock(index: number) {
    setContent((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.length) return;
    setContent((prev) => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function addBlock(type: ContentBlock['type']) {
    setContent((prev) => [...prev, emptyBlock(type)]);
  }

  // Save
  const handleSave = useCallback(
    async (saveStatus: 'draft' | 'published') => {
      setSaving(true);
      setError('');

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const postData = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
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

      router.push('/admin/blog');
    },
    [
      title, slug, excerpt, content, bannerUrl, bannerAlt, authorId,
      language, metaTitle, metaDescription, tags, readTime, publishedAt,
      isEditing, initialPost, supabase, router,
    ]
  );

  // List item helpers
  function updateListItem(blockIndex: number, itemIndex: number, value: string) {
    setContent((prev) => {
      const copy = [...prev];
      const block = copy[blockIndex];
      if (block.type === 'list') {
        const items = [...block.items];
        items[itemIndex] = value;
        copy[blockIndex] = { ...block, items };
      }
      return copy;
    });
  }

  function addListItem(blockIndex: number) {
    setContent((prev) => {
      const copy = [...prev];
      const block = copy[blockIndex];
      if (block.type === 'list') {
        copy[blockIndex] = { ...block, items: [...block.items, ''] };
      }
      return copy;
    });
  }

  function removeListItem(blockIndex: number, itemIndex: number) {
    setContent((prev) => {
      const copy = [...prev];
      const block = copy[blockIndex];
      if (block.type === 'list' && block.items.length > 1) {
        const items = block.items.filter((_, i) => i !== itemIndex);
        copy[blockIndex] = { ...block, items };
      }
      return copy;
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A2E]">
          {isEditing ? 'Edit Post' : 'New Post'}
        </h1>
        <button
          onClick={() => router.push('/admin/blog')}
          className="text-sm text-[#8B8697] hover:text-[#1A1A2E] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main content */}
        <div className="space-y-6">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full font-serif text-3xl font-bold text-[#1A1A2E] placeholder-[#E8E3D9] border-0 border-b-2 border-[#E8E3D9] focus:border-[#FF6B4A] focus:outline-none bg-transparent pb-2"
          />

          {/* Slug */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(slugify(e.target.value));
              }}
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
            />
            <p className="text-xs text-[#8B8697] mt-1">
              playoneword.app/blog/{slug || 'your-slug-here'}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for cards and SEO..."
              rows={3}
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none"
            />
          </div>

          {/* Banner */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-1">Banner Image</label>
            {bannerUrl ? (
              <div className="relative">
                <img
                  src={bannerUrl}
                  alt={bannerAlt || 'Banner preview'}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setBannerUrl('');
                    setBannerAlt('');
                  }}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-white transition-colors"
                >
                  X
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#E8E3D9] rounded-lg cursor-pointer hover:border-[#FF6B4A] transition-colors">
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8E3D9] border-t-[#FF6B4A]" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-[#8B8697] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#8B8697]">Click to upload (max 5MB)</span>
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
            <div className="mt-2">
              <label className="block text-xs text-[#8B8697] mb-1">
                Alt text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bannerAlt}
                onChange={(e) => setBannerAlt(e.target.value)}
                placeholder="Describe the image..."
                className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
              />
            </div>
          </div>

          {/* Content Blocks */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-3">Content Blocks</label>
            <div className="space-y-4">
              {content.map((block, index) => (
                <div
                  key={index}
                  className="border border-[#E8E3D9] rounded-lg p-4 bg-[#FFFDF7]"
                >
                  {/* Block header */}
                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={block.type}
                      onChange={(e) => {
                        const newType = e.target.value as ContentBlock['type'];
                        setContent((prev) => {
                          const copy = [...prev];
                          copy[index] = emptyBlock(newType);
                          return copy;
                        });
                      }}
                      className="text-sm border border-[#E8E3D9] rounded px-2 py-1 bg-white text-[#1A1A2E] focus:outline-none focus:border-[#FF6B4A]"
                    >
                      {BLOCK_TYPES.map((bt) => (
                        <option key={bt.value} value={bt.value}>
                          {bt.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-[#8B8697] hover:text-[#1A1A2E] disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        onClick={() => moveBlock(index, 1)}
                        disabled={index === content.length - 1}
                        className="p-1 text-[#8B8697] hover:text-[#1A1A2E] disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button
                        onClick={() => removeBlock(index)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete block"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Block content based on type */}
                  {block.type === 'heading' && (
                    <div className="space-y-2">
                      <select
                        value={block.level}
                        onChange={(e) =>
                          updateBlock(index, { level: Number(e.target.value) as 2 | 3 })
                        }
                        className="text-sm border border-[#E8E3D9] rounded px-2 py-1 bg-white text-[#1A1A2E] focus:outline-none focus:border-[#FF6B4A]"
                      >
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                      </select>
                      <input
                        type="text"
                        value={block.text}
                        onChange={(e) => updateBlock(index, { text: e.target.value })}
                        placeholder="Heading text..."
                        className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                      />
                    </div>
                  )}

                  {block.type === 'paragraph' && (
                    <textarea
                      value={block.text}
                      onChange={(e) => updateBlock(index, { text: e.target.value })}
                      placeholder="Write your paragraph..."
                      rows={4}
                      className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none"
                    />
                  )}

                  {block.type === 'image' && (
                    <div className="space-y-2">
                      {block.url ? (
                        <img
                          src={block.url}
                          alt={block.alt || 'Block image'}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[#E8E3D9] rounded-lg cursor-pointer hover:border-[#FF6B4A] transition-colors">
                          <span className="text-sm text-[#8B8697]">Upload image</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBlockImageUpload(index, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                      <input
                        type="text"
                        value={block.alt}
                        onChange={(e) => updateBlock(index, { alt: e.target.value })}
                        placeholder="Alt text (required)"
                        className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                      />
                      <input
                        type="text"
                        value={block.caption ?? ''}
                        onChange={(e) => updateBlock(index, { caption: e.target.value })}
                        placeholder="Caption (optional)"
                        className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                      />
                    </div>
                  )}

                  {block.type === 'list' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateBlock(index, {
                              style: block.style === 'bullet' ? 'numbered' : 'bullet',
                            })
                          }
                          className="text-xs px-2 py-1 rounded bg-[#F5F0E8] text-[#8B8697] hover:bg-[#E8E3D9] transition-colors"
                        >
                          {block.style === 'bullet' ? 'Bullet' : 'Numbered'}
                        </button>
                      </div>
                      {block.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          <span className="text-xs text-[#8B8697] w-4">
                            {block.style === 'bullet' ? '\u2022' : `${itemIdx + 1}.`}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              updateListItem(index, itemIdx, e.target.value)
                            }
                            placeholder="List item..."
                            className="flex-1 text-sm border border-[#E8E3D9] rounded-lg px-3 py-1.5 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                          />
                          <button
                            onClick={() => removeListItem(index, itemIdx)}
                            className="text-red-400 hover:text-red-600 text-xs transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addListItem(index)}
                        className="text-xs text-[#FF6B4A] hover:underline"
                      >
                        + Add item
                      </button>
                    </div>
                  )}

                  {block.type === 'quote' && (
                    <div className="space-y-2">
                      <textarea
                        value={block.text}
                        onChange={(e) => updateBlock(index, { text: e.target.value })}
                        placeholder="Quote text..."
                        rows={3}
                        className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none italic"
                      />
                      <input
                        type="text"
                        value={block.attribution ?? ''}
                        onChange={(e) => updateBlock(index, { attribution: e.target.value })}
                        placeholder="Attribution (optional)"
                        className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                      />
                    </div>
                  )}

                  {block.type === 'divider' && (
                    <hr className="border-[#E8E3D9]" />
                  )}

                  {block.type === 'callout' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.emoji ?? ''}
                        onChange={(e) => updateBlock(index, { emoji: e.target.value })}
                        placeholder="Emoji (e.g. 💡)"
                        className="w-20 text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                      />
                      <textarea
                        value={block.text}
                        onChange={(e) => updateBlock(index, { text: e.target.value })}
                        placeholder="Callout text..."
                        rows={3}
                        className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none"
                      />
                    </div>
                  )}

                  {block.type === 'code' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.language ?? ''}
                        onChange={(e) => updateBlock(index, { language: e.target.value })}
                        placeholder="Language (e.g. javascript)"
                        className="w-48 text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                      />
                      <textarea
                        value={block.code}
                        onChange={(e) => updateBlock(index, { code: e.target.value })}
                        placeholder="Paste your code..."
                        rows={6}
                        className="w-full text-sm font-mono border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-[#1A1A2E] text-green-400 resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add block */}
            <div className="mt-4 flex flex-wrap gap-2">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  onClick={() => addBlock(bt.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E8E3D9] text-[#8B8697] hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-colors"
                >
                  + {bt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-2">Status</label>
            <div className="flex gap-1">
              <button
                onClick={() => setStatus('draft')}
                className={`flex-1 text-sm py-2 rounded-lg transition-colors ${
                  status === 'draft'
                    ? 'bg-[#F5F0E8] text-[#1A1A2E] font-medium'
                    : 'text-[#8B8697] hover:bg-[#F5F0E8]/50'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setStatus('published')}
                className={`flex-1 text-sm py-2 rounded-lg transition-colors ${
                  status === 'published'
                    ? 'bg-green-500/10 text-green-600 font-medium'
                    : 'text-[#8B8697] hover:bg-[#F5F0E8]/50'
                }`}
              >
                Published
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-2">Language</label>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 text-sm py-2 rounded-lg transition-colors ${
                  language === 'en'
                    ? 'bg-[#FF6B4A] text-white font-medium'
                    : 'bg-[#F5F0E8] text-[#8B8697] hover:bg-[#E8E3D9]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex-1 text-sm py-2 rounded-lg transition-colors ${
                  language === 'es'
                    ? 'bg-[#FF6B4A] text-white font-medium'
                    : 'bg-[#F5F0E8] text-[#8B8697] hover:bg-[#E8E3D9]'
                }`}
              >
                ES
              </button>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-2">Author</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
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
            <label className="block text-xs text-[#8B8697] mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
            />
            {tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0EC] text-[#FF6B4A]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="border border-[#E8E3D9] rounded-lg overflow-hidden">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#1A1A2E] hover:bg-[#FFFDF7] transition-colors"
            >
              SEO Settings
              <svg
                className={`w-4 h-4 text-[#8B8697] transition-transform ${seoOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {seoOpen && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="block text-xs text-[#8B8697] mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Page title'}
                    className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
                  />
                  <p className="text-xs text-[#8B8697] mt-1">
                    {(metaTitle || title).length}/60
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-[#8B8697] mb-1">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt || 'Page description'}
                    rows={3}
                    className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E] resize-none"
                  />
                  <p className="text-xs text-[#8B8697] mt-1">
                    {(metaDescription || excerpt).length}/160
                  </p>
                </div>
                {/* Google preview */}
                <div className="bg-white border border-[#E8E3D9] rounded-lg p-3">
                  <p className="text-xs text-[#8B8697] mb-2">Google Preview</p>
                  <p className="text-blue-700 text-sm font-medium truncate">
                    {metaTitle || title || 'Page Title'}
                  </p>
                  <p className="text-green-700 text-xs truncate">
                    playoneword.app/blog/{slug || 'your-slug'}
                  </p>
                  <p className="text-xs text-[#8B8697] line-clamp-2 mt-0.5">
                    {metaDescription || excerpt || 'Page description will appear here...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Read time */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-2">
              Read Time (minutes)
            </label>
            <input
              type="number"
              value={readTime}
              onChange={(e) => setReadTime(Math.max(1, Number(e.target.value)))}
              min={1}
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
            />
          </div>

          {/* Published date */}
          <div>
            <label className="block text-xs text-[#8B8697] mb-2">Published Date</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full text-sm border border-[#E8E3D9] rounded-lg px-3 py-2 focus:border-[#FF6B4A] focus:outline-none bg-white text-[#1A1A2E]"
            />
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#E8E3D9]">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving || !title}
          className="px-6 py-2.5 rounded-lg border border-[#E8E3D9] text-[#1A1A2E] text-sm font-medium hover:bg-[#F5F0E8] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave('published')}
          disabled={saving || !title}
          className="px-6 py-2.5 rounded-lg bg-[#FF6B4A] text-white text-sm font-medium hover:bg-[#e55a3a] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
