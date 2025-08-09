import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // JWT verification
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id
    console.log("user id " , userId)
    // Resolve params and normalize to YYYY-MM-DD
    const { date: dateParam } = await params
    const onlyDate = new Date(dateParam).toISOString().slice(0, 10)

    console.log('Querying workouts for date:', onlyDate)

    // Query by exact DATE match
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('date', onlyDate) // match DATE column directly
      .order('created_at', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: 'No workouts found for this date', date: onlyDate },
        { status: 200 }
      )
    }

    // Aggregate results
    const aggregated = {
      id: data[0].id,
      user_id: data[0].user_id,
      workout: data.map(w => w.workout).join(' | '),
      calories: data.reduce((sum, w) => sum + (w.calories || 0), 0),
      date: onlyDate,
      created_at: data[0].created_at,
      muscle_trained: Array.from(new Set(data.flatMap(w => w.muscle_trained || [])))
    }

    return NextResponse.json({ data: aggregated }, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
