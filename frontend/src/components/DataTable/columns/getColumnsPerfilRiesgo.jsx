"use client"

import {
  ArrowUpDown,
  Shield,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

export const getColumnsPerfilRiesgo = (setSelected) => {
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
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-800 break-all">
          {row.getValue("direccion")}
        </span>
      ),
    },
    {
      accessorKey: "perfil_riesgo",
      header: "Nivel de Riesgo",
      cell: ({ row }) => {
        const nivel = row.getValue("perfil_riesgo")?.toLowerCase()
        const colorMap = {
          crítico: "bg-red-100 border-red-200 text-red-800",
          alto: "bg-orange-100 border-orange-200 text-orange-800",
          medio: "bg-yellow-100 border-yellow-200 text-yellow-800",
          bajo: "bg-green-100 border-green-200 text-green-800",
        }
        const iconMap = {
          crítico: <XCircle className="w-3 h-3 mr-1 text-red-600" />,
          alto: <AlertTriangle className="w-3 h-3 mr-1 text-orange-600" />,
          medio: <Shield className="w-3 h-3 mr-1 text-yellow-600" />,
          bajo: <Shield className="w-3 h-3 mr-1 text-green-600" />,
        }

        return (
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full border ${
              colorMap[nivel] ||
              "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {iconMap[nivel] || null}
            <span className="text-xs font-medium capitalize">
              {nivel || "N/A"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "ultimo_update_riesgo",
      header: "Última Actualización",
      cell: ({ row }) => {
        const fecha = row.getValue("ultimo_update_riesgo")
        return (
          <span className="text-xs text-gray-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            {fecha ? new Date(fecha).toLocaleString() : "—"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const direccion = row.getValue("direccion")
        const data = row.original

        return (
          <div className="flex justify-end gap-1">
            {/* Ver detalle de dirección */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-blue-100"
                    onClick={() => router.push(`/direcciones/${direccion}`)}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Ver dirección</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Ver motivo del riesgo */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-amber-100"
                    onClick={() => setSelected(data)}
                  >
                    <Info className="h-4 w-4 text-amber-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Ver motivo del riesgo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]
}
