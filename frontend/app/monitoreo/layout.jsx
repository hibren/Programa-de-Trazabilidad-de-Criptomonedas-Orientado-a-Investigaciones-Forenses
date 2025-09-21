"use client"

import React, { useState } from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { TabNavigation, TabsList, TabsTrigger } from "@/components/molecules/TabNavigation"

export default function MonitoreoLayout({ children }) {
  const [activeTab, setActiveTab] = useState("alertas")

  const tabs = [
    { id: "alertas", label: "Alertas Activas" },
    { id: "historial", label: "Historial de Alertas" },
    { id: "reglas", label: "Reglas de Monitoreo" },
    { id: "clusters", label: "Clusters Sospechosos" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="monitoreo" />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Monitoreo y Alertas"
          subtitle="Supervisión continua y detección de eventos sospechosos"
        />

        {/* Tabs */}
        <TabNavigation value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </TabNavigation>
      </div>
    </div>
  )
}
