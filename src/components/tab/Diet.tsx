'use client';
import React, { useState } from 'react';

function Diet() {
  const [data, setData] = useState([
    {
      meal: "Masala Oats + Whey Protein + 2 Chapathi + Curd",
      calories: 520,
      date: "2025-08-01"
    },
    {
      meal: "Dal Rice + 50g Soya + Salad",
      calories: 470,
      date: "2025-08-02"
    },
    {
      meal: "Paneer Bhurji + 2 Roti + Veggie Soup",
      calories: 550,
      date: "2025-08-03"
    }
  ]);

  const [form, setForm] = useState({ meal: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.meal.trim()) {
      setError("Meal description is required.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const estimatedCalories = 500; // Static estimate for now

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal: form.meal.trim(),
          calories: estimatedCalories,
          date: today
        })
      });

      if (!response.ok) throw new Error('Failed to save meal');

      const newMeal = await response.json();
      setData(prev => [newMeal, ...prev]);
      setForm({ meal: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-10 px-4">
      <div className="max-w-md w-full">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-8 shadow-md">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-900 text-center">Log Diet</h2>

          <label className="block mb-6">
            <span className="text-gray-700 font-semibold mb-1 block">Meal</span>
            <input
              type="text"
              name="meal"
              value={form.meal}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="E.g. Soya Curry + Chapathi + Whey"
              required
            />
          </label>

          {error && <p className="text-purple-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white font-bold py-3 rounded-md transition-colors duration-300 hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Meal'}
          </button>
        </form>

        {/* Diet List */}
        {data.map(({ meal, calories, date }, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 mb-6 shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-500">{date}</span>
              <span className="bg-purple-500 text-white font-bold text-sm px-4 py-1 rounded-full shadow-md">
                {calories} kcal
              </span>
            </div>
            <p className="text-gray-800 font-medium leading-relaxed">{meal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Diet;
