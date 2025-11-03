"use client"

import { X, Clock, ArrowDownCircle } from "lucide-react"

const ModalDetalleTraza = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const d = new Date(dateString)
    return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Resultado del Rastreo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">Dirección Analizada</p>
            <p className="font-mono text-gray-900">{data?.direccion}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Tipo</p>
              <p className="font-medium capitalize">{data?.actividad}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Total conexiones</p>
              <p className="font-medium">{data?.cantidad_reportes || 0}</p>
            </div>
          </div>

          {/* 🔍 Tabla de Conexiones */}
          {data?.conexiones && data.conexiones.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-green-600" />
                Conexiones encontradas
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2">Nivel</th>
                      <th className="px-3 py-2">Desde</th>
                      <th className="px-3 py-2">Hacia</th>
                      <th className="px-3 py-2">Monto</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.conexiones.map((c, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">{c.nivel}</td>
                        <td className="px-3 py-2 font-mono text-xs">{c.desde}</td>
                        <td className="px-3 py-2 font-mono text-xs">{c.hacia}</td>
                        <td className="px-3 py-2">{c.monto} BTC</td>
                        <td className="px-3 py-2 capitalize">{c.estado}</td>
                        <td className="px-3 py-2 text-xs">{formatDate(c.fecha)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            Fecha de análisis: {formatDate(data?.ultimo_update_riesgo)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalDetalleTraza
