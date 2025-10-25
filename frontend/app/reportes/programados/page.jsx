"use client"

import { Plus, Settings } from "lucide-react"
import ReportesContent from "@/components/organisms/ReportesContent"
import ProgramarReporteModal from "@/components/organisms/ProgramarReporteModal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"


export default function Page() {
  const programados = [
    {
      nombre: "Reporte Semanal de Riesgo",
      tipo: "Semanal",
      proxima: "2024-01-22 09:00:00",
      estado: "Activo",
    },
    {
      nombre: "Resumen Mensual",
      tipo: "Mensual",
      proxima: "2024-02-01 08:00:00",
      estado: "Activo",
    },
    {
      nombre: "Alertas Diarias",
      tipo: "Diario",
      proxima: "2024-01-16 06:00:00",
      estado: "Pausado",
    },
  ]

  return (
    <ReportesContent activeTab="programados">
      <div className="px-6 pb-10">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Reportes Programados
            </h2>
            <div className="flex justify-between items-center mb-4">
                <ProgramarReporteModal />
            </div>
          </div>

          {/* Listado */}
          <div className="space-y-3">
            {programados.map((r, i) => (
              <div
                key={i}
                className="bg-white flex justify-between items-center p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow transition"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{r.nombre}</h3>
                  <p className="text-sm text-gray-500">
                    {r.tipo} · Próxima ejecución: {r.proxima}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Estado */}
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      r.estado === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.estado}
                  </span>

                  {/* Menú de opciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-500 hover:text-green-700 transition">
                        <Settings className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => alert(`Editar ${r.nombre}`)}
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => alert(`Eliminar ${r.nombre}`)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                      {r.estado === "Activo" ? (
                        <DropdownMenuItem
                          onClick={() => alert(`Pausar ${r.nombre}`)}
                        >
                          Pausar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => alert(`Reanudar ${r.nombre}`)}
                        >
                          Reanudar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReportesContent>
  )
}
