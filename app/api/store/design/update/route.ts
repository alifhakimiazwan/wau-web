import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DesignSchema } from '@/lib/design/schema'
import { ZodError } from 'zod'

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
    const { storeId, design } = DesignSchema.parse(body)

    // Verify store ownership
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single()

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }

    // Check if customization exists
    const { data: existing } = await supabase
      .from('store_customization')
      .select('id')
      .eq('store_id', storeId)
      .maybeSingle()

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('store_customization')
        .update({
          theme: design.themeId,
          font_family: design.fontFamily,
          primary_color: design.colors.primary,
          accent_color: design.colors.accent,
          block_shape: design.blockShape,
          button_style: design.buttonConfig.style,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update design' },
          { status: 500 }
        )
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('store_customization')
        .insert({
          store_id: storeId,
          theme: design.themeId,
          font_family: design.fontFamily,
          primary_color: design.colors.primary,
          accent_color: design.colors.accent,
          block_shape: design.blockShape,
          button_style: design.buttonConfig.style,
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to save design' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save design error:', error)

    if (error instanceof z.ZodError) {
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