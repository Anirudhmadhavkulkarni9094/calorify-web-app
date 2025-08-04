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

    const today = new Date()
    const day = today.getUTCDay()
    const diffToMonday = day === 0 ? -6 : 1 - day

    const start = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + diffToMonday, 0, 0, 0, 0)
    ).toISOString()

    const end = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + diffToMonday + 6, 23, 59, 59, 999)
    ).toISOString()

    console.log('Fetching workouts between:', start, 'and', end)

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lte('created_at', end)

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({
        message: 'No workouts found for this week',
        totalCaloriesBurned: 0,
        musclesTrained: [],
        muscleIntensity: {}
      }, { status: 200 })
    }

    // Total calories
    const totalCaloriesBurned = data.reduce((sum, workout) => sum + (workout.calories || 0), 0)

    // Muscle collection and intensity count
    const musclesSet = new Set<string>()
    const muscleIntensity: Record<string, number> = {}

    data.forEach(workout => {
      let muscles: string[] = []

      if (Array.isArray(workout.muscle_trained)) {
        muscles = workout.muscle_trained
      } else if (typeof workout.muscle_trained === 'string') {
        muscles = [workout.muscle_trained]
      }

      muscles.forEach(muscle => {
        musclesSet.add(muscle)
        muscleIntensity[muscle] = (muscleIntensity[muscle] || 0) + 1
      })
    })

    return NextResponse.json({
      totalCaloriesBurned,
      musclesTrained: Array.from(musclesSet),
      muscleIntensity,
    })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
