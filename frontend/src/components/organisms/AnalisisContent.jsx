"use client"

import { useEffect, useState } from "react"
import StatCard from "../molecules/StatCard"
import Badge from "../atoms/Badge"

const AnalisisContent = () => {
  const [analisis, setAnalisis] = useState([])
  const [loading, setLoading] = useState(true)

  // Llamada al backend
  useEffect(() => {
    const fetchAnalisis = async () => {
      try {
        const API_URL = "http://localhost:8000"

        const res = await fetch(`${API_URL}/analisis/`)

        if (!res.ok) throw new Error("Error al cargar análisis")
        const data = await res.json()
        setAnalisis(data)
      } catch (error) {
        console.error("Error cargando análisis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalisis()
  }, [])

  // Stats básicos (placeholder por ahora)
  const stats = [
    {
      title: "Trazas Activas",
      value: analisis.length,
      subtitle: "En proceso de análisis",
      icon: "activity",
      trend: { positive: true, value: `+${analisis.length}` },
    },
    {
      title: "Promedio",
      value: "-",
      subtitle: "Saltos promedio",
      icon: "trending-up",
      trend: { positive: false, value: "-0.3" },
    },
    {
      title: "BTC Rastreado",
      value: "-",
      subtitle: "Volumen total",
      icon: "bitcoin",
      trend: { positive: true, value: "+15.2%" },
    },
    {
      title: "Alertas Críticas",
      value: "-",
      subtitle: "Requieren revisión",
      icon: "alert-triangle",
      trend: { positive: false, value: "+8" },
    },
  ]

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resultados de Análisis
        </h3>

        {loading && <p className="text-gray-500">Cargando...</p>}

        {!loading && analisis.length === 0 && (
          <p className="text-gray-500">No hay análisis disponibles.</p>
        )}

        {analisis.map((result, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono text-gray-900">
                  {result._id}
                </span>
                <Badge
                  variant={result.riesgo === "Alto" ? "danger" : "warning"}
                >
                  {result.riesgo || "Sin riesgo"}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {result.btc_total ? `${result.btc_total} BTC` : "-"}
                </div>
                <div className="text-sm text-gray-500">
                  {result.saltos ? `${result.saltos} saltos` : ""}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {result.origen && (
                <div>
                  <span className="font-medium">Origen:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {result.origen}
                  </code>
                </div>
              )}
              {result.destino && (
                <div>
                  <span className="font-medium">Destino:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {result.destino}
                  </code>
                </div>
              )}
              {result.patrones?.length > 0 && (
                <div>
                  <span className="font-medium">Patrones identificados:</span>
                  <span className="ml-2">{result.patrones.join(", ")}</span>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Creado:{" "}
                {result.createdAt
                  ? new Date(result.createdAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalisisContent


