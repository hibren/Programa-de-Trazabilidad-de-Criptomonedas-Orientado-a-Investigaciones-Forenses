"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import { useAuth } from "@/contexts/AuthContext"

export default function MonitoreoLayout({ children }) {
  const { token, loading } = useAuth()
  const pathname = usePathname()

  const tabs = [
    { id: "alertas", label: "Alertas", href: "/monitoreo/alertas" },
    { id: "monitoreo", label: "Monitoreo", href: "/monitoreo/monitoreo" },
    { id: "reglas", label: "Reglas", href: "/monitoreo/reglas" },
    { id: "notificaciones", label: "Notificaciones", href: "/monitoreo/notificaciones" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-6">
            Debe iniciar sesión para acceder a esta página.
          </p>
          <Link href="/login" className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500 transition-colors px-6 py-2">
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

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
