"use client"

import { useState } from "react"
import { Link2, Download, Eye } from "lucide-react"

const trazas = [
  {
    id: "trace_001",
    riesgo: "Alto",
    riesgoColor: "bg-red-500",
    origen: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    destino: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    patrones: ["Layering", "Mixer"],
    monto: "12.5 BTC",
    saltos: "5 saltos",
    fecha: "2024-01-15 14:30:00",
    detalles: {
      flujo: [
        { tipo: "Origen", direccion: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", monto: "12.5 BTC" },
        { tipo: "Mixer", direccion: "bc1qa8rr7xfvkvy51643lydnw9fe599tzzwf5mdq", monto: "12.48 BTC" },
        { tipo: "Intermediario", direccion: "3F2bg129cg2pjGJdw8EyhJuJnkLtkTzd5", monto: "12.45 BTC" },
        { tipo: "Intermediario", direccion: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT", monto: "12.42 BTC" },
        { tipo: "Destino", direccion: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", monto: "12.38 BTC" },
      ],
      indicadores: [
        "Uso de servicio mixer",
        "Múltiples saltos rápidos",
        "Montos decrecientes (fees)",
      ],
    },
  },
  {
    id: "trace_002",
    riesgo: "Medio",
    riesgoColor: "bg-yellow-400",
    origen: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVt2",
    destino: "bc1qxyz6ydgy3jrqztq2mbyf249q83kkfjhx0wlh",
    patrones: ["Smurfing"],
    monto: "0.5 BTC",
    saltos: "3 saltos",
    fecha: "2024-01-14 10:15:00",
    detalles: {
      flujo: [
        { tipo: "Origen", direccion: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVt2", monto: "0.5 BTC" },
        { tipo: "Intermediario", direccion: "bc1qabcde1234xyz5678lmno9prstuvw0", monto: "0.49 BTC" },
        { tipo: "Destino", direccion: "bc1qxyz6ydgy3jrqztq2mbyf249q83kkfjhx0wlh", monto: "0.48 BTC" },
      ],
      indicadores: ["Transacciones pequeñas frecuentes", "Reducción de montos (fees)"],
    },
  },
]

const TrazabilidadList = () => {
  const [trazaActiva, setTrazaActiva] = useState(null)

  const toggleDetalles = (id) => {
    setTrazaActiva(trazaActiva === id ? null : id)
  }

  const exportarAnalisis = (id) => {
    alert(`📄 Exportando análisis de ${id}...`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Link2 className="h-4 w-4 text-gray-500" />
        <h2 className="font-medium text-gray-700">Resultados de Trazabilidad</h2>
      </div>
      <p className="text-sm text-gray-500 px-5 pt-2 pb-4">
        Flujos de fondos detectados desde origen a destino
      </p>

      <div className="space-y-3 px-5 pb-5">
        {trazas.map((trace) => (
          <div
            key={trace.id}
            className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-start">
              {/* Información general */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded">
                    {trace.id}
                  </span>
                  <span
                    className={`text-xs text-white px-2 py-0.5 rounded ${trace.riesgoColor}`}
                  >
                    {trace.riesgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Origen:</strong> {trace.origen}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Destino:</strong> {trace.destino}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Patrones detectados:</strong>{" "}
                  {trace.patrones.map((p, i) => (
                    <span
                      key={i}
                      className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded mr-1"
                    >
                      {p}
                    </span>
                  ))}
                </p>
                <p className="text-xs text-gray-400 mt-1">{trace.fecha}</p>
              </div>

              {/* Monto total */}
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-800">{trace.monto}</p>
                <p className="text-xs text-gray-500">{trace.saltos}</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toggleDetalles(trace.id)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition"
              >
                <Eye className="h-4 w-4" />
                Ver Detalles Completos
              </button>
              <button
                onClick={() => exportarAnalisis(trace.id)}
                className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-md border border-green-300 transition"
              >
                <Download className="h-4 w-4" />
                Exportar Análisis
              </button>
            </div>

            {/* Sección de detalles expandibles */}
            {trazaActiva === trace.id && (
              <div className="mt-5 border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Link2 className="h-4 w-4 text-gray-500" />
                  Flujo de Fondos (Camino Completo)
                </h3>

                <div className="space-y-2 mb-4">
                  {trace.detalles.flujo.map((f, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-white border border-gray-100 rounded-md px-3 py-2"
                    >
                      <p className="text-sm text-gray-700 truncate w-2/3">
                        {f.direccion}{" "}
                        <span className="text-xs text-gray-500 ml-2">({f.tipo})</span>
                      </p>
                      <p className="text-sm font-semibold text-gray-800">{f.monto}</p>
                    </div>
                  ))}
                </div>

                <h4 className="font-medium text-gray-700 mb-2">Indicadores Forenses</h4>
                <div className="space-y-1">
                  {trace.detalles.indicadores.map((ind, i) => (
                    <p
                      key={i}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-md"
                    >
                      {ind}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrazabilidadList
