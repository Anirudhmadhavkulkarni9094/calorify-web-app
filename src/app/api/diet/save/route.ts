import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id

    const { meal_description, nutrition } = await req.json()

    const { error } = await supabase.from('diets').insert([
      {
        user_id: userId,
        food: meal_description,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fat,
        created_at: new Date().toISOString()
      }
    ])

    if (error) throw error

    return NextResponse.json({ message: 'Diet saved' }, { status: 201 })
  } catch (err: any) {
    console.error('Save Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save diet' }, { status: 500 })
  }
}
