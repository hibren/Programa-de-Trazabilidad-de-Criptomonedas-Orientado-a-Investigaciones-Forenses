"use client"

import { FileText, Activity, Network, Bell, FileCheck, BarChart } from "lucide-react"
import ReportesContent from "@/components/organisms/ReportesContent"

export default function Page() {
  const reportes = [
    {
      titulo: "Reporte de Riesgo por Dirección",
      descripcion: "Análisis detallado de perfil de riesgo para direcciones específicas",
      formatos: ["PDF", "Word", "CSV"],
      icono: <FileText className="h-6 w-6 text-green-700" />,
    },
    {
      titulo: "Reporte de Actividad por Período",
      descripcion: "Resumen de transacciones y patrones en rango de fechas",
      formatos: ["PDF", "CSV"],
      icono: <Activity className="h-6 w-6 text-green-700" />,
    },
    {
      titulo: "Reporte de Clusters y Redes",
      descripcion: "Análisis de agrupaciones y conexiones entre direcciones",
      formatos: ["PDF", "Word"],
      icono: <Network className="h-6 w-6 text-green-700" />,
    },
    {
      titulo: "Reporte de Alertas",
      descripcion: "Resumen de alertas y eventos de seguridad",
      formatos: ["PDF", "CSV"],
      icono: <Bell className="h-6 w-6 text-green-700" />,
    },
    {
      titulo: "Reporte de Compliance",
      descripcion: "Documentación para cumplimiento regulatorio",
      formatos: ["PDF", "Word"],
      icono: <FileCheck className="h-6 w-6 text-green-700" />,
    },
    {
      titulo: "Reporte Ejecutivo",
      descripcion: "Resumen de alto nivel para directivos",
      formatos: ["PDF", "PowerPoint"],
      icono: <BarChart className="h-6 w-6 text-green-700" />,
    },
  ]

  return (
    <ReportesContent activeTab="generar">
      {/* 👇 Contenido específico del tab “Generar” */}
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
                    className="text-xs border border-gray-300 px-2 py-1 rounded text-gray-600"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <button className="bg-green-700 text-white px-4 py-2 rounded-md w-full flex items-center justify-center gap-2 hover:bg-green-800">
                <FileText className="h-4 w-4" />
                Generar
              </button>
            </div>
          ))}
        </div>
      </div>
    </ReportesContent>
  )
}
