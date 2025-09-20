"use client"

import { useState } from "react"
import Image from "next/image"
import NavItem from "../molecules/NavItem"
import { Menu, X } from "lucide-react"

const Sidebar = ({ activeItem = "dashboard" }) => {
  const [currentActive, setCurrentActive] = useState(activeItem)
  const [isOpen, setIsOpen] = useState(false)

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
    setIsOpen(false)
  }

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-800 text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-green-800 p-4 transform
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex-shrink-0
        `}
      >
        {/* Logo/Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-10 h-10 relative">
              <Image
                src="/icono.png"
                alt="BlockAnalyzer Icon"
                fill
                className="object-cover rounded-full"
                priority
              />
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
    </>
  )
}

export default Sidebar
