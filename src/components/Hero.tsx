'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Totals = {
  totalCaloriesConsumed: number;
  protein: number;
  carbs: number;
  fats: number;
};

export default function DietSummary({ setWorkoutMuscle }: { setWorkoutMuscle: any }) {
  const [token, setToken] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    else setError('User not authenticated.');
  }, []);

  // Fetch weekly diet and workout data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [dietRes, workoutRes] = await Promise.all([
          axios.get('/api/diet/week', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/workout/week', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTotals(dietRes.data);
        console.log(dietRes.data)
        setWorkout(workoutRes.data);
        setWorkoutMuscle(workoutRes.data.musclesTrained);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch data');
        setTotals(null);
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const netCalories =
    (totals?.totalCaloriesConsumed || 0) - (workout?.totalCaloriesBurned || 0);

  return (
    <div className="max-w-sm mx-auto mt-10 px-6 py-8 rounded-3xl border border-purple-400/40 bg-purple-900/20 backdrop-blur-md shadow-[0_8px_30px_rgba(128,90,213,0.4)] transition-all duration-300 animate-fade-in">
      <h2 className="text-2xl font-semibold text-center text-purple-200 mb-6 tracking-tight">
        🧾 Weekly Nutrition Summary
      </h2>

      {loading && (
        <p className="text-center text-purple-300">Fetching your data...</p>
      )}

      {error && (
        <p className="text-center text-red-400 font-medium">{error}</p>
      )}

      {totals ? (
        <div className="space-y-4 text-purple-100 text-sm sm:text-base">
          <Nutrient label="Calories Consumed" value={`${totals.totalCaloriesConsumed} kcal`} />
          <Nutrient label="Protein" value={`${totals.protein} g`} />
          <Nutrient label="Carbs" value={`${totals.carbs} g`} />
          <Nutrient label="Fats" value={`${totals.fats} g`} />
          <Nutrient label="Calories Burned" value={`${workout?.totalCaloriesBurned || 0} kcal`} />
          <Nutrient
            label="Net Calories"
            value={`${netCalories} kcal`}
          />
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-center text-purple-400 italic">No entries this week.</p>
        )
      )}
    </div>
  );
}

function Nutrient({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-purple-300/20 pb-2">
      <span className="font-medium tracking-wide">{label}</span>
      <span className="text-purple-300 font-semibold">{value}</span>
    </div>
  );
}
