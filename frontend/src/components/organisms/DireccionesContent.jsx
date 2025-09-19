"use client"

import { useState, useEffect } from "react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import DireccionesRow from "../molecules/DireccionesRow"
import SearchBar from "@/components/molecules/SearchBar"
import { getDirecciones, fetchDireccionFromAPI } from "@/services/direccionesService"

// shadcn dialog
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

const DireccionesContent = () => {
  const [activeTab, setActiveTab] = useState("direcciones")
  const [searchQuery, setSearchQuery] = useState("")
  const [direcciones, setDirecciones] = useState([])

  // Estado del Dialog
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

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <TopBar 
        title="Gestión de Direcciones"
        subtitle="Administra y monitorea direcciones blockchain"
      />

      {/* Search */}
      <div className="p-6 pb-0">
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar dirección, hash de transacción o número de bloque..."
            className="w-full max-w-md"
            onSearch={(query) => setSearchQuery(query)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Botones de acción */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
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

          <Button variant="outline">
            <Icon name="reports" size={16} className="mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white mx-6 mt-6 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Direcciones Registradas</h2>
          <p className="text-sm text-gray-600">Gestión y visualización de direcciones blockchain</p>
        </div>

        <div className="grid grid-cols-5 gap-4 py-3 px-6 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div className="col-span-2">Dirección</div>
          <div className="text-center">Entradas</div>
          <div className="text-center">Salidas</div>
          <div className="text-center">Riesgo</div>
        </div>

        <div>
          {direcciones.map((direccion, index) => (
            <DireccionesRow key={index} {...direccion} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DireccionesContent


