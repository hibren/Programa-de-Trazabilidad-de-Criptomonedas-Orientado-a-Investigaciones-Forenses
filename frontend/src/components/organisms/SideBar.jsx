import NavItem from "../molecules/NavItem"

const Sidebar = ({ activeItem = "dashboard" }) => {
  const navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "directions", icon: "directions", label: "Direcciones" },
    { id: "transactions", icon: "transactions", label: "Transacciones" },
    { id: "graphs", icon: "graphs", label: "Grafos" },
    { id: "risk", icon: "risk", label: "Perfiles de Riesgo" },
    { id: "monitor", icon: "monitor", label: "Monitoreo y Alertas" },
    { id: "reports", icon: "reports", label: "Reportes" },
    { id: "admin", icon: "admin", label: "Administración" },
  ]

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
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeItem === item.id} />
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
