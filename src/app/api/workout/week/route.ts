import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id

    // Today's date in UTC
    const today = new Date()
    const utcDay = today.getUTCDay() // Sunday=0, Monday=1, ...
    
    // Calculate diff to Monday (start of the week)
    const diffToMonday = utcDay === 0 ? -6 : 1 - utcDay

    // Start of Monday (UTC)
    const start = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + diffToMonday,
      0, 0, 0, 0
    )).toISOString().slice(0,10)

    // End of Sunday (UTC)
    const end = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + diffToMonday + 6,
      23, 59, 59, 999
    )).toISOString().slice(0,10)


    console.log("current week",start, end)
    // Query workouts for this week
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end)

    if (error) throw error

    if (!data?.length) {
      return NextResponse.json({
        message: 'No workouts found for this week',
        totalCaloriesBurned: 0,
        musclesTrained: [],
        muscleIntensity: {}
      }, { status: 200 })
    }

    // Total calories
    const totalCaloriesBurned = data.reduce(
      (sum, workout) => sum + (workout.calories || 0),
      0
    )

    // Aggregate muscle data
    const musclesSet = new Set<string>()
    const muscleIntensity: Record<string, number> = {}

    data.forEach(workout => {
      const muscles: string[] =
        Array.isArray(workout.muscle_trained)
          ? workout.muscle_trained
          : workout.muscle_trained
          ? [workout.muscle_trained]
          : []

      muscles.forEach(muscle => {
        musclesSet.add(muscle)
        muscleIntensity[muscle] = (muscleIntensity[muscle] || 0) + 1
      })
    })

    return NextResponse.json({
      totalCaloriesBurned,
      musclesTrained: Array.from(musclesSet),
      muscleIntensity
    })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
