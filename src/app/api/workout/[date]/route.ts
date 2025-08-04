import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest,
  {params}: { params: Promise<{ date: string }> }) {
  try {
    const date = (await params).date;

    console.log("dateParam" , date)
    const selectedDate = new Date(date);

    console.log(selectedDate)

    const start = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate()+1,
        0, 0, 0, 0
      )
    ).toISOString();

    const end = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate()+1,
        23, 59, 59, 999
      )
    ).toISOString();

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      // .eq('user_id', userId) // Uncomment if filtering by user
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No workouts found for this date', data: date }, { status: 200 });
    }

    const aggregated = {
      id: data[0].id,
      user_id: data[0].user_id,
      workout: data.map(w => w.workout).join(' | '),
      calories: data.reduce((sum, w) => sum + (w.calories || 0), 0),
      date: date,
      created_at: data[0].created_at,
      muscle_trained: Array.from(new Set(data.flatMap(w => w.muscle_trained || [])))
    };

    return NextResponse.json({ data: aggregated }, { status: 200 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
