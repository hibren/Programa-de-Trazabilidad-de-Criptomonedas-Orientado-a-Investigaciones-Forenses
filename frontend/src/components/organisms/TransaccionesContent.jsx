"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import Badge from "../atoms/Badge"
import TopBar from "@/components/organisms/TopBar"
import TabNavigation from "../molecules/TabNavigation"
import SearchBar from "@/components/molecules/SearchBar"
import StatCard from "../molecules/StatCard"

const API_URL = "http://localhost:8000" // 👈 ajusta según tu backend

const TransaccionesContent = () => {
  const [activeTab, setActiveTab] = useState("recientes")
  const [searchQuery, setSearchQuery] = useState("")
  const [transacciones, setTransacciones] = useState([])
  const router = useRouter()

  const tabs = [
    { id: "recientes", label: "Recientes" },
    { id: "pendientes", label: "Pendientes" },
    { id: "alto-riesgo", label: "Alto Riesgo" },
    { id: "analisis", label: "Análisis" },
  ]

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
    try {
      const res = await fetch(`${API_URL}/transacciones`)
      if (!res.ok) throw new Error("Error cargando transacciones")
      const data = await res.json()
      setTransacciones(data)
    } catch (err) {
      console.error(err)
    }
  }

  // 🔗 buscar por dirección o hash
  const onSearch = async (query) => {
    setSearchQuery(query)
    if (!query) return loadTransacciones()

    try {
      // 1) buscar por dirección
      let res = await fetch(`${API_URL}/direcciones/${query}/transacciones`)
      if (res.ok) {
        const data = await res.json()
        return setTransacciones(data)
      }

      // 2) si no es dirección, buscar por hash de transacción
      res = await fetch(`${API_URL}/transacciones/${query}`)
      if (res.ok) {
        const data = await res.json()
        return setTransacciones([data])
      }
    } catch (err) {
      console.error("Error en búsqueda:", err)
    }
  }

  useEffect(() => {
    loadTransacciones()
  }, [])

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* TopBar */}
      <TopBar
        title="Gestión de Transacciones"
        subtitle="Gestión y análisis de transacciones blockchain"
      />

      {/* Search */}
      <div className="p-6 pb-0">
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar dirección, hash de transacción o número de bloque..."
            className="w-full max-w-md"
            onSearch={onSearch}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Stats */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Lista de transacciones */}
      <div className="bg-white mx-6 mt-2 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
          <p className="text-sm text-gray-600">
            Últimas transacciones procesadas por el sistema.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {transacciones.map((tx, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-start justify-between">
                {/* Izquierda */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <code className="text-sm font-mono text-gray-900">{tx.hash}</code>
                    <Badge
                      variant={
                        tx.patrones_sospechosos?.length > 0
                          ? "danger"
                          : "success"
                      }
                    >
                      {tx.patrones_sospechosos?.length > 0 ? "Alto" : "Bajo"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {tx.confirmations} confirmaciones
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">De:</span>
                      {tx.inputs?.map((d, i) => (
                        <code
                          key={i}
                          className="ml-2 text-xs text-blue-600 cursor-pointer"
                          onClick={() => router.push(`/direcciones/${d}`)}
                        >
                          {d}
                        </code>
                      ))}
                    </div>
                    <div>
                      <span className="font-medium">A:</span>
                      {tx.outputs?.map((d, i) => (
                        <code
                          key={i}
                          className="ml-2 text-xs text-green-600 cursor-pointer"
                          onClick={() => router.push(`/direcciones/${d}`)}
                        >
                          {d}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Derecha */}
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {tx.monto_total} BTC
                  </div>
                  <div className="text-sm text-gray-500">Fee: {tx.fees} BTC</div>
                  <div className="text-xs text-gray-400">{tx.fecha}</div>
                </div>
              </div>
            </div>
          ))}

          {transacciones.length === 0 && (
            <div className="px-6 py-4 text-sm text-gray-500">
              No se encontraron transacciones.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransaccionesContent
