import { NextRequest, NextResponse, userAgent } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]

    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured')
    }
    let decoded: { id?: string }
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { id?: string }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 })
    }

    console.log(userId)
    // Fetch user profile from supabase
   const { data, error } = await supabase
  .from('user_profiles')
  .select('name, age, height_cm, weight_kg, goal, gender, activity_level, diet_type')             // fetch all columns
  .eq('user_id', userId)
  .single()


    if (error || !data) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Return profile data
    return NextResponse.json({ profile: data }, { status: 200 })
  } catch (err: any) {
    console.error('Error fetching user profile:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id

    const body = await req.json()
    console.log("body" , body)

    const { name, age, height_cm, weight_kg, goal, gender, activity_level, diet_type } = body

    // Upsert the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: userId, // user_id is primary/foreign key
          name,
          age,
          height_cm,
           weight_kg,
          goal,
          gender,
          activity_level,
          diet_type,
        },
        { onConflict: 'user_id' } // Ensure it updates if exists
      )
      .select()
    if (error) throw new Error(error.message)
    return NextResponse.json({ profile: data?.[0], message: 'Profile saved successfully' }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.id

    const body = await req.json()

    const { name, age, height_cm, weight_kg, goal, gender, activity_level, diet_type } = body

    // Check if user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Update profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        name,
        age,
        height_cm,
        weight_kg,
        goal,
        gender,
        activity_level,
        diet_type,
      })
      .eq('user_id', userId)
      .select()

    if (error) throw new Error(error.message)

    return NextResponse.json({ profile: data?.[0], message: 'Profile updated successfully' }, { status: 200 })
  } catch (err: any) {
    console.error('PUT /profile error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
