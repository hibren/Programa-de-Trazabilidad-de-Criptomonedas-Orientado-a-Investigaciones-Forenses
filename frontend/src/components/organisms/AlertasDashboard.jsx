"use client"

import { Plus } from "lucide-react"
import MetricCard from "@/components/molecules/MetricCard"
import { DataTable } from "@/components/DataTable/DataTable"
import StatusTag from "@/components/molecules/StatusTag"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import { Bell, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function AlertasDashboard({ alertas = [] }) {
  // 📊 Métricas principales
    const metricas = [
    { title: "Alertas", value: "1", diff: "+3 hoy", icon: Bell },
    { title: "Críticas", value: "1", diff: "+1 hoy", icon: AlertTriangle },
    { title: "Resueltas Hoy", value: "12", diff: "+5 vs ayer", icon: CheckCircle },
    { title: "Tiempo Promedio", value: "15 min", diff: "-3 min", icon: Clock },
    ]

  // 🧩 Definición de columnas (para React Table v8)
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Tipo",
      accessorKey: "tipo",
    },
    {
      header: "Severidad",
      accessorKey: "severidad",
      cell: ({ getValue }) => {
        const value = getValue()
        const variant =
          value === "Crítica"
            ? "danger"
            : value === "Media"
            ? "success"
            : "secondary"

        return <Badge variant={variant}>{value}</Badge>
      },
    },
    {
      header: "Mensaje",
      accessorKey: "mensaje",
    },
    {
      header: "Dirección",
      accessorKey: "direccion",
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ getValue }) => <StatusTag estado={getValue()} />,
    },
    {
      header: "Fecha",
      accessorKey: "fecha",
    },
  ]

  return (
    <>
      {/* 🔹 Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricas.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* 🔹 Tabla de alertas */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Alertas del Sistema</h2>
          <Button variant="primary" icon={Plus}>
            Nueva Alerta
          </Button>
        </div>

        {alertas.length > 0 ? (
          <DataTable
            columns={columns}
            data={alertas}
            filterColumn="direccion"
            emptyMessage="No hay alertas registradas."
          />
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            No hay alertas registradas.
          </div>
        )}
      </div>
    </>
  )
}
