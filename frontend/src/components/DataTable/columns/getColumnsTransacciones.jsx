"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Badge from "@/components/atoms/Badge"

export const getColumnsTransacciones = () => {
  return [
    {
      accessorKey: "hash",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Hash
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const tx = row.original
        return (
          <div className="text-xs space-y-1">
            {/* Hash */}
            <code className="block font-mono text-blue-600">{tx.hash}</code>

            {/* Info secundaria */}
            <div className="text-gray-500 text-[11px]">
              Fee: {tx.fees} BTC · {tx.confirmations} confs
            </div>

            {/* De */}
            <div>
              <span className="font-medium">De:</span>{" "}
              {tx.inputs?.length > 0 ? (
                tx.inputs.map((addr, i) => (
                  <code
                    key={i}
                    className="ml-1 text-blue-600 text-[11px]"
                  >
                    {addr}
                  </code>
                ))
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>

            {/* A */}
            <div>
              <span className="font-medium">A:</span>{" "}
              {tx.outputs?.length > 0 ? (
                tx.outputs.map((addr, i) => (
                  <code
                    key={i}
                    className="ml-1 text-green-600 text-[11px]"
                  >
                    {addr}
                  </code>
                ))
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "monto_total",
      header: "Monto (BTC)",
      cell: ({ row }) => <span>{row.getValue("monto_total")} BTC</span>,
    },
    {
      accessorKey: "riesgo",
      header: "Riesgo",
      cell: ({ row }) => {
        const riesgo =
          row.original.patrones_sospechosos?.length > 0 ? "Alto" : "Bajo"

        return (
          <Badge variant={riesgo === "Alto" ? "danger" : "success"}>
            {riesgo}
          </Badge>
        )
      },
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const fechaRaw = row.getValue("fecha")
        if (!fechaRaw) return <span className="text-gray-400">-</span>

        const fecha = new Date(fechaRaw)
        const formateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`

        return <span>{formateada}</span>
      },
    },
  ]
}
