"use client"

import { X, Network } from "lucide-react"

const ModalDetalleCluster = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null

  const {
    direccion_base,
    direccion = [],
    wallet_id,
    label,
    tipo_riesgo,
    descripcion,
    updated_to_block,
  } = data

  // ✅ Dirección base (prioriza el campo dedicado)
  const direccionBase =
    direccion_base || (direccion.length > 0 ? direccion[0] : "Desconocida")
  const cantidadDirecciones = direccion.length

  // ✅ Mostrar lista solo si el cluster es por transacciones
  const esClusterTransaccional =
    descripcion &&
    descripcion.toLowerCase().includes("transaccion")

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="text-green-700 h-5 w-5" />
            <h2 className="text-lg font-semibold text-gray-800">
              Detalle del Cluster Detectado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dirección base */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">Dirección Base</h3>
          <p className="font-mono text-sm text-green-700 break-all font-semibold">
            {direccionBase}
          </p>
        </div>

        {/* Info resumen */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Wallet ID</p>
            <p className="text-sm font-medium text-gray-800">
              {wallet_id || "Desconocido"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Etiqueta</p>
            <p className="text-sm font-medium text-gray-800">
              {label || "Sin etiqueta"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Tipo de Riesgo</p>
            <p className="text-sm font-medium text-gray-800">
              {tipo_riesgo || "No definido"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Última actualización</p>
            <p className="text-sm font-medium text-gray-800">
              {updated_to_block ? updated_to_block : "N/A"}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">Descripción</h3>
          <p className="text-sm text-gray-800">
            {descripcion ||
              `Cluster detectado mediante coincidencia de transacciones (${cantidadDirecciones} direcciones encontradas).`}
          </p>
        </div>

        {/* Mostrar solo si el cluster es por transacciones */}
        {esClusterTransaccional && (
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Direcciones asociadas ({cantidadDirecciones})
            </h3>

            {cantidadDirecciones > 0 ? (
              <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 text-sm font-mono text-gray-700">
                {direccion.map((dir, index) => (
                  <div
                    key={index}
                    className={`border-b border-gray-200 py-1 ${
                      dir === direccionBase
                        ? "text-green-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {dir}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay direcciones asociadas registradas.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalDetalleCluster
