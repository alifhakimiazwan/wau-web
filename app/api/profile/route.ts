import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getAuthUserWithStore, getAuthUser } from '@/lib/guards/auth-helpers'
import { invalidateStoreCache } from '@/lib/cache/invalidation'

// ========================================
// PUT /api/profile - Update profile data
// ========================================

const updateProfileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().max(160).optional(),
  location: z.string().optional(),
  phone_number: z.string().optional(),
  profile_pic_url: z.string().optional(),
  banner_pic_url: z.string().optional(),
  socialLinks: z.array(
    z.object({
      id: z.string().optional(),
      platform: z.string(),
      url: z.string().url(),
    })
  ),
})

export async function PUT(request: Request) {
  try {
    // Check auth + store
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      const status = authResult.error?.includes("authenticated") ? 401 : 404;
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status }
      );
    }
    const { store } = authResult;

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    const supabase = await createServerSupabaseClient()

    // Update store info
    const { error: updateError } = await supabase
      .from('stores')
      .update({
        name: data.name,
        bio: data.bio || null,
        location: data.location || null,
        phone_number: data.phone_number || null,
        profile_pic_url: data.profile_pic_url || null,
        banner_pic_url: data.banner_pic_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id)

    if (updateError) {
      console.error('Store update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update store' },
        { status: 500 }
      )
    }

    // Get existing social links
    const { data: existingLinks } = await supabase
      .from('social_links')
      .select('id, platform')
      .eq('store_id', store.id)

    // Delete removed links
    const submittedIds = data.socialLinks.filter(l => l.id).map(l => l.id)
    const toDelete = existingLinks?.filter(link => !submittedIds.includes(link.id)) || []

    if (toDelete.length > 0) {
      await supabase
        .from('social_links')
        .delete()
        .in('id', toDelete.map(l => l.id))
    }

    // Upsert social links
    for (let i = 0; i < data.socialLinks.length; i++) {
      const link = data.socialLinks[i]

      // Extract handle from URL
      const handle = extractHandle(link.url)

      if (link.id) {
        // Update existing
        await supabase
          .from('social_links')
          .update({
            url: link.url,
            handle,
            position: i,
          })
          .eq('id', link.id)
      } else {
        // Insert new
        await supabase
          .from('social_links')
          .insert({
            store_id: store.id,
            platform: link.platform,
            url: link.url,
            handle,
            position: i,
          })
      }
    }

    // Invalidate all store caches (profile and social links changed)
    await invalidateStoreCache(store.id, store.slug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ========================================
// POST /api/profile - Upload image
// ========================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    // Check auth
    const authResult = await getAuthUser();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }
    const { user } = authResult;

    const supabase = await createServerSupabaseClient();
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'avatar' | 'banner'
    const oldImageUrl = formData.get('oldImageUrl') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Delete old image if provided
    if (oldImageUrl) {
      try {
        const oldPath = extractPathFromUrl(oldImageUrl)
        if (oldPath) {
          await supabase.storage
            .from('user-uploads')
            .remove([oldPath])
        }
      } catch (error) {
        console.warn('Failed to delete old image:', error)
      }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${type}-${Date.now()}.${fileExt}`
    const folderPath = type === 'avatar' ? 'avatars' : 'banners'
    const filePath = `${folderPath}/${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ========================================
// DELETE /api/profile - Delete image
// ========================================

export async function DELETE(request: Request) {
  try {
    // Check auth
    const authResult = await getAuthUser();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }
    const { user } = authResult;

    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'No image URL provided' },
        { status: 400 }
      )
    }

    const path = extractPathFromUrl(imageUrl)
    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Invalid image URL' },
        { status: 400 }
      )
    }

    // Security check: ensure path contains user's ID
    if (!path.includes(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase.storage
      .from('user-uploads')
      .remove([path])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ========================================
// Helper functions
// ========================================

function extractHandle(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const handle = pathname.split('/').filter(Boolean).pop() || ''
    return handle.replace('@', '')
  } catch {
    return ''
  }
}

function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/user-uploads/')
    return pathParts[1] || null
  } catch {
    return null
  }
}
