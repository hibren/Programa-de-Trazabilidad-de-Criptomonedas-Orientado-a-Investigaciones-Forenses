"use client"

import React, { useState } from "react"
import Card from "@/components/molecules/Card"
import Badge from "@/components/atoms/Badge"
import { Settings, Edit3, Trash2, Power } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export default function ReglasPage() {
  const [reglas, setReglas] = useState([
    { id: 1, nombre: "Transacción de Alto Valor", condicion: "Monto > 10 BTC", estado: "Activa" },
    { id: 2, nombre: "Patrón Sospechoso", condicion: "Score de riesgo > 80", estado: "Activa" },
    { id: 3, nombre: "Actividad Inusual", condicion: "Transacciones > 100/día", estado: "Inactiva" },
  ])

  const toggleEstado = (id) => {
    setReglas((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, estado: r.estado === "Activa" ? "Inactiva" : "Activa" } : r
      )
    )
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Reglas de Alerta</h2>

      <div className="space-y-3">
        {reglas.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-medium text-gray-800">{r.nombre}</p>
              <p className="text-sm text-gray-500">{r.condicion}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={r.estado === "Activa" ? "success" : "outline"}>
                {r.estado}
              </Badge>

              {/* Menú de configuración */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md hover:bg-gray-100">
                    <Settings size={16} className="text-gray-600" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  {/* Editar */}
                  <DropdownMenuItem onClick={() => alert(`Editar ${r.nombre}`)}>
                    <Edit3 size={14} className="mr-2 text-gray-600" />
                    Editar
                  </DropdownMenuItem>

                  {/* Activar / Desactivar con ícono dinámico */}
                  <DropdownMenuItem onClick={() => toggleEstado(r.id)}>
                    <Power
                      size={14}
                      className={`mr-2 ${
                        r.estado === "Activa" ? "text-yellow-600" : "text-green-600"
                      }`}
                    />
                    {r.estado === "Activa" ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>

                  {/* Eliminar */}
                  <DropdownMenuItem
                    onClick={() => setReglas((prev) => prev.filter((x) => x.id !== r.id))}
                    className="text-red-600"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
