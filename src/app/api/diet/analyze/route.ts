import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getGeminiResponse } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    jwt.verify(token, process.env.JWT_SECRET!)

    const { meal_description } = await req.json()

    const prompt = `Estimate the total calories and macronutrients in the following Indian meal (no egg): "${meal_description}". Return the output in this JSON format strictly: { "calories": number, "protein": number, "carbs": number, "fat": number , "analysis" : string, "watchouts" : string, "Tips" : string, "benifits" : string }`

    const geminiText = await getGeminiResponse(prompt)

    const cleaned = geminiText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const nutrition = JSON.parse(cleaned)

    return NextResponse.json({ nutrition }, { status: 200 })
  } catch (err: any) {
    console.error('Analyze Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to analyze meal' }, { status: 500 })
  }
}
