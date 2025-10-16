"use client"

import React from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function AnalisisLayout({ children }) {
  const { token, loading } = useAuth()
  const pathname = usePathname()

  const tabs = [
    { id: "trazabilidad", label: "Trazabilidad", href: "/analisis" },
    { id: "patrones", label: "Patrones", href: "/analisis/patrones" },
    { id: "filtros", label: "Filtros", href: "/analisis/filtros" },
    { id: "grafo", label: "Grafo", href: "/analisis/grafo" },
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
      {/* 🧭 Barra lateral */}
      <Sidebar activeItem="grafos" />

      {/* Contenido principal */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* 🔝 Barra superior */}
        <TopBar
          title="Análisis y Trazabilidad"
          subtitle="Análisis de flujos de fondos y detección de patrones sospechosos"
        />

        {/* 🟩 Tabs principales */}
        <div className="border-b bg-white px-6 mt-3">
          <div className="flex gap-6 overflow-x-auto no-scrollbar text-sm font-medium text-gray-600">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`pb-3 border-b-2 transition-colors ${
                    isActive
                      ? "border-green-600 text-green-700"
                      : "border-transparent hover:text-green-600"
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* 🧩 Contenido dinámico */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</div>
      </div>
    </div>
  )
}
