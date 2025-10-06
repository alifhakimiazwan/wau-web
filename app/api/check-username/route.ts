import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    // Validate input
    if (!username || username.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Validate format
    if (!/^[a-z0-9-]+$/.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Invalid username format' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', username.toLowerCase())
      .maybeSingle() // ⭐ Use maybeSingle() instead of single()

    if (error) {
      console.error('Username check error:', error)
      return NextResponse.json(
        { available: false, error: 'Failed to check username' },
        { status: 500 }
      )
    }

    const available = !data
    return NextResponse.json(
      { available },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Username check exception:', error)
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}