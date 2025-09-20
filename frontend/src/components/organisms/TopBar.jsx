"use client"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"

const TopBar = ({
  title = "Dashboard Principal",
  subtitle = "Monitoreo y análisis de blockchain en tiempo real",
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Botón Conectar Billetera */}
          <Button variant="success" className="text-xs sm:text-sm px-2 sm:px-4">
            <Icon name="bell" size={16} className="sm:mr-2" />
            <span className="hidden sm:inline ml-1">Conectar Billetera</span>
          </Button>

          {/* Usuario Avatar */}
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Icon name="user" size={20} />
          </Button>

          {/* Nombre del usuario - solo en pantallas medianas */}
          <div className="hidden md:block text-sm text-gray-600 whitespace-nowrap">
            Carlos Mendoza
          </div>

          {/* Botón Cerrar Sesión */}
          <Button variant="outline" size="sm" className="hidden sm:flex text-xs sm:text-sm">
            <span className="hidden lg:inline">Cerrar Sesión</span>
            <span className="lg:hidden">Salir</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Alternative - Solo en móviles muy pequeños */}
      <div className="sm:hidden mt-3 flex justify-center">
        <Button variant="outline" size="sm" className="text-xs w-full max-w-[200px]">
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default TopBar