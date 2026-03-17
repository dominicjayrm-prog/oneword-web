export type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt: string; caption?: string }
  | { type: 'list'; style: 'bullet' | 'numbered'; items: string[] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'divider' }
  | { type: 'callout'; text: string; emoji?: string }
  | { type: 'code'; language?: string; code: string };

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: ContentBlock[];
  banner_url: string | null;
  banner_alt: string | null;
  author_id: string | null;
  status: 'draft' | 'published';
  language: 'en' | 'es';
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
  read_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  author?: BlogAuthor | null;
}
