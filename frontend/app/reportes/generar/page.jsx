"use client"

import { useState } from "react"
import { FileText, Activity, Network, Bell, FileCheck, BarChart } from "lucide-react"
import ReportesContent from "@/components/organisms/ReportesContent"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const API_URL = "http://localhost:8000"

export default function ReportesGenerarPage() {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState("")
  const [direccion, setDireccion] = useState("")
  const [formato, setFormato] = useState("PDF")
  const [loading, setLoading] = useState(false)

  const reportes = [
    {
      id: "riesgo",
      titulo: "Reporte de Riesgo por Dirección",
      descripcion: "Análisis detallado de perfil de riesgo para direcciones específicas",
      formatos: ["PDF", "Word", "CSV"],
      icono: <FileText className="h-6 w-6 text-green-700" />,
    },
    {
      id: "actividad",
      titulo: "Reporte de Actividad por Período",
      descripcion: "Resumen de transacciones y patrones en rango de fechas",
      formatos: ["PDF", "CSV"],
      icono: <Activity className="h-6 w-6 text-green-700" />,
    },
    {
      id: "clusters",
      titulo: "Reporte de Clusters y Redes",
      descripcion: "Análisis de agrupaciones y conexiones entre direcciones",
      formatos: ["PDF", "Word"],
      icono: <Network className="h-6 w-6 text-green-700" />,
    },
    {
      id: "alertas",
      titulo: "Reporte de Alertas",
      descripcion: "Resumen de alertas y eventos de seguridad",
      formatos: ["PDF", "CSV"],
      icono: <Bell className="h-6 w-6 text-green-700" />,
    },
    {
      id: "compliance",
      titulo: "Reporte de Compliance",
      descripcion: "Documentación para cumplimiento regulatorio",
      formatos: ["PDF", "Word"],
      icono: <FileCheck className="h-6 w-6 text-green-700" />,
    },
    {
      id: "ejecutivo",
      titulo: "Reporte Ejecutivo",
      descripcion: "Resumen de alto nivel para directivos",
      formatos: ["PDF", "PowerPoint"],
      icono: <BarChart className="h-6 w-6 text-green-700" />,
    },
  ]

  const handleGenerar = async () => {
    setLoading(true)
    try {
      let endpoint = ""
      if (tipo === "riesgo") endpoint = `/reportes/generar/riesgo/${direccion}`
      else if (tipo === "actividad") endpoint = `/reportes/generar/actividad/`
      else if (tipo === "clusters") endpoint = `/reportes/generar/clusters/`
      else {
        alert("Este tipo de reporte aún no está implementado.")
        setLoading(false)
        return
      }

      const res = await fetch(`${API_URL}${endpoint}?formato=${formato}`, {
  method: "POST",
})

      const data = await res.json()

      if (data?.path) {
        const filename = data.path.split("/").pop()
        window.open(`${API_URL}/reportes/download/${filename}`, "_blank")
      } else {
        alert("No se pudo generar el reporte.")
      }
    } catch (error) {
      console.error(error)
      alert("Error al generar el reporte.")
    } finally {
      setLoading(false)
      setOpen(false)
      setDireccion("")
    }
  }

  return (
    <ReportesContent activeTab="generar">
      <div className="px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {reportes.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                {r.icono}
                <h3 className="text-green-800 font-semibold">{r.titulo}</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">{r.descripcion}</p>
              <div className="flex gap-2 mb-4 flex-wrap">
                {r.formatos.map((f, j) => (
                  <span
                    key={j}
                    className={`text-xs border px-2 py-1 rounded cursor-pointer ${
                      formato === f
                        ? "bg-green-700 text-white border-green-700"
                        : "border-gray-300 text-gray-600 hover:bg-green-50"
                    }`}
                    onClick={() => setFormato(f)}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  setTipo(r.id)
                  setOpen(true)
                }}
                className="bg-green-700 text-white px-4 py-2 rounded-md w-full flex items-center justify-center gap-2 hover:bg-green-800"
              >
                <FileText className="h-4 w-4" />
                Generar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de ingreso de datos */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tipo === "riesgo" && "Generar Reporte de Riesgo"}
              {tipo === "actividad" && "Generar Reporte de Actividad"}
              {tipo === "clusters" && "Generar Reporte de Clusters y Redes"}
            </DialogTitle>
          </DialogHeader>

          {tipo === "riesgo" && (
            <div className="mt-4 space-y-2">
              <label className="text-sm text-gray-700 font-medium">
                Dirección (hash)
              </label>
              <Input
                placeholder="Ej: 1BoatSLRHtKNngkdXEeobR76b53LETtpyT"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              disabled={loading}
              onClick={handleGenerar}
              className="bg-green-700 hover:bg-green-800"
            >
              {loading ? "Generando..." : "Generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ReportesContent>
  )
}
