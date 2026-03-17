'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PostEditor from '@/components/blog/PostEditor';
import type { BlogPost } from '@/lib/blog/types';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = useMemo(() => createClient(), []);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPost(data as BlogPost);
      }
      setLoading(false);
    }
    fetchPost();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8E3D9] border-t-[#FF6B4A]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-red-600">
          {error || 'Post not found.'}
        </p>
      </div>
    );
  }

  return <PostEditor initialPost={post} />;
}
