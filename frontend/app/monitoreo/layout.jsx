"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"

export default function MonitoreoLayout({ children }) {
  const pathname = usePathname()

  const tabs = [
    { id: "alertas", label: "Alertas", href: "/monitoreo/alertas" },
    { id: "monitoreo", label: "Monitoreo", href: "/monitoreo/monitoreo" },
    { id: "reglas", label: "Reglas", href: "/monitoreo/reglas" },
    { id: "notificaciones", label: "Notificaciones", href: "/monitoreo/notificaciones" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="monitoreo" />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Monitoreo y Alertas"
          subtitle="Supervisión continua y detección de eventos sospechosos"
        />

        {/* Tabs de navegación (links reales) */}
        <div className="border-b flex space-x-4 px-6 pt-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`pb-2 text-sm font-medium ${
                  isActive
                    ? "border-b-2 border-green-600 text-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Contenido dinámico (children = página seleccionada) */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
