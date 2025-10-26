"use client"

import { useState, useEffect } from "react"
import { Link2, Download, Eye, ShieldAlert, Globe2, Coins, FileWarning } from "lucide-react"

const TrazabilidadList = () => {
  const [trazas, setTrazas] = useState([])
  const [trazaActiva, setTrazaActiva] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/trazabilidad/trazas")
        const data = await res.json()
        setTrazas(data.trazas || [])
      } catch (error) {
        console.error("Error al cargar trazas:", error)
      }
    }
    fetchData()
  }, [])

  const toggleDetalles = (hash) => {
    setTrazaActiva(trazaActiva === hash ? null : hash)
  }

  const exportarAnalisis = (hash) => {
    alert(`📄 Exportando análisis de la transacción ${hash}...`)
  }

  // ✅ Colores de riesgo
  const getRiesgoColor = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case "alto":
        return "bg-red-500"
      case "medio":
        return "bg-yellow-400"
      case "bajo":
        return "bg-green-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Link2 className="h-4 w-4 text-gray-500" />
        <h2 className="font-medium text-gray-700">Resultados de Trazabilidad</h2>
      </div>

      {/* Lista */}
      <div className="space-y-3 px-5 pb-5 pt-3">
        {trazas.length === 0 ? (
          <p className="text-gray-500 text-sm">No se encontraron trazas.</p>
        ) : (
          trazas.map((trace, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              {/* Cabecera principal */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded">
                      {trace.hash?.slice(0, 10)}...
                    </span>
                    <span
                      className={`text-xs text-white px-2 py-0.5 rounded ${getRiesgoColor(trace.perfil_riesgo)}`}
                    >
                      Riesgo {trace.perfil_riesgo || "desconocido"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Estado:</strong> {trace.estado}
                  </p>

                  <p className="text-sm text-gray-600">
                    <strong>Monto total:</strong> {trace.monto_total} BTC
                  </p>

                  {/* Categorías */}
                  {trace.categorias_denuncia?.length > 0 && (
                    <div className="mt-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Categorías de denuncia:</p>
                      <div className="flex flex-wrap gap-1">
                        {trace.categorias_denuncia.map((cat, i) => (
                          <span
                            key={i}
                            className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reportes */}
                  {trace.reportes_totales > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      🧾 Reportes: {trace.reportes_totales} totales ({trace.reportes_verificados} verificados,{" "}
                      {trace.reportes_no_verificados} sin verificar)
                    </p>
                  )}
                </div>

                {/* Monto total */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">{trace.monto_total}</p>
                  <p className="text-xs text-gray-500">BTC</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleDetalles(trace.hash)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalles
                </button>
                <button
                  onClick={() => exportarAnalisis(trace.hash)}
                  className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-md border border-green-300 transition"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              </div>

              {/* 🔽 Sección Detalles Expandible */}
              {trazaActiva === trace.hash && (
                <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4 text-gray-500" />
                    Detalles del Bloque
                  </h4>

                  {trace.bloque ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 text-sm text-gray-600">
                      <p>
                        <strong>ID:</strong> {trace.bloque.id}
                      </p>
                      <p>
                        <strong>Número:</strong> {trace.bloque.numero_bloque}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {new Date(trace.bloque.fecha).toLocaleString()}
                      </p>
                      <p className="col-span-2 sm:col-span-3">
                        <strong>Hash:</strong> {trace.bloque.hash}
                      </p>
                      <p>
                        <strong>Recompensa:</strong> {trace.bloque.recompensa_total} BTC
                      </p>
                      <p>
                        <strong>Volumen:</strong> {trace.bloque.volumen_total} BTC
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Sin datos de bloque.</p>
                  )}

                  {/* Origen / Destino */}
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-700 flex items-center gap-1">
                      <Coins className="h-4 w-4 text-gray-500" />
                      Direcciones
                    </h5>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Origen</p>
                        {trace.origen?.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {trace.origen.map((o, i) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500">No disponible</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Destino</p>
                        {trace.destino?.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {trace.destino.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500">No disponible</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dominios */}
                  {trace.dominios_asociados?.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-700 flex items-center gap-1">
                        <Globe2 className="h-4 w-4 text-gray-500" /> Dominios Relacionados
                      </h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {trace.dominios_asociados.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patrones Sospechosos */}
                  {trace.patrones_sospechosos?.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-700 flex items-center gap-1">
                        <FileWarning className="h-4 w-4 text-gray-500" /> Patrones Sospechosos
                      </h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {trace.patrones_sospechosos.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TrazabilidadList
