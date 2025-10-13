import React from "react"

export default function MetricCard({ title, value, diff, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center">
      {Icon && <Icon className="w-6 h-6 text-green-700 mb-2" />}
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
      <span className="text-xs text-gray-400">{diff}</span>
    </div>
  )
}
