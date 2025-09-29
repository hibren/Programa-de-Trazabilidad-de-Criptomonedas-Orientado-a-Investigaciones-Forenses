"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/DataTable/DataTable"
import { getColumnsAnalisis } from "@/components/DataTable/columns/getColumnsAnalisis"
import { useToast } from "@/components/ui/use-toast"
import { XCircle } from "lucide-react"
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

const API_URL = "http://localhost:8000" // 👈 ajusta si tu backend corre en otro host/puerto

const AnalisisContent = () => {
  const [analisis, setAnalisis] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Stats de ejemplo
  const stats = [
    {
      title: "Trazas Activas",
      value: analisis.length.toString(),
      subtitle: "En proceso de análisis",
      icon: "activity",
      trend: { positive: true, value: `+${analisis.length}` },
    },
    {
      title: "Promedio",
      value: "-",
      subtitle: "Saltos promedio",
      icon: "trending-up",
      trend: { positive: false, value: "-0.3" },
    },
    {
      title: "BTC Rastreado",
      value: "-",
      subtitle: "Volumen total",
      icon: "bitcoin",
      trend: { positive: true, value: "+15.2%" },
    },
    {
      title: "Alertas Críticas",
      value: "-",
      subtitle: "Requieren revisión",
      icon: "alert-triangle",
      trend: { positive: false, value: "+8" },
    },
  ]

  // 🔗 cargar análisis
  const loadAnalisis = async () => {
    try {
      const res = await fetch(`${API_URL}/analisis/`)
      if (!res.ok) throw new Error("Error cargando análisis")
      const data = await res.json()
      setAnalisis(data)
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
        description: "No se pudieron cargar los análisis.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalisis()
  }, [])

  // Exportar a Excel
  const exportToExcel = () => {
    const data = analisis.map((a) => ({
      ID: a._id,
      Riesgo: a.riesgo,
      "BTC Total": a.btc_total,
      Saltos: a.saltos,
      Origen: a.origen,
      Destino: a.destino,
      Creado: a.createdAt ? new Date(a.createdAt).toLocaleString() : "-",
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Análisis")
    XLSX.writeFile(workbook, "analisis.xlsx")
  }

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text("Resultados de Análisis", 14, 15)

    autoTable(doc, {
      startY: 20,
      head: [["ID", "Riesgo", "BTC", "Saltos", "Origen", "Destino", "Creado"]],
      body: analisis.map((a) => [
        a._id,
        a.riesgo,
        a.btc_total,
        a.saltos,
        a.origen,
        a.destino,
        a.createdAt ? new Date(a.createdAt).toLocaleString() : "-",
      ]),
    })

    doc.save("analisis.pdf")
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

      {/* Tabla de análisis */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Resultados de Análisis
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
          columns={getColumnsAnalisis()}
          data={analisis}
          filterColumn="_id"
        />

        {loading && <p className="text-gray-500 mt-4">Cargando...</p>}
      </div>
    </div>
  )
}

export default AnalisisContent


