"use client"

import { useState } from "react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import DireccionesRow from "../molecules/DireccionesRow"
import SearchBar from "@/components/molecules/SearchBar"

const DireccionesContent = () => {
  const [activeTab, setActiveTab] = useState("direcciones")
  const [searchQuery, setSearchQuery] = useState("")

  const tabs = [
    { id: "direcciones", label: "Direcciones" },
    { id: "transacciones", label: "Transacciones" },
    { id: "bloques", label: "Bloques" },
    { id: "historial", label: "Historial" },
  ]

  const direcciones = [
    {
      direccion: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      balance: "50.00000000 BTC",
      ultimaActividad: "2024-01-15",
      transacciones: "1247",
      entradas: "892",
      salidas: "355",
      nivelRiesgo: "Bajo",
    },
    {
      direccion: "3J98t1pEZ73CNmQviecrnyiWrnqRhWNLy",
      balance: "12.50000000 BTC",
      ultimaActividad: "2024-01-14",
      transacciones: "892",
      entradas: "445",
      salidas: "447",
      nivelRiesgo: "Alto",
    },
    {
      direccion: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
      balance: "0.00000000 BTC",
      ultimaActividad: "2024-01-13",
      transacciones: "2156",
      entradas: "1078",
      salidas: "1078",
      nivelRiesgo: "Medio",
    },
  ]

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header con título personalizado */}
      <TopBar 
        title="Gestión de Direcciones"
        subtitle="Administra y monitorea direcciones blockchain"
      />

      {/* Search Bar */}
      <div className="p-6 pb-0">
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar dirección, hash de transacción o número de bloque..."
            className="w-full max-w-md"
            onSearch={(query) => setSearchQuery(query)}
          />
        </div>
      </div>

      {/* Tab Navigation and Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Action Buttons */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Button variant="success">
            <span className="mr-2">+</span>
            Registrar Dirección
          </Button>
          <Button variant="outline">
            <Icon name="monitor" size={16} className="mr-2" />
            Importar desde API
          </Button>
          <Button variant="outline">
            <Icon name="reports" size={16} className="mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white mx-6 mt-6 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Direcciones Registradas</h2>
          <p className="text-sm text-gray-600">Gestión y visualización de direcciones blockchain</p>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 py-3 px-6 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div>Dirección</div>
          <div className="text-center">Transacciones</div>
          <div className="text-center">Entradas</div>
          <div className="text-center">Salidas</div>
          <div className="text-center">Riesgo</div>
        </div>

        {/* Address Rows */}
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

