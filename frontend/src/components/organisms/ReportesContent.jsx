"use client"

import { useEffect, useState } from "react"
import { FileText, Download, Calendar, LayoutGrid } from "lucide-react"
import StatCard from "../molecules/StatCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ReportesContent({ activeTab, children }) {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 🔹 Mapeo de íconos según el "key" que devuelve el backend
  const iconMap = {
    generados: <FileText className="h-6 w-6 text-gray-500" />,
    exportaciones: <Download className="h-6 w-6 text-gray-500" />,
    programados: <Calendar className="h-6 w-6 text-gray-500" />,
    plantillas: <LayoutGrid className="h-6 w-6 text-gray-500" />,
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/reportes/stats`)
        if (!res.ok) throw new Error("Error al obtener estadísticas")
        const data = await res.json()
        setStats(
          data.map((stat) => ({
            ...stat,
            icon: iconMap[stat.key] || (
              <FileText className="h-6 w-6 text-gray-500" />
            ),
          }))
        )
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar las estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* 🔹 Cards del dashboard */}
      <div className="p-6 pb-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-28"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="text-sm text-gray-500">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      stat.subtitle?.startsWith("+")
                        ? "text-green-600"
                        : stat.subtitle?.includes("Sin")
                        ? "text-gray-500"
                        : "text-red-500"
                    }`}
                  >
                    {stat.subtitle}
                  </p>
                </div>
                <div>{stat.icon}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Contenido del tab activo */}
      <div>{children}</div>
    </div>
  )
}
