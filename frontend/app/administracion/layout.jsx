"use client"

import React, { useState } from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { TabNavigation, TabsList, TabsTrigger } from "@/components/molecules/TabNavigation"

export default function AdministracionLayout({ children }) {
  const [activeTab, setActiveTab] = useState("usuarios")

  const tabs = [
    { id: "usuarios", label: "Usuarios" },
    { id: "roles", label: "Roles y Permisos" },
    { id: "reglas", label: "Reglas de Riesgo" },
    { id: "alertas", label: "Alertas" },
    { id: "conectores", label: "Conectores Externos" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="administracion" />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Administración"
          subtitle="Gestión de usuarios, reglas y conectores"
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
