-- ============================================
-- CREATE STORAGE BUCKETS
-- Created: 2025-11-06
-- Description: Create storage buckets for user uploads
-- ============================================

-- Create user-uploads bucket (public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING; -- Don't error if bucket already exists
