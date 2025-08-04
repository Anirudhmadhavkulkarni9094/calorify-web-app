'use client';
import React, { useState } from 'react';

function Workout() {
  const [data, setData] = useState([
    {
      workout: "Shoulder Press - 45 reps, Chest Press - 45 reps, Pec Fly - 40 reps, Dumbbell Press - 45 reps",
      calories: 350,
      date: "2025-08-01"
    },
    {
      workout: "Lat Pulldown - 45 reps, Seated Row - 45 reps, Dumbbell Row - 45 reps, Dumbbell Hammer Curl - 45 reps",
      calories: 320,
      date: "2025-08-02"
    },
    {
      workout: "Leg Press - 45 reps, Leg Curl - 45 reps, Leg Extension - 45 reps, Calf Raises - 45 reps",
      calories: 400,
      date: "2025-08-03"
    }
  ]);

  const [form, setForm] = useState<any>({
    workout: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.workout.trim()) {
      setError('Workout description is required.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const estimatedCalories = 300; // You can improve this logic later

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout: form.workout.trim(),
          calories: estimatedCalories,
          date: today
        })
      });

      if (!response.ok) throw new Error('Failed to save workout');

      const newWorkout = await response.json();
      setData(prev => [newWorkout, ...prev]);
      setForm({ workout: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-10 px-4 ">
      <div className="max-w-md w-full">

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-xl p-6 mb-8 shadow-md"
        >
          <h2 className="text-2xl font-extrabold mb-6 text-gray-900 text-center">Log Workout</h2>

          <label className="block mb-6">
            <span className="text-gray-700 font-semibold mb-1 block">Workout</span>
            <input
              type="text"
              name="workout"
              value={form.workout}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="E.g. Deadlifts, 4 sets of 10"
              required
            />
          </label>

          {error && <p className="text-purple-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white font-bold py-3 rounded-md transition-colors duration-300 hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Workout'}
          </button>
        </form>

        {/* Workout List */}
        {data.map(({ workout, calories, date }, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 mb-6 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-default"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-500">{date}</span>
              <span className="bg-purple-500 text-white font-bold text-sm px-4 py-1 rounded-full shadow-md">
                {calories} kcal
              </span>
            </div>
            <p className="text-gray-800 font-medium leading-relaxed">
              {workout}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workout;
