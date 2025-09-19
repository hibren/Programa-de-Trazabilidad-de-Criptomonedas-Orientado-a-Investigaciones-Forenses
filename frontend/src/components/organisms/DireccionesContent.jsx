"use client"

import { useState, useEffect } from "react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import SearchBar from "@/components/molecules/SearchBar"
import { DataTable } from "@/components/DataTable/DataTable"
import { getColumnsDirecciones } from "@/components/DataTable/columns/getColumnsDirecciones"
import { getDirecciones, fetchDireccionFromAPI } from "@/services/direccionesService"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"


const DireccionesContent = () => {
  const [activeTab, setActiveTab] = useState("direcciones")
  const [direcciones, setDirecciones] = useState([])
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState("")

  // Cargar direcciones desde BD
  const loadDirecciones = async () => {
    try {
      const data = await getDirecciones()
      setDirecciones(data)
    } catch (e) {
      console.error(e.message)
    }
  }

  // Importar desde API externa
  const handleImportar = async () => {
    if (!address) return
    try {
      await fetchDireccionFromAPI(address)
      await loadDirecciones()
      setAddress("")
      setOpen(false) // cerrar modal
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => {
    loadDirecciones()
  }, [])

  const tabs = [
    { id: "direcciones", label: "Direcciones" },
    { id: "transacciones", label: "Transacciones" },
    { id: "bloques", label: "Bloques" },
    { id: "historial", label: "Historial" },
  ]

const exportToExcel = () => {
  // filtrar solo las columnas que quieras exportar
  const data = direcciones.map(d => ({
    Dirección: d.direccion,
    "Entradas (BTC)": d.total_recibido,
    "Salidas (BTC)": d.total_enviado,
    "Perfil de Riesgo": d.perfil_riesgo,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Direcciones")
  XLSX.writeFile(workbook, "direcciones.xlsx")
}


// Exportar a PDF
const exportToPDF = () => {
  const doc = new jsPDF()
  doc.text("Direcciones Registradas", 14, 15)

  autoTable(doc, {
    startY: 20,
    head: [["Dirección", "Entradas", "Salidas", "Riesgo"]],
    body: direcciones.map((d) => [
      d.direccion,
      d.total_recibido,
      d.total_enviado,
      d.perfil_riesgo,
    ]),
  })

  doc.save("direcciones.pdf")
}



  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <TopBar
        title="Gestión de Direcciones"
        subtitle="Administra y monitorea direcciones blockchain"
      />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tabla */}
      <div className="bg-white mx-6 mt-6 rounded-lg shadow-sm p-6">
        {/* Título y botones alineados */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Direcciones Registradas
          </h2>

          <div className="flex items-center space-x-3">
            {/* Importar desde API */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Icon name="monitor" size={16} className="mr-2" />
                  Importar desde API
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Dirección</DialogTitle>
                  <DialogDescription>
                    Ingrese la dirección blockchain que desea importar desde la API externa.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Ej: 1BoatSLRHtKNngkdXEeobR76b53LETtpyT"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="success" onClick={handleImportar}>
                    Importar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Exportar datos */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Icon name="reports" size={16} className="mr-2" />
                    Exportar Datos
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
        </div>

        {/* DataTable */}
        <DataTable columns={getColumnsDirecciones()} data={direcciones} />
      </div>
    </div>
  )
}

export default DireccionesContent



