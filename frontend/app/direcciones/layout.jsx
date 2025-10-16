"use client"

import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function DireccionesLayout({ children }) {
  const { token, loading } = useAuth()

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
