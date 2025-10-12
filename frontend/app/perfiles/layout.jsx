"use client"

import React from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"

export default function PerfilesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeItem="perfiles" />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 md:ml-64">
        <TopBar
          title="Perfiles de Riesgo"
          subtitle="Scoring y monitoreo continuo de direcciones, transacciones y clusters"
        />

        {/* Contenedor del contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
