'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function UserProfileForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    gender: '',
    goal: '',
    activity_level: '',
    diet_type: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 201) {
        router.push('/dashboard') // Change redirect as needed
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
          min={1}
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="height_cm"
          placeholder="Height (cm)"
          value={formData.height_cm}
          onChange={handleChange}
          required
          min={0}
          step={0.1}
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="weight_kg"
          placeholder="Weight (kg)"
          value={formData.weight_kg}
          onChange={handleChange}
          required
          min={0}
          step={0.1}
          className="w-full border p-2 rounded"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          type="text"
          name="goal"
          placeholder="Goal (e.g. fat_loss, muscle_gain, maintenance)"
          value={formData.goal}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <select
          name="activity_level"
          value={formData.activity_level}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Activity Level</option>
          <option value="sedentary">Sedentary</option>
          <option value="lightly_active">Lightly Active</option>
          <option value="moderately_active">Moderately Active</option>
          <option value="very_active">Very Active</option>
          <option value="extra_active">Extra Active</option>
        </select>

        <select
          name="diet_type"
          value={formData.diet_type}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Diet Type</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="non_vegetarian">Non Vegetarian</option>
          <option value="eggetarian">Eggetarian</option>
          <option value="vegan">Vegan</option>
          <option value="pescatarian">Pescatarian</option>
        </select>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
