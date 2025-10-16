"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import NavItem from "../molecules/NavItem"
import { Menu, X, LogOut, LayoutDashboard, Wallet, Send, BarChart3, Users, BellRing, FileText, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const iconMap = {
  home: LayoutDashboard,
  wallet: Wallet,
  send: Send,
  barchart3: BarChart3,
  users: Users,
  bellring: BellRing,
  filetext: FileText,
  shield: Shield,
  direcciones: "directions",
  transacciones: "transactions",
  analisis: "graphs",
  perfiles: "risk",
  monitoreo: "monitor",
  reportes: "reports",
  administracion: "admin"
};

const Sidebar = ({ activeItem }) => {
  const [currentActive, setCurrentActive] = useState(activeItem);
  const [isOpen, setIsOpen] = useState(false);
  const { perfil, logout } = useAuth();
  const router = useRouter();

  const allNavItems = [
    { id: "direcciones", icon: "directions", label: "Direcciones", href: "/direcciones" },
    { id: "transacciones", icon: "transactions", label: "Transacciones", href: "/transacciones" },
    { id: "analisis", icon: "graphs", label: "Análisis", href: "/analisis" },
    { id: "perfiles", icon: "risk", label: "Perfiles de Riesgo", href: "/perfiles" },
    { id: "monitoreo", icon: "monitor", label: "Monitoreo y Alertas", href: "/monitoreo" },
    { id: "reportes", icon: "reports", label: "Reportes", href: "/reportes" },
    { id: "administracion", icon: "admin", label: "Administración", href: "/administracion" },
  ];

  // Filtra los items de navegación basado en los permisos del perfil
  const navItems = perfil?.modulos
    ? allNavItems.filter(item => {
        if (item.id === 'perfiles') {
          // "Perfiles de Riesgo" depende de análisis y direcciones
          return (
            perfil.modulos.some(m => m.ruta.startsWith('/analisis')) ||
            perfil.modulos.some(m => m.ruta.startsWith('/direcciones'))
          );
        }
        // Para el resto, usar la lógica general
        return perfil.modulos.some(m => m.ruta.startsWith(item.href));
      })
    : [];

  const handleItemClick = (id) => {
    setCurrentActive(id);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* botón hamburguesa (solo mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-green-800 text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[55] w-64 bg-green-800 p-4 h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo → Link al Dashboard */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:opacity-80">
            <div className="relative w-10 h-10">
              <Image
                src="/icono.png"
                alt="BlockAnalyzer"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <span className="font-bold text-lg">BlockAnalyzer</span>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="space-y-2 flex-1">
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

        {/* Botón Cerrar Sesión siempre abajo */}
        <div className="mt-auto border-t border-green-700 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar;

/*
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import NavItem from "../molecules/NavItem"
import { Menu, X, LogOut } from "lucide-react"

const Sidebar = ({ activeItem }) => {
  const [currentActive, setCurrentActive] = useState(activeItem)
  const [isOpen, setIsOpen] = useState(false)

  // 🔹 Ya no incluimos "dashboard" en el menú
  const navItems = [
    { id: "direcciones", icon: "directions", label: "Direcciones", href: "/direcciones" },
    { id: "transacciones", icon: "transactions", label: "Transacciones", href: "/transacciones" },
    { id: "analisis", icon: "graphs", label: "Análisis", href: "/analisis" },
    { id: "risk", icon: "risk", label: "Perfiles de Riesgo", href: "/perfiles" },
    { id: "monitor", icon: "monitor", label: "Monitoreo y Alertas", href: "/monitoreo" },
    { id: "reports", icon: "reports", label: "Reportes", href: "/reportes" },
    { id: "admin", icon: "admin", label: "Administración", href: "/administracion" },
  ]

  const handleItemClick = (id) => {
    setCurrentActive(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* botón hamburguesa (solo mobile) *}
      <button
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-green-800 text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* overlay mobile *}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* SIDEBAR *}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[55] w-64 bg-green-800 p-4 h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo → Link al Dashboard *}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:opacity-80">
            <div className="relative w-10 h-10">
              <Image
                src="/icono.png"
                alt="BlockAnalyzer"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <span className="font-bold text-lg">BlockAnalyzer</span>
          </Link>
        </div>

        {/* Navegación *}
        <nav className="space-y-2 flex-1">
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

        {/* Botón Cerrar Sesión siempre abajo *}
        <div className="mt-auto border-t border-green-700 pt-4">
          <button
            onClick={() => console.log("Cerrar sesión")}
            className="flex items-center gap-2 w-full text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar


*/