"use client"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"

const TopBar = ({
  title = "Dashboard Principal",
  subtitle = "Monitoreo y análisis de blockchain en tiempo real",
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0 pr-2">
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate hidden sm:block">
            {subtitle}
          </p>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {/* Botón Conectar Billetera - Compacto en móvil */}
          <Button variant="success" className="px-2 sm:px-4 py-1.5 sm:py-2">
            <Icon name="bell" size={14} className="sm:hidden" />
            <Icon name="bell" size={16} className="hidden sm:block sm:mr-2" />
            <span className="hidden sm:inline text-xs sm:text-sm">Conectar Billetera</span>
          </Button>

          {/* Usuario Avatar */}
          <Button variant="ghost" size="icon" className="p-1.5 sm:p-2">
            <Icon name="user" size={18} />
          </Button>

          {/* Nombre del usuario - solo desktop */}
          <div className="hidden lg:block text-sm text-gray-600 whitespace-nowrap max-w-[120px] truncate">
            Carlos Mendoza
          </div>

          {/* Botón Cerrar Sesión - Responsivo */}
          <Button variant="outline" className="hidden sm:flex px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            <span className="sm:hidden">Salir</span>
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>

          {/* Menu button para móvil muy pequeño */}
          <Button variant="ghost" size="icon" className="sm:hidden p-1.5">
            <Icon name="menu" size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TopBar