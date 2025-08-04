import { NextResponse , NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken' // Uncomment if using JWT

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try{
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id
    const today = new Date()
    const day = today.getUTCDay() // 0 (Sun) to 6 (Sat)
    const diffToSunday = -day // Go back to Sunday
    const start = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + diffToSunday,
        0, 0, 0, 0
      )
    ).toISOString()

    const end = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + diffToSunday + 6,
        23, 59, 59, 999
      )
    ).toISOString()

    console.log('Fetching diet logs between:', start, 'and', end , "for user :" , userId)

    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lte('created_at', end)

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({
        message: 'No diet logs found for this week',
        totalCaloriesConsumed: 0,
        protein: 0,
      carbs: 0,
      fats:0,
        meals: [],
      }, { status: 200 })
    }

    const totals = data.reduce(
      (acc, meal) => {
        acc.calories += meal.calories || 0
        acc.protein += meal.protein || 0
        acc.carbs += meal.carbs || 0
        acc.fats += meal.fats || 0
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    return NextResponse.json({
      totalCaloriesConsumed: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats
    }, { status: 200 })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
