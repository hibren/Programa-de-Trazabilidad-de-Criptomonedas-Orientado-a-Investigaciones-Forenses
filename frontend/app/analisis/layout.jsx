"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Network, AlertTriangle, Share2, Shield } from "lucide-react"

export default function AnalisisLayout({ children }) {
  const { token, loading } = useAuth()
  const pathname = usePathname()

  const tabs = [
    { id: "trazabilidad", label: "Trazabilidad", href: "/analisis/trazabilidad" },
    { id: "patrones", label: "Patrones", href: "/analisis/patrones" },
    { id: "analisis", label: "Análisis", href: "/analisis/analisisforense" },
    { id: "grafo", label: "Grafo", href: "/analisis/grafo" },
  ]

  const [stats, setStats] = useState([
    {
      title: "Trazas Activas",
      value: "—",
      subtitle: "Cargando...",
      icon: <Network className="h-6 w-6 text-gray-400" />,
    },
    {
      title: "Patrones Detectados",
      value: "—",
      subtitle: "Cargando...",
      icon: <AlertTriangle className="h-6 w-6 text-gray-400" />,
    },
    {
      title: "Relaciones Encontradas",
      value: "—",
      subtitle: "Cargando...",
      icon: <Share2 className="h-6 w-6 text-gray-400" />,
    },
    {
      title: "Casos Críticos",
      value: "—",
      subtitle: "Cargando...",
      icon: <Shield className="h-6 w-6 text-gray-400" />,
    },
  ])

  // 🔹 Función de carga de métricas CON TOKEN
  const fetchStats = async () => {
    if (!token) {
      console.log("⚠️ No hay token disponible aún")
      return
    }

    try {
      // 🔐 Headers con autenticación
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      const [trazasRes, patronesRes, relacionesRes, direccionesRes] = await Promise.all([
        fetch("http://localhost:8000/trazabilidad/trazas", { headers }),
        fetch("http://localhost:8000/patrones/", { headers }),
        fetch("http://localhost:8000/relaciones/", { headers }),
        fetch("http://localhost:8000/direcciones/", { headers }),
      ])

      // Verificar si alguna respuesta falló
      if (!trazasRes.ok) console.error("❌ Error en trazas:", await trazasRes.text())
      if (!patronesRes.ok) console.error("❌ Error en patrones:", await patronesRes.text())
      if (!relacionesRes.ok) console.error("❌ Error en relaciones:", await relacionesRes.text())
      if (!direccionesRes.ok) console.error("❌ Error en direcciones:", await direccionesRes.text())

      const [trazasData, patronesData, relacionesData, direccionesData] = await Promise.all([
        trazasRes.ok ? trazasRes.json() : { trazas: [] },
        patronesRes.ok ? patronesRes.json() : { patrones: [] },
        relacionesRes.ok ? relacionesRes.json() : { relaciones: [] },
        direccionesRes.ok ? direccionesRes.json() : { direcciones: [] },
      ])

      console.log("✅ Trazas:", trazasData)
      console.log("🧩 Patrones:", patronesData)
      console.log("🔗 Relaciones:", relacionesData)
      console.log("📍 Direcciones:", direccionesData)

      // 🔹 Normaliza estructuras
      const trazas = trazasData.trazas || []
      const patrones = Array.isArray(patronesData)
        ? patronesData
        : patronesData.patrones || []
      const relaciones = Array.isArray(relacionesData)
        ? relacionesData
        : relacionesData.relaciones || []
      const direcciones = Array.isArray(direccionesData)
        ? direccionesData
        : direccionesData.direcciones || []

      // 🔹 Conteo de casos críticos
      const casosCriticos = direcciones.filter(
        (d) => d.perfil_riesgo?.toLowerCase() === "crítico"
      ).length

      // 🔹 Actualiza métricas
      setStats([
        {
          title: "Trazas Activas",
          value: trazas.length,
          subtitle: `+${trazas.length} registradas`,
          icon: <Network className="h-6 w-6 text-gray-500" />,
        },
        {
          title: "Patrones Detectados",
          value: patrones.length,
          subtitle: `${patrones.length > 0 ? "+" + patrones.length : "0"} analizados`,
          icon: <AlertTriangle className="h-6 w-6 text-gray-500" />,
        },
        {
          title: "Relaciones Encontradas",
          value: relaciones.length,
          subtitle: `${relaciones.length > 0 ? "+" + relaciones.length : "0"} detectadas`,
          icon: <Share2 className="h-6 w-6 text-gray-500" />,
        },
        {
          title: "Casos Críticos",
          value: casosCriticos,
          subtitle: casosCriticos > 0 ? "Requieren atención" : "Sin casos activos",
          icon: <Shield className="h-6 w-6 text-gray-500" />,
        },
      ])
    } catch (err) {
      console.error("❌ Error al obtener métricas:", err)
    }
  }

  // 🔁 Efecto con actualización automática cada 60s
  useEffect(() => {
    if (token) {
      fetchStats() // Primera carga inmediata
      const interval = setInterval(fetchStats, 60000) // Actualiza cada 60 segundos
      return () => clearInterval(interval) // Limpia intervalo al desmontar
    }
  }, [token]) // 🔥 Dependencia del token para recargar cuando esté disponible

  // 🔒 Manejo de autenticación
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            Debe iniciar sesión para acceder a esta página.
          </p>
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500 transition-colors px-6 py-2"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🧭 Sidebar */}
      <Sidebar activeItem="grafos" />

      {/* 📄 Contenido principal */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* 🔝 Barra superior */}
        <TopBar
          title="Análisis y Trazabilidad"
          subtitle="Análisis de flujos de fondos, patrones y relaciones detectadas"
        />

        {/* 🟩 Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex gap-6 overflow-x-auto no-scrollbar text-sm font-medium text-gray-600">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`py-3 border-b-2 transition-colors ${
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

        {/* 📊 Métricas dinámicas */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm text-gray-500">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      stat.subtitle.includes("atención")
                        ? "text-red-600"
                        : stat.subtitle.startsWith("+")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.subtitle}
                  </p>
                </div>
                <div>{stat.icon}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔽 Contenido dinámico */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</div>
      </div>
    </div>
  )
}