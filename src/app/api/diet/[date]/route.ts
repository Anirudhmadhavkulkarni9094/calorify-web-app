// app/api/diet/[date]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // Await the params object and parse date
    const { date: dateParam } = await params

    console.log("date" , dateParam )

    // Convert to YYYY-MM-DD for matching DATE column
    const onlyDate = new Date(dateParam).toISOString().slice(0, 10)

    // Verify JWT
    // const token = req.headers.get('authorization')?.split(' ')[1]
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    // const userId = decoded.id

    // Query for matching user + date
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      // .eq('user_id', userId)
      .eq('date', onlyDate)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(data)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: 'No diet found for this date', data: null },
        { status: 200 }
      )
    }

    // Sum numeric fields
    const totalCalories = data.reduce((sum, entry) => sum + (entry.calories || 0), 0)
    const totalProtein = data.reduce((sum, entry) => sum + (entry.protein || 0), 0)
    const totalCarbs = data.reduce((sum, entry) => sum + (entry.carbs || 0), 0)
    const totalFat = data.reduce((sum, entry) => sum + (entry.fats || 0), 0)

    return NextResponse.json({
      nutrients: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        date: onlyDate,
      },
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
