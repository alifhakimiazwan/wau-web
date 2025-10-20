-- ============================================
-- Add Product Storage Policies
-- Allow authenticated users to upload product files
-- ============================================

-- Update the existing "Users can upload own content" policy to include products
DROP POLICY IF EXISTS "Users can upload own content" ON storage.objects;
CREATE POLICY "Users can upload own content"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads'
  AND (
    -- Allow uploads to avatars/{userId}/
    name LIKE 'avatars/' || auth.uid()::text || '/%'
    OR
    -- Allow uploads to banners/{userId}/
    name LIKE 'banners/' || auth.uid()::text || '/%'
    OR
    -- Allow uploads to product thumbnails/{userId}/
    name LIKE 'products/thumbnails/' || auth.uid()::text || '/%'
    OR
    -- Allow uploads to product files/{userId}/
    name LIKE 'products/files/' || auth.uid()::text || '/%'
  )
);

-- Update the existing "Users can update own content" policy
DROP POLICY IF EXISTS "Users can update own content" ON storage.objects;
CREATE POLICY "Users can update own content"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (
    name LIKE 'avatars/' || auth.uid()::text || '/%'
    OR
    name LIKE 'banners/' || auth.uid()::text || '/%'
    OR
    name LIKE 'products/thumbnails/' || auth.uid()::text || '/%'
    OR
    name LIKE 'products/files/' || auth.uid()::text || '/%'
  )
);

-- Update the existing "Users can delete own content" policy
DROP POLICY IF EXISTS "Users can delete own content" ON storage.objects;
CREATE POLICY "Users can delete own content"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (
    name LIKE 'avatars/' || auth.uid()::text || '/%'
    OR
    name LIKE 'banners/' || auth.uid()::text || '/%'
    OR
    name LIKE 'products/thumbnails/' || auth.uid()::text || '/%'
    OR
    name LIKE 'products/files/' || auth.uid()::text || '/%'
  )
);

-- Update the existing "Public can view content" policy
DROP POLICY IF EXISTS "Public can view content" ON storage.objects;
CREATE POLICY "Public can view content"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user-uploads'
  AND (
    name LIKE 'avatars/%'
    OR
    name LIKE 'banners/%'
    OR
    name LIKE 'products/thumbnails/%'
    OR
    name LIKE 'products/files/%'
  )
);
