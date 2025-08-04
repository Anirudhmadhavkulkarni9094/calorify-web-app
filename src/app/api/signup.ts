import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

const SALT_ROUNDS = 10

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { email, username, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // Check if email or username exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    if (username) {
      const { data: existingUserName, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
      if (existingUserName) {
        return res.status(400).json({ error: 'Username already taken' })
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

    return res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
