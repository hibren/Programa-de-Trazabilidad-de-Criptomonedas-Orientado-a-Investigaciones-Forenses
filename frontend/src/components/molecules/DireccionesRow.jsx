import Badge from "../atoms/Badge"

const DireccionesRow = ({ direccion, balance, ultimaActividad, transacciones, entradas, salidas, nivelRiesgo }) => {
  const getRiskVariant = (riesgo) => {
    switch (riesgo.toLowerCase()) {
      case "bajo":
        return "success"
      case "medio":
        return "warning"
      case "alto":
        return "danger"
      default:
        return "default"
    }
  }

  return (
    <div className="grid grid-cols-6 gap-6 py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="col-span-2 flex flex-col min-w-0">
        <span className="font-mono text-sm text-gray-900 truncate">{direccion}</span>
        <span className="text-xs text-gray-500">Balance: {balance}</span>
        <span className="text-xs text-gray-500">Última actividad: {ultimaActividad}</span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-gray-900">{transacciones}</span>
        <span className="text-xs text-gray-500">Transacciones</span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-gray-900">{entradas}</span>
        <span className="text-xs text-gray-500">Entradas</span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-gray-900">{salidas}</span>
        <span className="text-xs text-gray-500">Salidas</span>
      </div>

      <div className="flex items-center justify-center">
        <Badge variant={getRiskVariant(nivelRiesgo)}>{nivelRiesgo}</Badge>
      </div>
    </div>
  )
}

export default DireccionesRow
