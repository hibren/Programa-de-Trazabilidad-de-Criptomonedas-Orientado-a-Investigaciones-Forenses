import SearchBar from "../molecules/SearchBar"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"

const TopBar = ({ title = "Dashboard Principal", subtitle = "Monitoreo y análisis de blockchain en tiempo real" }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-4">
          <SearchBar placeholder="Buscar dirección, hash de transacción o número de bloque..." className="w-96" />

          <Button variant="success">
            <Icon name="bell" size={16} className="mr-2" />
            Conectar Billetera
          </Button>

          <Button variant="ghost" size="icon">
            <Icon name="user" size={20} />
          </Button>

          <div className="text-sm text-gray-600">Carlos Mendoza</div>

          <Button variant="outline" size="sm">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TopBar
