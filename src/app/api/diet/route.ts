// app/api/diet/route.ts

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id
    // Optional: You can parse query parameters if date filtering is dynamic
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start') || '2025-08-01T00:00:00.000Z'
    const end = searchParams.get('end') || '2026-08-02T23:59:59.999Z'

    // Fetch diet entries filtered by user and date range
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('user_id', userId) // Uncomment if filtering by user
      .gte('created_at', '2025-08-02T16:46:46.125Z')  // ✅ Correct ISO format
      .lte('created_at', '2025-08-03T16:46:46.125Z')  // ✅ More inclusive
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch diet logs' },
      { status: 500 }
    )
  }
}
