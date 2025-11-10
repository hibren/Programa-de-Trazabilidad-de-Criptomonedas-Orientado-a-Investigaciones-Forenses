"use client"

import { useEffect, useState } from "react"
import { Clock, Trash2, Power, PowerOff, Loader2, Calendar } from "lucide-react"
import ReportesContent from "@/components/organisms/ReportesContent"
import ProgramarReporteModal from "@/components/organisms/ProgramarReporteModal"

export default function Page() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const fetchReportes = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/reportes-programados/`)

      if (!response.ok) {
        throw new Error("Error al cargar reportes programados")
      }

      const data = await response.json()
      setReportes(data)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching reportes:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportes()
  }, [])

  const handleToggle = async (id, activo) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reportes-programados/${id}/toggle?activo=${!activo}`,
        { method: "PATCH" }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al cambiar estado")
      }

      fetchReportes()
    } catch (err) {
      console.error("Error:", err)
      alert(`Error al cambiar el estado del reporte: ${err.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este reporte programado?")) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reportes-programados/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al eliminar")
      }

      fetchReportes()
    } catch (err) {
      console.error("Error:", err)
      alert(`Error al eliminar el reporte: ${err.message}`)
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A"
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      riesgo: "Reporte de Riesgo",
      actividad: "Reporte de Actividad",
      clusters: "Reporte de Clusters",
    }
    return labels[tipo] || tipo
  }

  const getFrecuenciaLabel = (frecuencia) => {
    const labels = {
      diario: "Diario",
      semanal: "Semanal",
      mensual: "Mensual",
    }
    return labels[frecuencia] || frecuencia
  }

  return (
    <ReportesContent activeTab="programados">
      <div className="px-6 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Reportes Programados</h2>
          <ProgramarReporteModal onSuccess={fetchReportes} />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && reportes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay reportes programados</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primer reporte automático</p>
          </div>
        )}

        {!loading && !error && reportes.length > 0 && (
          <div className="space-y-4">
            {reportes.map((reporte) => (
              <div
                key={reporte._id}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{reporte.nombre}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          reporte.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {reporte.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="text-gray-500">Tipo:</span> {getTipoLabel(reporte.tipo)}
                      </div>
                      <div>
                        <span className="text-gray-500">Formato:</span> {reporte.formato}
                      </div>
                      <div>
                        <span className="text-gray-500">Frecuencia:</span>{" "}
                        {getFrecuenciaLabel(reporte.frecuencia)}
                      </div>
                      <div>
                        <span className="text-gray-500">Ejecuciones:</span>{" "}
                        {reporte.total_ejecuciones}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Próxima: {formatFecha(reporte.proxima_ejecucion)}
                      </div>
                      {reporte.ultima_ejecucion && (
                        <div>Última: {formatFecha(reporte.ultima_ejecucion)}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(reporte._id, reporte.activo)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                      title={reporte.activo ? "Desactivar" : "Activar"}
                    >
                      {reporte.activo ? (
                        <Power className="h-5 w-5 text-green-600" />
                      ) : (
                        <PowerOff className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(reporte._id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ReportesContent>
  )
}