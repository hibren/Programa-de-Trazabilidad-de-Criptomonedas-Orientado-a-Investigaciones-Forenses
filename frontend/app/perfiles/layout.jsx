"use client"

import React, { useState } from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { TabNavigation, TabsList, TabsTrigger } from "@/components/molecules/TabNavigation"

export default function PerfilesLayout({ children }) {
  const [activeTab, setActiveTab] = useState("direcciones")

  const tabs = [
    { id: "direcciones", label: "Direcciones" },
    { id: "transacciones", label: "Transacciones" },
    { id: "clusters", label: "Clusters" },
    { id: "monitoreo", label: "Monitoreo" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="perfiles" />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Perfiles de Riesgo"
          subtitle="Scoring y monitoreo continuo de direcciones, transacciones y clusters"
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
