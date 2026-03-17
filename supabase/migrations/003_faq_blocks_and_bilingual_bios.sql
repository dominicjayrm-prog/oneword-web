-- Bilingual author bios: replace single bio column with bio_en and bio_es
ALTER TABLE blog_authors ADD COLUMN bio_en TEXT;
ALTER TABLE blog_authors ADD COLUMN bio_es TEXT;

-- Migrate existing bio data to bio_en
UPDATE blog_authors SET bio_en = bio WHERE bio IS NOT NULL;

-- Drop the old bio column
ALTER TABLE blog_authors DROP COLUMN bio;
