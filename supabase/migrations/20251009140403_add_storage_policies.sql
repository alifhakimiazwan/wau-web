-- Note: RLS is already enabled on storage.objects by Supabase
-- No need to explicitly enable it

-- ============================================
-- POLICY 1: Allow users to upload their own content
-- ============================================
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
  )
);

-- ============================================
-- POLICY 2: Allow users to update their own content
-- ============================================
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
  )
);

-- ============================================
-- POLICY 3: Allow users to delete their own content
-- ============================================
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
  )
);

-- ============================================
-- POLICY 4: Allow public to view all content
-- ============================================
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
  )
);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Run this to see your policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;