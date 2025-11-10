"use client"

import { X, Network, AlertTriangle, Shield, TrendingUp } from "lucide-react"

const ModalDetalleCluster = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null

  const {
    direccion_base,
    direccion = [],
    wallet_id,
    label,
    tipo_riesgo,
    puntaje_total,
    categorias_detectadas = [],
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

  // ✅ Función para determinar el color según el nivel de riesgo
  const getRiesgoColor = (riesgo) => {
    if (!riesgo) return "bg-gray-100 text-gray-600"
    const nivel = riesgo.toLowerCase()
    if (nivel.includes("alto") || nivel.includes("high")) return "bg-red-100 text-red-700"
    if (nivel.includes("medio") || nivel.includes("medium")) return "bg-yellow-100 text-yellow-700"
    if (nivel.includes("bajo") || nivel.includes("low")) return "bg-green-100 text-green-700"
    return "bg-gray-100 text-gray-600"
  }

  // ✅ Icono según el nivel de riesgo
  const getRiesgoIcon = (riesgo) => {
    if (!riesgo) return <Shield className="h-4 w-4" />
    const nivel = riesgo.toLowerCase()
    if (nivel.includes("alto") || nivel.includes("high")) return <AlertTriangle className="h-4 w-4" />
    if (nivel.includes("medio") || nivel.includes("medium")) return <TrendingUp className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
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

        {/* ✅ SECCIÓN DE ANÁLISIS DE RIESGO */}
        {tipo_riesgo && (
          <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Análisis de Riesgo
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Nivel de Riesgo */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${getRiesgoColor(tipo_riesgo)}`}>
                {getRiesgoIcon(tipo_riesgo)}
                <div>
                  <p className="text-xs font-medium">Nivel de Riesgo</p>
                  <p className="text-sm font-bold">{tipo_riesgo}</p>
                </div>
              </div>

              {/* Puntaje Total */}
              {puntaje_total !== undefined && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                  <p className="text-xs font-medium">Puntaje Total</p>
                  <p className="text-2xl font-bold">{puntaje_total}</p>
                </div>
              )}
            </div>

            {/* Categorías Detectadas */}
            {categorias_detectadas && categorias_detectadas.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Categorías de Riesgo Detectadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {categorias_detectadas.map((categoria, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"
                    >
                      {categoria}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
            <p className="text-xs text-gray-500">Direcciones en Cluster</p>
            <p className="text-sm font-medium text-gray-800">
              {cantidadDirecciones}
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
        {esClusterTransaccional && cantidadDirecciones > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Direcciones asociadas ({cantidadDirecciones})
            </h3>

            <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 text-sm font-mono text-gray-700">
              {direccion.map((dir, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-200 py-1 last:border-b-0 ${
                    dir === direccionBase
                      ? "text-green-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {dir}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalDetalleCluster