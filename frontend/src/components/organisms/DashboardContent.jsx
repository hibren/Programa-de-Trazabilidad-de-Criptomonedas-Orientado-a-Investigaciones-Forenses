"use client"
import { useState } from "react"
import SearchBar from "../molecules/SearchBar"
import StatCard from "../molecules/StatCard"
import Icon from "../atoms/Icon"
import Badge from "../atoms/Badge"

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    {
      title: "Direcciones Vigiladas",
      value: "1,247",
      subtitle: "+12% desde el mes pasado",
      icon: "directions",
      trend: { positive: true, value: "+12%" },
    },
    {
      title: "Alertas Activas",
      value: "23",
      subtitle: "+4 alertas hoy",
      icon: "bell",
      trend: { positive: false, value: "+4" },
    },
    {
      title: "Transacciones Analizadas",
      value: "89,432",
      subtitle: "+4.2% esta semana",
      icon: "transactions",
      trend: { positive: true, value: "+4.2%" },
    },
    {
      title: "Riesgo Promedio",
      value: "Medio",
      subtitle: "+2.1% mejora semanal",
      icon: "risk",
      trend: { positive: true, value: "+2.1%" },
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Buscar dirección, hash de transacción o número de bloque..."
          className="w-full max-w-md"
          onSearch={(query) => setSearchQuery(query)}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direcciones Vigiladas */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="directions" size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Direcciones Vigiladas</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Direcciones bajo monitoreo activo</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-mono text-sm">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</p>
                <p className="text-xs text-gray-500">947 transacciones</p>
              </div>
              <Badge variant="success">Bajo</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-mono text-sm">3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</p>
                <p className="text-xs text-gray-500">892 transacciones</p>
              </div>
              <Badge variant="danger">Alto</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-mono text-sm">1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2</p>
                <p className="text-xs text-gray-500">556 transacciones</p>
              </div>
              <Badge variant="warning">Medio</Badge>
            </div>
          </div>
        </div>

        {/* Alertas Recientes */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="bell" size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Alertas Recientes</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Actividad sospechosa detectada</p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-1 h-12 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-red-800">Alto Riesgo</p>
                <p className="text-xs text-red-600">Transacción sospechosa detectada</p>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-1 h-12 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-yellow-800">Nuevo Patrón</p>
                <p className="text-xs text-yellow-600">Patrón de lavado identificado</p>
              </div>
              <span className="text-xs text-gray-500">15 min ago</span>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-blue-800">Volumen Alto</p>
                <p className="text-xs text-blue-600">Volumen inusual en dirección vigilada</p>
              </div>
              <span className="text-xs text-gray-500">1 hora ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
