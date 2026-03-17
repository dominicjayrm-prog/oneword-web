-- Create the blog-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog images
CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow admin to upload blog images
CREATE POLICY "Admin can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.uid() = '99ce4025-2d10-4549-8afc-63cd9f5675fc'
);

-- Allow admin to update blog images
CREATE POLICY "Admin can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND auth.uid() = '99ce4025-2d10-4549-8afc-63cd9f5675fc'
);

-- Allow admin to delete blog images
CREATE POLICY "Admin can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND auth.uid() = '99ce4025-2d10-4549-8afc-63cd9f5675fc'
);
