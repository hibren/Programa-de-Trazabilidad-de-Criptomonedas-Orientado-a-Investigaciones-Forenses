"use client"

import { FileText, Download, Calendar, LayoutGrid } from "lucide-react"
import StatCard from "../molecules/StatCard"

const ReportesContent = ({ activeTab, children }) => {
  // Podés traer estos datos del backend más adelante
  const stats = [
    {
      title: "Reportes Generados",
      value: "45",
      subtitle: "+8 esta semana",
      icon: <FileText className="h-6 w-6 text-gray-500" />,
    },
    {
      title: "Exportaciones",
      value: "23",
      subtitle: "+5 hoy",
      icon: <Download className="h-6 w-6 text-gray-500" />,
    },
    {
      title: "Programados",
      value: "12",
      subtitle: "Sin cambios",
      icon: <Calendar className="h-6 w-6 text-gray-500" />,
    },
    {
      title: "Plantillas",
      value: "8",
      subtitle: "+2 nuevas",
      icon: <LayoutGrid className="h-6 w-6 text-gray-500" />,
    },
  ]

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Dashboard superior */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    stat.subtitle.startsWith("+")
                      ? "text-green-600"
                      : stat.subtitle.includes("Sin")
                      ? "text-gray-500"
                      : "text-red-500"
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

      {/* Contenido de cada solapa */}
      <div>{children}</div>
    </div>
  )
}

export default ReportesContent
