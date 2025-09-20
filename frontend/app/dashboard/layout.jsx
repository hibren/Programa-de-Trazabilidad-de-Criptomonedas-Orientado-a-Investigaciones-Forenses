"use client"

import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeItem="dashboard" />

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Dashboard Principal"
          subtitle="Monitoreo y análisis de blockchain en tiempo real"
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
