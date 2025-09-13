"use client"

import { useState } from "react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import Badge from "../atoms/Badge"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import SearchBar from "@/components/molecules/SearchBar"
import StatCard from "../molecules/StatCard"

const GrafosContent = () => {
  const [activeTab, setActiveTab] = useState("trazabilidad")
  const [searchQuery, setSearchQuery] = useState("")

  const tabs = [
    { id: "trazabilidad", label: "Trazabilidad" },
    { id: "patrones", label: "Patrones" },
    { id: "filtros", label: "Filtros" },
    { id: "grafo", label: "Grafo" },
  ]

  const stats = [
    {
      title: "Trazas Activas",
      value: "127",
      subtitle: "En proceso de análisis",
      icon: "activity",
      trend: { positive: true, value: "+12" },
    },
    {
      title: "Promedio",
      value: "8.5",
      subtitle: "Saltos promedio",
      icon: "trending-up",
      trend: { positive: false, value: "-0.3" },
    },
    {
      title: "BTC Rastreado",
      value: "245.8",
      subtitle: "Volumen total",
      icon: "bitcoin",
      trend: { positive: true, value: "+15.2%" },
    },
    {
      title: "Alertas Críticas",
      value: "46",
      subtitle: "Requieren revisión",
      icon: "alert-triangle",
      trend: { positive: false, value: "+8" },
    },
  ]

  const trazabilidadResults = [
    {
      id: "trace_001",
      status: "Alto",
      origen: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      destino: "3j3HqWiZT2DeGVeeXyRmRHqWqY",
      patrones: "Layering, Mixer",
      monto: "12.5 BTC",
      saltos: "6 saltos",
      fechaCreacion: "2024-01-16 14:39:25"
    },
    {
      id: "trace_002",
      status: "Medio",
      origen: "bc1qxy0vrxgrzqcb42by41243r3k",
      destino: "bc1qz7x2qnygrxdmc2nhy4z2bf3dc5k1fmxrth",
      patrones: "Structuring",
      monto: "0.5 BTC",
      saltos: "3 saltos",
      fechaCreacion: "2024-01-15 13:18:16"
    },
  ]

  const renderTrazabilidadContent = () => (
    <>
      {/* Action Buttons */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="primary" size="sm">
            <Icon name="plus" size="sm" />
            Iniciar Análisis
          </Button>
          <Button variant="secondary" size="sm">
            <Icon name="list" size="sm" />
            Nueva Trazabilidad
          </Button>
          <Button variant="secondary" size="sm">
            <Icon name="download" size="sm" />
            Exportar Resultados
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Resultados de Trazabilidad</h3>
        <p className="text-sm text-gray-600 mb-4">
          Resultado técnico desarrollado: nueva origen y destino
        </p>

        <div className="space-y-4">
          {trazabilidadResults.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-900">{result.id}</span>
                  <Badge variant={result.status === "Alto" ? "danger" : "warning"}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{result.monto}</div>
                  <div className="text-sm text-gray-500">{result.saltos}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Origen:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {result.origen}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Destino:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {result.destino}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Patrones identificados:</span>
                  <span className="ml-2">{result.patrones}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Creado: {result.fechaCreacion}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "trazabilidad":
        return renderTrazabilidadContent()
      case "patrones":
        return (
          <div className="px-6 py-8 text-center">
            <Icon name="search" size="lg" className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis de Patrones</h3>
            <p className="text-gray-600">Contenido de análisis de patrones en desarrollo</p>
          </div>
        )
      case "filtros":
        return (
          <div className="px-6 py-8 text-center">
            <Icon name="filter" size="lg" className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Filtros Avanzados</h3>
            <p className="text-gray-600">Panel de configuración de filtros en desarrollo</p>
          </div>
        )
      case "grafo":
        return (
          <div className="px-6 py-8 text-center">
            <Icon name="git-branch" size="lg" className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Visualización de Grafo</h3>
            <p className="text-gray-600">Herramienta de visualización en desarrollo</p>
          </div>
        )
      default:
        return renderTrazabilidadContent()
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* TopBar personalizado para Grafos */}
      <TopBar 
        title="Análisis y Trazabilidad"
        subtitle="Análisis de flujos de fondos y detección de patrones sospechosos"
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Stats Cards */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default GrafosContent