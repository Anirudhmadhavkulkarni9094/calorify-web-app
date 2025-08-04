// /app/api/workout/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";
import { getGeminiResponse } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    if (!userId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    if (!date)
      return NextResponse.json({ error: "Date is required" }, { status: 400 });

    // Fetch workout entry for that user and date (date-only match)
    const { data, error } = await supabase
      .from("workout_entries")
      .select("workout_description")
      .eq("user_id", userId)
      .eq("created_at::date", date) // PostgreSQL date cast
      .single();

    if (error) {
      // If no workout found, return empty string (not error)
      return NextResponse.json({ workout: "" });
    }

    return NextResponse.json({ workout: data.workout_description });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("entering post");
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    const { workout_description } = await req.json();
    if (!workout_description)
      return NextResponse.json(
        { error: "Workout description is required" },
        { status: 400 }
      );
    console.log("userid", userId);
    // 1. Fetch user profile for calories estimate
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("age, height_cm, weight_kg, activity_level, goal")
      .eq("user_id", userId)
      .single();

    console.log(userProfile);
    if (profileError || !userProfile) throw new Error("User profile not found");

    // 2. Prepare Gemini AI prompt
 const prompt = `
You are a fitness assistant helping users track and improve their workouts. Always respond accurately, clearly, and in structured JSON format.

User Profile:
- Age: ${userProfile.age}
- Height: ${userProfile.height_cm} cm
- Weight: ${userProfile.weight_kg} kg
- Activity Level: ${userProfile.activity_level} (e.g., Sedentary, Lightly active, Active, Very active)
- Goal: ${userProfile.goal} (e.g., Fat loss, Muscle gain, Endurance)

Workout Details:
"${workout_description}"

Instructions:
1. Estimate the total calories burned using scientifically sound methods (e.g., MET values or heart rate-based estimates) based on the user's profile and workout description. If workout duration is missing, assume a standard of 30 minutes unless otherwise stated.

2. Provide a concise, personalized analysis in HTML format with inline font-size styling. Your summary should include:
   - Workout intensity (Low, Medium, or High)
   - Duration (if mentioned, or your assumption)
   - Primary muscle groups worked
   - How effective the workout is for the user's stated fitness goal
   - Suggestions for improvement, balance, or safety tips

3. Extract and list the major muscle groups trained in an array of lowercase strings (e.g., ["chest", "shoulders", "quads"]).

Output Format:
Respond strictly in **valid JSON** (no extra text, no comments, no markdown, no code blocks). Ensure proper escaping and formatting.

{
  "calorie_burned": number,
  "workout_suggestion": string, // HTML with inline font-size styles
  "muscle_trained": [string]
}
`;


    const geminiResponse = await getGeminiResponse(prompt);
    console.log("geminiResponse", geminiResponse);
    const cleaned = geminiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned || "{}");
    const calorie_burned = parsed.calorie_burned || 0;

    // 3. Insert workout entry with calories burned and timestamp
    const { data, error } = await supabase.from("workouts").insert([
      {
        user_id: userId,
        workout: workout_description,
        calories: calorie_burned,
        muscle_trained: parsed.muscle_trained,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    console.log(parsed)
    return NextResponse.json(
      {
        message: "Workout logged",
        data,
        calorie_burned,
        workout_suggestion: parsed.workout_suggestion,
        muscle_trained: parsed.muscle_trained,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.log(err)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
