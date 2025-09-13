"use client"

import { useState } from "react"
import Button from "../atoms/Button"
import Input from "../atoms/Input"
import Icon from "../atoms/Icon"
import TopBar from "../organisms/TopBar"  // ajustá la ruta según tu estructura
import TabNavigation from "../molecules/TabNavigation"
import DireccionesRow from "../molecules/DireccionesRow"

const DirectionsContent = () => {
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
      {/* Header */}
      <TopBar />

      {/* Search and Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Icon
                name="search"
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Buscar dirección, hash de transacción o número de bloque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="success" size="sm" className="ml-4">
            <Icon name="search" size={16} className="mr-2" />
          </Button>
        </div>

        {/* Tab Navigation */}
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

export default DirectionsContent
