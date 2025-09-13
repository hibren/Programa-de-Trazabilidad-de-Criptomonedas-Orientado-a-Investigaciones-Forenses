"use client"

import { useState } from "react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import Badge from "../atoms/Badge"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import SearchBar from "@/components/molecules/SearchBar"
import StatCard from "../molecules/StatCard"

const TransaccionesContent = () => {
  const [activeTab, setActiveTab] = useState("recientes")
  const [searchQuery, setSearchQuery] = useState("")

  const tabs = [
    { id: "recientes", label: "Recientes" },
    { id: "pendientes", label: "Pendientes" },
    { id: "alto-riesgo", label: "Alto Riesgo" },
    { id: "analisis", label: "Análisis" },
  ]

  const stats = [
    {
      title: "Total Transacciones",
      value: "89,432",
      subtitle: "Procesadas por el sistema",
      icon: "transactions",
      trend: { positive: true, value: "+5.2%" },
    },
    {
      title: "Pendientes",
      value: "23",
      subtitle: "Esperando confirmación",
      icon: "pending",
      trend: { positive: false, value: "+3" },
    },
    {
      title: "Alto Riesgo",
      value: "156",
      subtitle: "Requieren atención",
      icon: "risk",
      trend: { positive: false, value: "+12" },
    },
    {
      title: "BTC Volumen",
      value: "1,247.8",
      subtitle: "Volumen total procesado",
      icon: "bitcoin",
      trend: { positive: true, value: "+8.9%" },
    },
  ]

  const transacciones = [
    {
      hash: "000000000001f9d66f85e608...",
      tipo: "Alto",
      confirmaciones: 6,
      desde: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      hacia: "3j3HqWiZT2DeGVeeXyRmRHqWqY",
      monto: "12.50000000 BTC",
      fee: "0.00001000 BTC",
      fecha: "2024-01-16 14:39:25"
    },
    {
      hash: "141B41fc59640f3b9d6387...",
      tipo: "Bajo",
      confirmaciones: 12,
      desde: "1BvBMSEVstWetqTFn5Au4m4GFg7xJaNVN2",
      hacia: "bc1qxy0vrxgrzqcb42by41243r3k",
      monto: "0.50000000 BTC",
      fee: "0.00000500 BTC",
      fecha: "2024-01-15 13:18:16"
    }
  ]

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* TopBar personalizado para Transacciones */}
      <TopBar 
        title="Gestión de Transacciones"
        subtitle="Gestión y análisis de transacciones blockchain"
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
          <p className="text-sm text-gray-600">Últimas transacciones procesadas por el sistema.</p>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-gray-200">
          {transacciones.map((tx, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <code className="text-sm font-mono text-gray-900">{tx.hash}</code>
                    <Badge variant={tx.tipo === "Alto" ? "danger" : "success"}>
                      {tx.tipo}
                    </Badge>
                    <span className="text-xs text-gray-500">{tx.confirmaciones} confirmaciones</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">De:</span> 
                      <code className="ml-2 text-xs">{tx.desde}</code>
                    </div>
                    <div>
                      <span className="font-medium">A:</span> 
                      <code className="ml-2 text-xs">{tx.hacia}</code>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{tx.monto}</div>
                  <div className="text-sm text-gray-500">Fee: {tx.fee}</div>
                  <div className="text-xs text-gray-400">{tx.fecha}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TransaccionesContent