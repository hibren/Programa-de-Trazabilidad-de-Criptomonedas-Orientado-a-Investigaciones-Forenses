"use client"

import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import React
 from "react"
export default function DireccionesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeItem="direcciones" />

      <div className="md:ml-64 flex flex-col flex-1">
        <TopBar
          title="Gestión de Direcciones"
          subtitle="Administra y monitorea direcciones blockchain"
        />
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
