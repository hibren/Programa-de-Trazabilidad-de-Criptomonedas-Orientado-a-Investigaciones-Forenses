import Badge from "../atoms/Badge"

const DireccionesRow = ({ direccion, balance, total_recibido, total_enviado, perfil_riesgo }) => {
  const getRiskVariant = (riesgo) => {
    if (!riesgo) return "default"
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
    <div className="grid grid-cols-5 gap-6 py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
  {/* Dirección + Balance ocupa 2 columnas */}
  <div className="col-span-2 flex flex-col min-w-0">
    <span className="font-mono text-sm text-gray-900">{direccion}</span>
    <span className="text-xs text-gray-500">Balance: {balance}</span>
  </div>

  {/* Entradas */}
  <div className="flex flex-col items-center justify-center">
    <span className="text-lg font-semibold text-gray-900">{total_recibido}</span>
    <span className="text-xs text-gray-500">Total Recibido</span>
  </div>

  {/* Salidas */}
  <div className="flex flex-col items-center justify-center">
    <span className="text-lg font-semibold text-gray-900">{total_enviado}</span>
    <span className="text-xs text-gray-500">Total Enviado</span>
  </div>

  {/* Riesgo */}
  <div className="flex items-center justify-center">
    <Badge variant={getRiskVariant(perfil_riesgo)}>{perfil_riesgo}</Badge>
  </div>
</div>

  )
}

export default DireccionesRow

