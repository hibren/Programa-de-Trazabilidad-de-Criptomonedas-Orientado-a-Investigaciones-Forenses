"use client"

import { FileText, Download } from "lucide-react"
import ReportesContent from "@/components/organisms/ReportesContent"

export default function Page() {
  const historial = [
    {
      nombre: "Reporte de Riesgo - Enero 2024",
      formato: "PDF",
      peso: "2.3 MB",
      fecha: "2024-01-15 14:30:00",
    },
    {
      nombre: "Actividad Semanal",
      formato: "CSV",
      peso: "856 KB",
      fecha: "2024-01-14 16:45:00",
    },
    {
      nombre: "Análisis de Clusters",
      formato: "PDF",
      peso: "4.1 MB",
      fecha: "2024-01-13 09:15:00",
    },
  ]

  return (
    <ReportesContent activeTab="historial">
      {/* 👇 Contenido específico del tab “Historial” */}
      <div className="px-6 pb-10">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Historial de Reportes
          </h2>

          <div className="space-y-3">
            {historial.map((item, i) => (
              <div
                key={i}
                className="bg-white flex justify-between items-center p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-800">{item.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      {item.formato} · {item.peso}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{item.fecha}</span>
                  <button className="text-gray-500 hover:text-green-700 transition">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReportesContent>
  )
}
