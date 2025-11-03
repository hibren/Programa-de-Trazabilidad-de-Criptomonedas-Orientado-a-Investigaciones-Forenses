"use client"

import { Badge } from "@/components/ui/badge"

export const getColumnsPatronesCasos = () => [
  {
    accessorKey: "descripcion",
    header: "Descripción del Análisis",
  },
  {
    accessorKey: "riesgo",
    header: "Nivel de Riesgo",
    cell: ({ row }) => {
        const riesgo = row.getValue("riesgo")
        let colorClasses = "bg-gray-200 text-gray-800 hover:bg-gray-200" // Default
        if (riesgo === "Alto") colorClasses = "bg-yellow-500 text-white hover:bg-yellow-500/80"
        if (riesgo === "Muy Alto") colorClasses = "bg-red-600 text-white hover:bg-red-600/80"
        if (riesgo === "Crítico") colorClasses = "bg-red-800 text-white hover:bg-red-800/80"
        
        return <Badge className={colorClasses}>{riesgo}</Badge>
    }
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de Detección",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "cluster.direccion",
    header: "Direcciones Involucradas",
    cell: ({ row }) => {
      const direcciones = row.original.cluster?.direccion || [];
      // Se usa un contenedor con scroll horizontal para compactar la vista
      // cuando hay muchas direcciones.
      return (
        <div className="flex flex-nowrap gap-1 max-w-xs overflow-x-auto pb-2">
          {direcciones.map((direccion, index) => (
            <Badge key={index} variant="outline" className="font-mono text-xs">
              {direccion}
            </Badge>
          ))}
        </div>
      );
    },
  },
];
