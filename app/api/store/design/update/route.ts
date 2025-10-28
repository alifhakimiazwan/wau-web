import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DesignSchema } from '@/lib/design/schemas'
import { ZodError } from 'zod'
import { getAuthUserWithStore } from '@/lib/guards/auth-helpers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { storeId, design } = DesignSchema.parse(body)

    // Check auth + verify store ownership
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      const status = authResult.error?.includes("authenticated") ? 401 : 404;
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status }
      );
    }
    const { store } = authResult;

    // Verify the storeId in the request matches the user's store
    if (store.id !== storeId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient()

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