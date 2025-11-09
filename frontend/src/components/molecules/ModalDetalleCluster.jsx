"use client"

import { X, Network, Tag, AlertTriangle } from "lucide-react"

const ModalDetalleCluster = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Network className="h-5 w-5 text-green-600" />
            Detalle del Cluster Detectado
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Dirección Base</p>
            <p className="font-mono text-gray-900 break-all">{data.direccion?.[0] || "N/A"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Wallet ID</p>
              <p className="font-medium">{data.wallet_id || "Desconocido"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Etiqueta</p>
              <p className="font-medium">{data.label || "Sin etiqueta"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Tipo de Riesgo</p>
              <p className="font-medium flex items-center gap-1">
                {data.tipo_riesgo || "No definido"}
                {data.tipo_riesgo && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Última actualización</p>
              <p className="font-medium">
                {data.updated_to_block ? `Bloque ${data.updated_to_block}` : "N/A"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Descripción</p>
            <p className="text-gray-800">{data.descripcion || "No se encontró descripción disponible."}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalDetalleCluster
