"use client"

import { FileText, Download, RefreshCw, Loader2 } from "lucide-react"
import ReportesContent from "@/components/organisms/ReportesContent"
import { useEffect, useState } from "react"

export default function Page() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const fetchHistorial = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("🔍 Intentando cargar desde:", `${API_BASE_URL}/reportes/historial`)
      
      const response = await fetch(`${API_BASE_URL}/reportes/historial`)
      
      console.log("📡 Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error del servidor:", errorText)
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`)
      }
      
      const data = await response.json()
      console.log("✅ Datos recibidos:", data)
      setHistorial(data)
    } catch (err) {
      console.error("❌ Error completo:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistorial()
  }, [])

  const handleDownload = (downloadUrl, filename) => {
    // Crear un link temporal y disparar descarga
    const link = document.createElement("a")
    link.href = `${API_BASE_URL}${downloadUrl}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ReportesContent activeTab="historial">
      <div className="px-6 pb-10">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Historial de Reportes
            </h2>
            <button
              onClick={fetchHistorial}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          {loading && (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">Cargando reportes...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && historial.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay reportes generados aún</p>
              <p className="text-sm text-gray-400 mt-1">
                Genera tu primer reporte en las otras pestañas
              </p>
            </div>
          )}

          {!loading && !error && historial.length > 0 && (
            <div className="space-y-3">
              {historial.map((item, i) => (
                <div
                  key={i}
                  className="bg-white flex justify-between items-center p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-800">{item.nombre}</h3>
                      <p className="text-sm text-gray-500">
                        {item.formato} · {item.peso}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 hidden sm:block">{item.fecha}</span>
                    <button
                      onClick={() => handleDownload(item.download_url, item.filename)}
                      className="text-gray-500 hover:text-green-700 transition p-2 rounded-lg hover:bg-green-50"
                      title={`Descargar ${item.filename}`}
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReportesContent>
  )
}