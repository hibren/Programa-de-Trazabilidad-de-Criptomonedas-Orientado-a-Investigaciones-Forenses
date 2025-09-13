"use client"

import { useState } from "react"
import NavItem from "../molecules/NavItem"

const Sidebar = ({ activeItem = "dashboard" }) => {
  const [currentActive, setCurrentActive] = useState(activeItem)

  const navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "direcciones", icon: "directions", label: "Direcciones", href: "/direcciones" },
    { id: "transacciones", icon: "transactions", label: "Transacciones", href: "/transacciones" },
    { id: "grafos", icon: "graphs", label: "Grafos", href: "/grafos" },
    { id: "risk", icon: "risk", label: "Perfiles de Riesgo", href: "/riesgo" },
    { id: "monitor", icon: "monitor", label: "Monitoreo y Alertas", href: "/monitoreo" },
    { id: "reports", icon: "reports", label: "Reportes", href: "/reportes" },
    { id: "admin", icon: "admin", label: "Administración", href: "/admin" },
  ]

  const handleItemClick = (itemId) => {
    setCurrentActive(itemId)
  }

  return (
    <div className="w-64 bg-green-800 min-h-screen p-4">
      {/* Logo/Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-green-800 font-bold text-sm">BA</span>
          </div>
          <span className="font-bold text-lg">BlockAnalyzer</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavItem 
            key={item.id} 
            icon={item.icon} 
            label={item.label} 
            href={item.href}
            active={currentActive === item.id}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
      </nav>
    </div>
  )
}

export default Sidebar