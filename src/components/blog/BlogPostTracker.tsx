'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

export function BlogPostTracker({
  slug,
  language,
}: {
  slug: string;
  language: string;
}) {
  useEffect(() => {
    track('blog_post_view', { slug, language });
  }, [slug, language]);

  return null;
}
