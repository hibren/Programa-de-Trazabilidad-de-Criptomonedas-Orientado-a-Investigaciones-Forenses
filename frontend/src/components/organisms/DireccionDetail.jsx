"use client"

import { useEffect, useState } from "react"
import TopBar from "@/components/organisms/TopBar"
import StatCard from "../molecules/StatCard"
import { DataTable } from "@/components/DataTable/DataTable"


const API_URL = "http://localhost:8000"

export default function DireccionDetail({ direccion }) {
  const [info, setInfo] = useState(null)
  const [transacciones, setTransacciones] = useState([])

  useEffect(() => {
    // cargar info de dirección
    fetch(`${API_URL}/direcciones/${direccion}`)
      .then((res) => res.json())
      .then(setInfo)
      .catch((err) => console.error("Error dirección:", err))

    // cargar transacciones asociadas
    fetch(`${API_URL}/direcciones/${direccion}/transacciones`)
      .then((res) => res.json())
      .then(setTransacciones)
      .catch((err) => console.error("Error transacciones:", err))
  }, [direccion])

  if (!info) {
    return <div className="flex-1 flex items-center justify-center">Cargando...</div>
  }

  const stats = [
    { title: "Balance final", value: `${info.final_balance} BTC`, subtitle: "Disponible actualmente", icon: "wallet" },
    { title: "Total recibido", value: `${info.total_recibido} BTC`, subtitle: "Acumulado", icon: "incoming" },
    { title: "Total enviado", value: `${info.total_enviado} BTC`, subtitle: "Acumulado", icon: "outgoing" },
    { title: "Transacciones", value: info.n_tx.toString(), subtitle: "Histórico", icon: "transactions" },
  ]

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <TopBar
        title="Detalle de Dirección"
        subtitle={`Análisis de la dirección ${direccion}`}
      />

      {/* Stats */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transacciones asociadas</h2>
          <p className="text-sm text-gray-600">
            Todas las transacciones en las que participa esta dirección.
          </p>
        </div>

        <div className="p-6">
          <DataTable
            data={transacciones}
            columns={[
              { accessorKey: "hash", header: "Hash" },
              { accessorKey: "fecha", header: "Fecha" },
              { accessorKey: "monto_total", header: "Monto (BTC)" },
              { accessorKey: "estado", header: "Estado" },
              { accessorKey: "confirmations", header: "Confirmaciones" },
            ]}
            filterColumn="hash"
          />
        </div>
      </div>
    </div>
  )
}
