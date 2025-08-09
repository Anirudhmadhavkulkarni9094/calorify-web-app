'use client'

import { useEffect, useState } from 'react'
import { isSameDay } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import {
  Salad,
  CalendarDays,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  UtensilsCrossed,
} from 'lucide-react'
import 'react-day-picker/dist/style.css'

export default function DietTracker() {
  const [selectedDate, setSelectedDate] = useState<any>(new Date())
  const [dietText, setDietText] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [macroData, setMacroData] = useState<null | {
    calories: number
    protein: number
    carbs: number
    fat: number
    benifits?: string
    watchouts?: string
    Tips?: string
    analysis?: string
  }>(null)

  const isToday = selectedDate ? isSameDay(selectedDate, new Date()) : false

  useEffect(() => {
    if (selectedDate) fetchDiet()
  }, [selectedDate])

const updateDate = (day: Date) => {
  const d = new Date(day)
  d.setDate(d.getDate() + 1) // add 1 day
  setSelectedDate(d.toISOString().slice(0, 10))
}  

  // Optionally fetch existing diet data if you have API for it
  const fetchDiet = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    
    try {
      const res = await fetch(`/api/diet/${selectedDate}`, {
  headers: { Authorization: `Bearer ${token}` },
})
      if (!res.ok) throw new Error('Failed to fetch diet')
      const data = await res.json()
    console.log("date: ", selectedDate)
    console.log("dataaa",data)
      setDietText(data?.meal_description || '')
      setMacroData({
        calories: data?.nutrients?.calories || 0,
        protein: data?.nutrients?.protein || 0,
        carbs: data?.nutrients?.carbs || 0,
        fat: data?.nutrients?.fat || 0,
        benifits: data?.nutrients?.benifits,
        watchouts: data?.nutrients?.watchouts,
        Tips: data?.nutrients?.Tips,
        analysis: data?.nutrients?.analysis,
      })
      setAnalyzed(false)
    } catch {
      setDietText('')
      setMacroData(null)
      setAnalyzed(false)
    }
    setLoading(false)
  }

  const analyzeDiet = async () => {
    if (!dietText.trim()) {
      setSaveStatus('error')
      return
    }
    setLoading(true)
    setSaveStatus('idle')

    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      setSaveStatus('error')
      return
    }

    try {
      const res = await fetch('/api/diet/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meal_description: dietText }),
      })
      if (!res.ok) throw new Error('Analyze failed')

      const data = await res.json()
      setMacroData({ ...data.nutrition })
      setAnalyzed(true)
      setSaveStatus('idle')
    } catch {
      setSaveStatus('error')
      setAnalyzed(false)
    }
    setLoading(false)
  }

  const saveDiet = async () => {
    if (!analyzed || !macroData) return

    setLoading(true)
    setSaveStatus('idle')

    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      setSaveStatus('error')
      return
    }

    try {
      const res = await fetch('/api/diet/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meal_description: dietText,
          nutrition: macroData,
        }),
      })

      if (!res.ok) throw new Error('Save failed')
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
    setLoading(false)

    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  return (
  <div className="max-w-6xl mx-auto p-6">
    <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-2">
      <Salad className="w-6 h-6 text-green-400" /> Diet Tracker
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: Calendar */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <DayPicker mode="single" selected={selectedDate} onSelect={updateDate} required />
        </div>
      </div>

      {/* Right: Main Panel */}
      <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-6 space-y-4">
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {isToday ? 'Today’s Meal Input' : selectedDate}
        </p>

        {isToday ? (
          <>
            <textarea
              placeholder="Describe your meals, calories, macros..."
              rows={8}
              value={dietText}
              onChange={(e) => {
                setDietText(e.target.value)
                setAnalyzed(false)
                setSaveStatus('idle')
              }}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={analyzeDiet}
                disabled={loading || !dietText.trim()}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Diet'}
              </button>

              <button
                onClick={saveDiet}
                disabled={loading || !analyzed}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save to Tracker'}
              </button>
            </div>

            {saveStatus === 'success' && (
              <p className="mt-3 text-green-400 transition-all">Diet saved successfully!</p>
            )}
            {saveStatus === 'error' && (
              <p className="mt-3 text-red-400 transition-all">
                Failed to analyze or save. Please try again.
              </p>
            )}
          </>
        ) : macroData ? (
          // For non-today, show macros on side
          <div className="grid grid-cols-2 gap-4 text-white">
            <MacroCard label="Calories" value={macroData.calories} color="text-indigo-400" />
            <MacroCard label="Protein (g)" value={macroData.protein} color="text-green-400" />
            <MacroCard label="Carbs (g)" value={macroData.carbs} color="text-yellow-300" />
            <MacroCard label="Fat (g)" value={macroData.fat} color="text-pink-400" />
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-lg bg-yellow-900/30 text-yellow-300 text-sm">
            No data available for this date.
          </div>
        )}
      </div>
    </div>

    {/* Bottom section for current day only: macros + suggestions */}
    {isToday && macroData && (
      <div className="mt-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
          <MacroCard label="Calories" value={macroData.calories} color="text-indigo-400" />
          <MacroCard label="Protein (g)" value={macroData.protein} color="text-green-400" />
          <MacroCard label="Carbs (g)" value={macroData.carbs} color="text-yellow-300" />
          <MacroCard label="Fat (g)" value={macroData.fat} color="text-pink-400" />
        </div>
        {macroData.benifits && macroData.watchouts && macroData.Tips && macroData.analysis && <div>

        <Section icon={<Sparkles className="text-indigo-500" />} title="Benefits" content={macroData.benifits || 'N/A'} />
        <Section icon={<AlertTriangle className="text-yellow-600" />} title="Watchouts" content={macroData.watchouts || 'N/A'} />
        <Section icon={<Lightbulb className="text-green-600" />} title="Tips" content={macroData.Tips || 'N/A'} />
        <Section icon={<UtensilsCrossed className="text-gray-700" />} title="General Analysis" content={macroData.analysis || 'N/A'} />
        </div>}
      </div>
    )}
  </div>
)


}


function MacroCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg flex flex-col items-center">
      <span className={`${color} text-sm`}>{label}</span>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function Section({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode
  title: string
  content: string
}) {
  return (
    <div className="rounded-2xl p-4 m-2 bg-gray-100 dark:bg-gray-800 transition-all">
      <div className="flex items-start sm:items-center gap-3 mb-2 flex-wrap sm:flex-nowrap">
        <div className="w-6 h-6 flex-shrink-0">{icon}</div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    </div>
  )
}
