"use client";

import { useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import {
  Dumbbell,
  CalendarDays,
  Sparkles,
  Flame,
  Armchair,
} from "lucide-react";
import "react-day-picker/dist/style.css";

export default function WorkoutPage() {
  const [selectedDate, setSelectedDate] = useState<any>(
    new Date()
  );
  const [workoutText, setWorkoutText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [suggestion, setSuggestion] = useState("");
  const [muscleTrained, setMuscleTrained] = useState<string[]>([]);
  const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);

  const isToday = selectedDate ? isSameDay(selectedDate, new Date()) : false;

 const updateDate = (day: Date )=> {
  const d = new Date(day)
  d.setDate(d.getDate() + 1) // add 1 day
  setSelectedDate(d.toISOString().slice(0, 10))
}  

  useEffect(() => {
    if (selectedDate) fetchWorkout();
  }, [selectedDate]);

  const fetchWorkout = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token || !selectedDate) {
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/workout/${selectedDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("data", data);
    setMuscleTrained(data?.data?.muscle_trained || []);
    setCaloriesBurned(data?.data?.calories || null);
    setLoading(false);
  };

  const saveWorkout = async () => {
    if (!isToday || !selectedDate) return;
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setSaveStatus("error");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/workout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        workout_description: workoutText,
      }),
    });

    const data = await res.json();

    setSuggestion(data?.workout_suggestion || "");
    setMuscleTrained(data?.muscle_trained || []);
    setCaloriesBurned(data?.calories_burned || null);
    setSaveStatus(res.ok ? "success" : "error");
    setLoading(false);

    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-2">
        <Dumbbell className="w-6 h-6 text-indigo-400" /> Workout Tracker
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={updateDate}
            required
          />
        </div>

        {/* Workout Input */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-6">
          <p className="mb-3 text-sm text-gray-300 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Workout for <strong>{format(selectedDate!, "PPP")}</strong>
          </p>

          {isToday && (
            <>
              <textarea
                placeholder="Describe today's workout..."
                rows={8}
                value={workoutText}
                onChange={(e) => setWorkoutText(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={saveWorkout}
                disabled={loading}
                className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Workout"}
              </button>
            </>
          )}

          {
            !isToday && !caloriesBurned && <p className="mt-4 text-red-400 text-center">No workout logged.</p>
          }
          {!isToday && caloriesBurned && muscleTrained && (
            <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-100/10 p-4">
              <h4 className="text-sm font-semibold text-yellow-300 mb-1">
                Muscles Trained:
              </h4>
              <p className="text-sm text-white">
                {Array.isArray(muscleTrained)
                  ? muscleTrained.join(", ")
                  : muscleTrained}
              </p>

              <h4 className="text-sm font-semibold text-yellow-300 mt-3">
                Calories Burned:
              </h4>
              <p className="text-sm text-white">{caloriesBurned} kcal</p>
            </div>
          )}

          {saveStatus === "success" && (
            <p className="mt-3 text-green-400 transition-all">
              Workout saved successfully!
            </p>
          )}
          {saveStatus === "error" && (
            <p className="mt-3 text-red-400 transition-all">
              Failed to save workout.
            </p>
          )}
        </div>
      </div>

      {/* Suggestion Output */}
      {suggestion && (
        <div className="mt-8 bg-gradient-to-br from-indigo-800 to-purple-800 text-white rounded-xl p-6 shadow-xl border border-indigo-500/40">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400" /> Workout Suggestion
          </h3>
          <div dangerouslySetInnerHTML={{ __html: suggestion }} />
        </div>
      )}

     {isToday && caloriesBurned && (
  <div className="mt-4 inline-block rounded-xl border border-green-500 bg-green-100/10 px-4 py-3 shadow-sm">
    <h4 className="text-sm font-semibold text-green-400">Calories Burned Today</h4>
    <p className="text-lg font-bold text-white">{caloriesBurned} kcal</p>
  </div>
)}

    </div>
  );
}
