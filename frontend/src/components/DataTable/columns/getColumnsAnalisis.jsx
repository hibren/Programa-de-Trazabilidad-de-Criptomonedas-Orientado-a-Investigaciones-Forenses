"use client"

import { Badge } from "@/components/ui/badge"
import { FileSearch } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

export const getColumnsAnalisis = () => [
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original._id.slice(-6)} {/* últimos 6 caracteres */}
      </span>
    ),
  },
  {
    accessorKey: "cluster.direccion",
    header: "Dirección",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.cluster?.direccion?.[0] || "-"}
      </span>
    ),
  },
  {
    accessorKey: "cluster.label",
    header: "Cluster Label",
    cell: ({ row }) => (
      <span>{row.original.cluster?.label || "-"}</span>
    ),
  },
  {
    accessorKey: "reportes",
    header: "Reportes",
    cell: ({ row }) => (
      <span>{row.original.reportes?.length || 0}</span>
    ),
  },
  {
    accessorKey: "riesgo",
    header: "Riesgo",
    cell: ({ row }) => {
      const riesgo = row.original.riesgo
      let color = "bg-gray-200 text-gray-800"

      if (riesgo === "Alto") color = "bg-red-100 text-red-800"
      if (riesgo === "Medio") color = "bg-yellow-100 text-yellow-800"
      if (riesgo === "Bajo") color = "bg-green-100 text-green-800"

      return (
        <Badge className={color}>
          {riesgo}
        </Badge>
      )
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <FileSearch className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver reportes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
]
