"use client"

import { X, ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react"

const ModalDetalleRastreo = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const d = new Date(dateString)
    return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
  }

  const tipo = data.tipo || "rastreo"
  const conexiones = Array.isArray(data.resultado)
  ? data.resultado
  : Array.isArray(data.conexiones)
  ? data.conexiones
  : []
  const color =
    tipo === "origen" ? "text-blue-700" : tipo === "destino" ? "text-green-700" : "text-gray-700"
  const Icono =
    tipo === "origen"
      ? ArrowUpCircle
      : tipo === "destino"
      ? ArrowDownCircle
      : Clock

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Icono className={`h-5 w-5 ${color}`} />
            {tipo === "origen"
              ? "Rastreo de Origen"
              : tipo === "destino"
              ? "Análisis de Destino"
              : "Detalle del Rastreo"}
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
          {/* Dirección principal */}
          <div>
            <p className="text-sm text-gray-500 font-medium">Dirección Analizada</p>
            <p className="font-mono text-gray-900 break-all">
              {data.direccion_inicial || data.direccion || "N/A"}
            </p>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Tipo</p>
              <p className="font-medium capitalize">{tipo}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Total conexiones</p>
              <p className="font-medium">{data.total_conexiones || 0}</p>
            </div>
          </div>

          {/* 🔍 Tabla de Conexiones */}
          {conexiones.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <Icono className={`h-5 w-5 ${color}`} />
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
                    {conexiones.map((c, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">{c.nivel ?? "-"}</td>
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
          ) : (
            <p className="text-gray-500 text-sm text-center">
              No se encontraron conexiones registradas.
            </p>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            Fecha de análisis: {formatDate(data.fecha_analisis || data.ultimo_update_riesgo)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalDetalleRastreo
