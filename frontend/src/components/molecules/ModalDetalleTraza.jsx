"use client"

import { X, AlertTriangle, TrendingUp, Activity, Clock, Shield } from "lucide-react"

const ModalDetalleTraza = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null

  const getRiskColor = (perfil) => {
    switch (perfil?.toLowerCase()) {
      case "alto": return "text-red-600 bg-red-50"
      case "medio": return "text-yellow-600 bg-yellow-50"
      case "bajo": return "text-green-600 bg-green-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getActivityColor = (actividad) => {
    switch (actividad?.toLowerCase()) {
      case "reciente": return "text-blue-600 bg-blue-50"
      case "activa": return "text-green-600 bg-green-50"
      case "inactiva": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    
    // 🔹 Limpia microsegundos (".902182+00:00" → "+00:00")
    const cleaned = dateString.replace(/\.\d+/, "")
    
    const date = new Date(cleaned)
    if (isNaN(date.getTime())) return "N/A"

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }


  const formatBalance = (satoshis) => {
    if (satoshis === undefined || satoshis === null) return "0"
    return (satoshis / 100000000).toFixed(8)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Resultado del Rastreo</h2>
            <p className="text-sm text-gray-500 mt-1">Análisis forense de dirección blockchain</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dirección */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</label>
            <p className="text-sm font-mono text-gray-900 mt-1 break-all">{data?.direccion || "N/A"}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-lg ${getRiskColor(data?.perfil_riesgo)}`}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <div>
                  <p className="text-xs font-medium">Perfil de Riesgo</p>
                  <p className="text-sm font-bold capitalize">{data?.perfil_riesgo || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-lg ${getActivityColor(data?.actividad)}`}>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <div>
                  <p className="text-xs font-medium">Actividad</p>
                  <p className="text-sm font-bold capitalize">{data?.actividad || "N/A"}</p>
                </div>
              </div>
            </div>

            {data?.cantidad_reportes > 0 && (
              <div className="px-4 py-2 rounded-lg text-red-600 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <div>
                    <p className="text-xs font-medium">Reportes</p>
                    <p className="text-sm font-bold">{data.cantidad_reportes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-600 mb-1">Total Transacciones</p>
              <p className="text-2xl font-bold text-blue-900">{data?.n_tx || 0}</p>
              {data?.unconfirmed_n_tx > 0 && (
                <p className="text-xs text-blue-600 mt-1">+{data.unconfirmed_n_tx} sin confirmar</p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs font-medium text-green-600 mb-1">Total Recibido</p>
              <p className="text-2xl font-bold text-green-900">{formatBalance(data?.total_recibido)} BTC</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs font-medium text-orange-600 mb-1">Total Enviado</p>
              <p className="text-2xl font-bold text-orange-900">{formatBalance(data?.total_enviado)} BTC</p>
            </div>
          </div>

          {/* Balance final */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Balance Final</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{formatBalance(data?.final_balance)} BTC</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-300" />
            </div>
            {data?.unconfirmed_balance > 0 && (
              <p className="text-xs text-purple-600 mt-2">+{formatBalance(data.unconfirmed_balance)} BTC sin confirmar</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase">Primera Transacción</p>
              </div>
              <p className="text-sm text-gray-900 font-medium">{formatDate(data?.primer_tx)}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase">Última Transacción</p>
              </div>
              <p className="text-sm text-gray-900 font-medium">{formatDate(data?.ultima_tx)}</p>
            </div>
          </div>

          {/* Ponderaciones */}
          {data?.ponderaciones && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Sistema de Ponderación</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Reportes</p>
                  <p className="text-xl font-bold text-gray-900">{data.ponderaciones.reportes}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Categorías</p>
                  <p className="text-xl font-bold text-gray-900">{data.ponderaciones.categorias}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Actividad</p>
                  <p className="text-xl font-bold text-gray-900">{data.ponderaciones.actividad}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-bold text-green-700">{data.ponderaciones.total}</p>
                </div>
              </div>
            </div>
          )}

          {/* Última actualización */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            Último análisis de riesgo: {formatDate(data?.ultimo_update_riesgo)}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cerrar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800">
            Exportar Reporte
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalDetalleTraza
