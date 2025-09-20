"use client"

import { ArrowUpDown, Shield, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const getColumnsDirecciones = () => {
  const router = useRouter()

  return [
    {
      accessorKey: "direccion",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Dirección
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const direccion = row.getValue("direccion")
        return (
          <button
            className="font-mono text-xs text-blue-600 hover:underline"
            onClick={() => router.push(`/direcciones/${direccion}`)}
          >
            {direccion}
          </button>
        )
      },
    },
    {
      accessorKey: "total_recibido",
      header: "Entradas",
      cell: ({ row }) => <span>{row.getValue("total_recibido")} BTC</span>,
    },
    {
      accessorKey: "total_enviado",
      header: "Salidas",
      cell: ({ row }) => <span>{row.getValue("total_enviado")} BTC</span>,
    },
    {
      accessorKey: "perfil_riesgo",
      header: "Riesgo",
      cell: ({ row }) => {
        const riesgoRaw = row.getValue("perfil_riesgo")
        const riesgo = riesgoRaw ? riesgoRaw.toString().toLowerCase() : ""

        const getRiskBadge = () => {
          switch (riesgo) {
            case "bajo":
              return (
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 border border-green-200">
                  <Shield className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-800">
                    Bajo
                  </span>
                </div>
              )
            case "medio":
              return (
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 border border-yellow-200">
                  <AlertTriangle className="w-3 h-3 text-yellow-600 mr-1" />
                  <span className="text-xs font-medium text-yellow-800">
                    Medio
                  </span>
                </div>
              )
            case "alto":
              return (
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 border border-red-200">
                  <XCircle className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-xs font-medium text-red-800">
                    Alto
                  </span>
                </div>
              )
            default:
              return (
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                  <span className="text-xs font-medium text-gray-600">-</span>
                </div>
              )
          }
        }

        return getRiskBadge()
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const direccion = row.getValue("direccion")
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/direcciones/${direccion}`)}
          >
            Ver detalle
          </Button>
        )
      },
    },
  ]
}
