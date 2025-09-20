"use client"

import StatCard from "../molecules/StatCard"
import Badge from "../atoms/Badge"

const GrafosContent = () => {
  const stats = [
    { title: "Trazas Activas", value: "127", subtitle: "En proceso de análisis", icon: "activity", trend: { positive: true, value: "+12" } },
    { title: "Promedio", value: "8.5", subtitle: "Saltos promedio", icon: "trending-up", trend: { positive: false, value: "-0.3" } },
    { title: "BTC Rastreado", value: "245.8", subtitle: "Volumen total", icon: "bitcoin", trend: { positive: true, value: "+15.2%" } },
    { title: "Alertas Críticas", value: "46", subtitle: "Requieren revisión", icon: "alert-triangle", trend: { positive: false, value: "+8" } },
  ]

  const trazabilidadResults = [
    {
      id: "trace_001",
      status: "Alto",
      origen: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      destino: "3j3HqWiZT2DeGVeeXyRmRHqWqY",
      patrones: "Layering, Mixer",
      monto: "12.5 BTC",
      saltos: "6 saltos",
      fechaCreacion: "2024-01-16 14:39:25",
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

      {/* Contenido principal */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resultados de Trazabilidad
        </h3>
        {trazabilidadResults.map((result, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono text-gray-900">{result.id}</span>
                <Badge variant={result.status === "Alto" ? "danger" : "warning"}>
                  {result.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{result.monto}</div>
                <div className="text-sm text-gray-500">{result.saltos}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Origen:</span>
                <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                  {result.origen}
                </code>
              </div>
              <div>
                <span className="font-medium">Destino:</span>
                <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                  {result.destino}
                </code>
              </div>
              <div>
                <span className="font-medium">Patrones identificados:</span>
                <span className="ml-2">{result.patrones}</span>
              </div>
              <div className="text-xs text-gray-400">Creado: {result.fechaCreacion}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GrafosContent

