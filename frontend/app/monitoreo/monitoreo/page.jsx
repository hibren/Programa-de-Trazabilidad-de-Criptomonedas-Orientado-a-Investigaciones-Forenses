"use client"

import React, { useState } from "react"
import Card from "@/components/molecules/Card"
import Button from "@/components/atoms/Button"

export default function PageMonitoreo() {
  const [intervalo, setIntervalo] = useState("")
  const [umbral, setUmbral] = useState("0.1")

  const direcciones = [
    { id: 1, hash: "1A1zP1eP5QGefi2DMPTf...", ultimaActividad: "2024-01-15", activo: true },
    { id: 2, hash: "3J98t1WpEZ73CNmQviec...", ultimaActividad: "2024-01-14", activo: true },
    { id: 3, hash: "1BvBMSEYstWetqTn5Au...", ultimaActividad: "2024-01-13", activo: true },
  ]

  const handleGuardar = () => {
    console.log("Configuración guardada:", { intervalo, umbral })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 📋 Direcciones Monitoreadas */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Direcciones Monitoreadas</h2>
        <div className="space-y-3">
          {direcciones.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-gray-800">{d.hash}</p>
                <p className="text-sm text-gray-500">
                  Última actividad: {d.ultimaActividad}
                </p>
              </div>
              <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                Activo
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* ⚙️ Configuración de Monitoreo */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Configuración de Monitoreo</h2>

        <div className="space-y-4">
          {/* Intervalo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervalo de Verificación
            </label>
            <select
              value={intervalo}
              onChange={(e) => setIntervalo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar intervalo</option>
              <option value="5min">Cada 5 minutos</option>
              <option value="30min">Cada 30 minutos</option>
              <option value="1h">Cada hora</option>
              <option value="24h">Cada 24 horas</option>
            </select>
          </div>

          {/* Umbral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umbral de Alerta (BTC)
            </label>
            <input
              type="text"
              value={umbral}
              onChange={(e) => setUmbral(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Botón */}
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={handleGuardar}
          >
            Guardar Configuración
          </Button>
        </div>
      </Card>
    </div>
  )
}
