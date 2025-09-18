"use client"

import { useState, useEffect } from "react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import DireccionesRow from "../molecules/DireccionesRow"
import SearchBar from "@/components/molecules/SearchBar"
import { getDirecciones, fetchDireccionFromAPI } from "@/services/direccionesService"

const DireccionesContent = () => {
  const [activeTab, setActiveTab] = useState("direcciones")
  const [searchQuery, setSearchQuery] = useState("")
  const [direcciones, setDirecciones] = useState([])

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
  const importarDesdeAPI = async () => {
    const address = prompt("Ingrese la dirección a importar desde la API:")
    if (!address) return
    try {
      await fetchDireccionFromAPI(address)
      await loadDirecciones()
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
          <Button variant="outline" onClick={importarDesdeAPI}>
            <Icon name="monitor" size={16} className="mr-2" />
            Importar desde API
          </Button>
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

