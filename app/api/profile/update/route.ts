import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

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

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    // Get store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }

    // ⭐ Update store info
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

    // ⭐ Get existing social links
    const { data: existingLinks } = await supabase
      .from('social_links')
      .select('id, platform')
      .eq('store_id', store.id)

    // ⭐ Delete removed links
    const submittedIds = data.socialLinks.filter(l => l.id).map(l => l.id)
    const toDelete = existingLinks?.filter(link => !submittedIds.includes(link.id)) || []
    
    if (toDelete.length > 0) {
      await supabase
        .from('social_links')
        .delete()
        .in('id', toDelete.map(l => l.id))
    }

    // ⭐ Upsert social links
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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