"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { DataTable } from "@/components/DataTable/DataTable"
import { getColumnsTransacciones } from "@/components/DataTable/columns/getColumnsTransacciones"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import StatCard from "../molecules/StatCard"

const API_URL = "http://localhost:8000" // 👈 ajusta según tu backend

const TransaccionesContent = () => {
  const [transacciones, setTransacciones] = useState([])
  const { toast } = useToast()
  const { token } = useAuth()

  const stats = [
    {
      title: "Total Transacciones",
      value: transacciones.length.toString(),
      subtitle: "Procesadas por el sistema",
      icon: "transactions",
      trend: { positive: true, value: "+5.2%" },
    },
    {
      title: "Pendientes",
      value: transacciones.filter((t) => t.estado === "pendiente").length.toString(),
      subtitle: "Esperando confirmación",
      icon: "pending",
      trend: { positive: false, value: "+3" },
    },
    {
      title: "Alto Riesgo",
      value: transacciones.filter((t) => t.patrones_sospechosos?.length > 0).length.toString(),
      subtitle: "Requieren atención",
      icon: "risk",
      trend: { positive: false, value: "+12" },
    },
    {
      title: "BTC Volumen",
      value: transacciones
        .reduce((acc, t) => acc + (t.monto_total || 0), 0)
        .toFixed(4),
      subtitle: "Volumen total procesado",
      icon: "bitcoin",
      trend: { positive: true, value: "+8.9%" },
    },
  ]

  // 🔗 cargar transacciones
  const loadTransacciones = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/transacciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Error cargando transacciones")
      const data = await res.json()
      setTransacciones(data)
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Error</span>
          </div>
        ),
        description: "No se pudieron cargar las transacciones.",
      })
    }
  }
  
  useEffect(() => {
    loadTransacciones()
  }, [token])

  // Exportar a Excel
  const exportToExcel = () => {
    const data = transacciones.map((t) => ({
      Hash: t.hash,
      "Monto (BTC)": t.monto_total,
      "Fee (BTC)": t.fees,
      Confirmaciones: t.confirmations,
      Riesgo: t.patrones_sospechosos?.length > 0 ? "Alto" : "Bajo",
      Fecha: t.fecha,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transacciones")
    XLSX.writeFile(workbook, "transacciones.xlsx")
  }

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text("Transacciones Registradas", 14, 15)

    autoTable(doc, {
      startY: 20,
      head: [["Hash", "Monto", "Fee", "Confirmaciones", "Riesgo", "Fecha"]],
      body: transacciones.map((t) => [
        t.hash,
        t.monto_total,
        t.fees,
        t.confirmations,
        t.patrones_sospechosos?.length > 0 ? "Alto" : "Bajo",
        t.fecha,
      ]),
    })

    doc.save("transacciones.pdf")
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Stats */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transacciones Recientes
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Icon name="reports" size={16} className="mr-2" />
                <span className="hidden sm:inline">Exportar Datos</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DataTable
          columns={getColumnsTransacciones()}
          data={transacciones}
          filterColumn="hash"
        />
      </div>
    </div>
  )
}

export default TransaccionesContent
