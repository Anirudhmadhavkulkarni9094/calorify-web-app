import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if username exists
    if (username) {
      const { data: existingUserName } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUserName) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert into users table
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([{ email, username, password_hash: hashedPassword }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Insert into user_profiles with defaults
    const { error: profileInsertError } = await supabase.from('user_profiles').insert([
  {
    user_id: user.id,
    name: user.username,
    age: 12,
    height_cm: "160",
    weight_kg: "70",
    gender: 'other',
    goal: 'fat_loss',
    activity_level: 'lightly_active',
    diet_type: 'vegetarian',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]);

if (profileInsertError) {
  console.error('Failed to insert into user_profiles:', profileInsertError.message);
}
else{
  console.log('Successfully inserted into user_profiles');
}

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        token,
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
