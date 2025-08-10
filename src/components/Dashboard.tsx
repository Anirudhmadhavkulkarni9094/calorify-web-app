import { useUserProfile } from '@/hooks/useUserProfile'
import { User, Pencil, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

// Enums
const genderOptions = ['male', 'female', 'other']
const goalOptions = ['fat_loss', 'muscle_gain', 'maintenance']
const activityOptions = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extra_active'
]
const dietOptions = [
  'vegetarian',
  'non_vegetarian',
  'eggetarian',
  'vegan',
  'pescatarian'
]

// Display labels mapping
const optionLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  fat_loss: "Fat Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  extra_active: "Extra Active",
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-Vegetarian",
  eggetarian: "Eggetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian"
}

const editableFields = [
  'name',
  'age',
  'height_cm',
  'weight_kg',
  'gender',
  'goal',
  'activity_level',
  'diet_type'
]

export default function Dashboard() {
  const { profile, loading, error } = useUserProfile()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleSave = async () => {
    const { name, age, height_cm, weight_kg, gender, goal, activity_level, diet_type } = formData

    if (!name || !age || !height_cm || !weight_kg || !gender || !goal || !activity_level || !diet_type) {
      alert('Please fill all required fields')
      return
    }

    if (
      !genderOptions.includes(gender) ||
      !goalOptions.includes(goal) ||
      !activityOptions.includes(activity_level) ||
      !dietOptions.includes(diet_type)
    ) {
      alert('Invalid option selected')
      return
    }

    try {
      const payload = {
        ...formData,
        age: parseInt(age),
        height_cm: parseFloat(height_cm),
        weight_kg: parseFloat(weight_kg),
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to update profile')

      const { profile: updatedProfile } = await res.json()
      setFormData(updatedProfile)
      setEditMode(false)
    } catch (err) {
      alert('Error saving profile')
      console.error(err)
    }
  }

  if (loading) return <p className="text-center text-purple-400 mt-6">Loading profile...</p>
  if (error) return <p className="text-center text-red-500 mt-6">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#1f0f2e] to-[#0f0f0f] flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl shadow-2xl border border-purple-400/30 backdrop-blur-lg bg-white/5 p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-purple-500/20 p-3 rounded-full border border-purple-400/30">
              <User size={32} className="text-purple-300" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-purple-200">
            Welcome, {formData?.name?.toUpperCase()}!
          </h2>
          <p className="text-purple-400 mt-1 text-sm">
            Here’s your health summary
          </p>

          <div className="mt-4">
            {editMode ? (
              <button
                onClick={handleSave}
                className="bg-purple-500 hover:bg-purple-600 px-5 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2 mx-auto transition-all duration-300"
              >
                <Save size={16} />
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-purple-500 hover:bg-purple-600 px-5 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2 mx-auto transition-all duration-300"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile fields */}
        <ul className="grid grid-cols-2 gap-4">
          {editableFields.map((key) => (
            <li
              key={key}
              className="p-4 rounded-xl bg-white/10 border border-purple-400/20 backdrop-blur-sm hover:scale-[1.02] transition-all duration-200"
            >
              <div className="text-xs text-purple-300 font-medium uppercase tracking-wide mb-1">
                {formatKey(key)}
              </div>
              {editMode ? (
                isSelectField(key) ? (
                  <select
                    value={formData[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="text-sm w-full text-center bg-transparent border border-purple-400/30 rounded-md px-2 py-1 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {getOptions(key).map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-[#1a1a1a] text-purple-100"
                      >
                        {optionLabels[opt] || opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={['age', 'height_cm', 'weight_kg'].includes(key) ? 'number' : 'text'}
                    value={formData[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="text-sm w-full text-center bg-transparent border border-purple-400/30 rounded-md px-2 py-1 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )
              ) : (
                <div className="text-lg font-semibold text-purple-100">
                  {optionLabels[formData[key]] || String(formData[key])}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Helper to format keys nicely
function formatKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Detect if a key uses select dropdown
function isSelectField(key: string) {
  return ['gender', 'goal', 'activity_level', 'diet_type'].includes(key)
}

// Return options for each enum field
function getOptions(key: string) {
  switch (key) {
    case 'gender': return genderOptions
    case 'goal': return goalOptions
    case 'activity_level': return activityOptions
    case 'diet_type': return dietOptions
    default: return []
  }
}
