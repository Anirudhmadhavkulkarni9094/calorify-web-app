import React from 'react'
import { ArrowDown, ArrowUp, Activity } from 'lucide-react'

interface CalorieInfoProps {
  data: {
    label: string
    value: number | string
  }
}

function CalorieInfo({ data }: CalorieInfoProps) {
  // Select icon based on label
  const renderIcon = () => {
    switch (data.label.toLowerCase()) {
      case 'calorie intake':
        return <ArrowDown className="text-green-600 w-6 h-6" />
      case 'calorie burned':
        return <ArrowUp className="text-red-600 w-6 h-6" />
      case 'net calorie today':
        return <Activity className="text-purple-600 w-6 h-6" />
      default:
        return null
    }
  }

  return (
    <div className="bg-purple-100 backdrop-blur-2xl rounded-lg p-4 shadow-md w-48 text-center flex flex-col items-center gap-2">
      {renderIcon()}
      <div className="text-sm font-semibold text-purple-700">{data.label}</div>
      <div className="text-2xl font-bold text-purple-900">{data.value}</div>
    </div>
  )
}

export default CalorieInfo
