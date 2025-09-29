"use client"

import React, { useState } from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { TabNavigation, TabsList, TabsTrigger } from "@/components/molecules/TabNavigation"

export default function AnalisisLayout({ children }) {
  const [activeTab, setActiveTab] = useState("trazabilidad")

  const tabs = [
    { id: "trazabilidad", label: "Trazabilidad" },
    { id: "patrones", label: "Patrones" },
    { id: "filtros", label: "Filtros" },
    { id: "grafo", label: "Grafo" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="grafos" />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Análisis y Trazabilidad"
          subtitle="Análisis de flujos de fondos y detección de patrones sospechosos"
        />

        {/* Tabs en todo el ancho */}
        <TabNavigation value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 👇 Contenido de Grafos */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </TabNavigation>
      </div>
    </div>
  )
}
