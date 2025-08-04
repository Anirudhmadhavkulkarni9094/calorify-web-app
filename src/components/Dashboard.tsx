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
    // Basic validation
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

  if (loading) return <p className="text-center text-gray-500 mt-6">Loading profile...</p>
  if (error) return <p className="text-center text-red-500 mt-6">Error: {error}</p>

  return (
    <div className="max-w-xl mx-auto mt-10 shadow-lg rounded-2xl overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
        <div className="flex justify-center mb-2">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-bold">
          Welcome, {formData?.name?.toUpperCase()}!
        </h2>
        <p className="text-sm opacity-90">Here’s your health summary</p>
        <div className="mt-4">
          {editMode ? (
            <button
              onClick={handleSave}
              className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm flex items-center gap-2 mx-auto"
            >
              <Save size={16} />
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm flex items-center gap-2 mx-auto"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="p-6 bg-white">
        <ul className="grid grid-cols-2 gap-4">
          {editableFields.map((key) => (
            <li key={key} className="bg-gray-50 p-3 rounded-lg shadow-sm border text-center">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {formatKey(key)}
              </div>
              {editMode ? (
                isSelectField(key) ? (
                  <select
                    value={formData[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="text-sm mt-1 w-full text-center bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {getOptions(key).map((opt) => (
                      <option key={opt} value={opt}>
                        {formatKey(opt)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={['age', 'height_cm', 'weight_kg'].includes(key) ? 'number' : 'text'}
                    value={formData[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="text-sm mt-1 w-full text-center bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )
              ) : (
                <div className="text-lg font-semibold text-gray-800">
                  {String(formData[key])}
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
