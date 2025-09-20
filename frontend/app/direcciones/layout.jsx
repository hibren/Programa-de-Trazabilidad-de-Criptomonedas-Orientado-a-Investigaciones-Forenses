"use client"

import React from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { TabNavigation, TabsList, TabsTrigger } from "@/components/molecules/TabNavigation"

export default function DireccionesLayout({ children }) {
  const [activeTab, setActiveTab] = React.useState("direcciones")

  const tabs = [
    { id: "direcciones", label: "Direcciones" },
    { id: "transacciones", label: "Transacciones" },
    { id: "bloques", label: "Bloques" },
    { id: "historial", label: "Historial" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="direcciones" />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Gestión de Direcciones"
          subtitle="Administra y monitorea direcciones blockchain"
        />

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

