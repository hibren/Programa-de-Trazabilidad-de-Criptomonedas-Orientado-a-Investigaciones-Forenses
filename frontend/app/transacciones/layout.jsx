"use client"

import { useState } from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { TabNavigation, TabsList, TabsTrigger } from "@/components/molecules/TabNavigation"

export default function TransaccionesLayout({ children }) {
  const [activeTab, setActiveTab] = useState("recientes")

  const tabs = [
    { id: "recientes", label: "Recientes" },
    { id: "pendientes", label: "Pendientes" },
    { id: "alto-riesgo", label: "Alto Riesgo" },
    { id: "analisis", label: "Análisis" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fijo */}
      <Sidebar activeItem="transacciones" />

      {/* Contenido desplazado */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Gestión de Transacciones"
          subtitle="Gestión y análisis de transacciones blockchain"
        />

        {/* Tabs globales */}
        <TabNavigation value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Contenido de la página */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </TabNavigation>
      </div>
    </div>
  )
}
