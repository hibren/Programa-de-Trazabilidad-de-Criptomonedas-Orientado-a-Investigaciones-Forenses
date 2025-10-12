"use client"

import { ArrowUpDown, Shield, AlertTriangle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
          <span className="font-mono text-xs text-gray-800 break-all">
            {direccion}
          </span>
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
              case "crítico":
                return (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 border border-purple-200">
                    <XCircle className="w-3 h-3 text-purple-700 mr-1" />
                    <span className="text-xs font-medium text-purple-800">
                      Crítico
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
      header: "", // 👈 sin texto de encabezado
      cell: ({ row }) => {
        const direccion = row.getValue("direccion")
        return (
          <div className="flex justify-end">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-green-100"
                    onClick={() => router.push(`/direcciones/${direccion}`)}
                  >
                    <Eye className="h-4 w-4 text-green-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs text-gray-700">Ver detalle</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]
}
