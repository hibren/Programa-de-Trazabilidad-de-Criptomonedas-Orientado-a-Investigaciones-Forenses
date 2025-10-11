"use client"

import React from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"

export default function AnalisisLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar lateral */}
      <Sidebar activeItem="grafos" />

      {/* Contenido principal */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Análisis y Trazabilidad"
          subtitle="Análisis de flujos de fondos y detección de patrones sospechosos"
        />

        {/* Contenido del módulo */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
