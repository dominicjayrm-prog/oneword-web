-- Blog authors table
CREATE TABLE blog_authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content JSONB NOT NULL,
  banner_url TEXT,
  banner_alt TEXT,
  author_id UUID REFERENCES blog_authors(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  read_time_minutes INT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_language ON blog_posts(language);

-- RLS for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Admin can do everything
CREATE POLICY "Admin full access" ON blog_posts
  FOR ALL USING (auth.uid() = '99ce4025-2d10-4549-8afc-63cd9f5675fc');

-- RLS for blog_authors
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;

-- Anyone can read authors
CREATE POLICY "Public can read authors" ON blog_authors
  FOR SELECT USING (true);

-- Admin can manage authors
CREATE POLICY "Admin full access authors" ON blog_authors
  FOR ALL USING (auth.uid() = '99ce4025-2d10-4549-8afc-63cd9f5675fc');
