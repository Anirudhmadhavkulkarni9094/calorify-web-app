import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const SALT_ROUNDS = 10

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if email exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check username if provided
    if (username) {
      const { data: existingUserName, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUserName) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Insert user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([{ email, username, password_hash: hashedPassword }])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
