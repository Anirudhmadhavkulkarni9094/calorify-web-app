// app/api/diet/[date]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id

    const rawDate = new Date(params.date) // full ISO format

    // Start of day (00:00:00 UTC)
    const start = new Date(
      Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate(), 0, 0, 0, 0)
    ).toISOString()

    // End of day (23:59:59.999 UTC)
    const end = new Date(
      Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate(), 23, 59, 59, 999)
    ).toISOString()

    console.log('Fetching diets between:', start, 'and', end)

    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No diet found for this date', data: null }, { status: 200 })
    }

    // Sum numeric fields
    const totalCalories = data.reduce((sum, entry) => sum + (entry.calories || 0), 0)
    const totalProtein = data.reduce((sum, entry) => sum + (entry.protein || 0), 0)
    const totalCarbs = data.reduce((sum, entry) => sum + (entry.carbs || 0), 0)
    const totalFat = data.reduce((sum, entry) => sum + (entry.fats || 0), 0)

    // Combine text fields, joining unique values separated by new lines
    // Remove null/undefined and duplicates
    const combineUnique = (arr: (string | null | undefined)[]) => 
      Array.from(new Set(arr.filter(Boolean))).join('\n')

 

    return NextResponse.json({
      nutrients: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
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
