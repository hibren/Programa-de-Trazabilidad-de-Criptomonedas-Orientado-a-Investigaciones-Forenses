"use client"

import { useState } from "react"
import { AlertTriangle, Microscope, FileText, Search } from "lucide-react"

const patrones = [
  {
    id: "smurfing",
    nombre: "Smurfing",
    riesgo: "Alto",
    riesgoColor: "bg-green-600",
    instancias: 23,
    descripcion:
      "Desglose de fondos en múltiples transacciones pequeñas.",
    analisisForense:
      "Patrón detectado en direcciones con 20+ direcciones pequeñas que luego envían a una dirección final.",
    indicadores: ["Repeticiones frecuentes", "Fragmentación posterior"],
    ejemplo: "50 BTC → 20 x 2.5 BTC → 0.5 BTC (Destino Final)",
  },
  {
    id: "layering",
    nombre: "Layering",
    riesgo: "Muy Alto",
    riesgoColor: "bg-red-600",
    instancias: 15,
    descripcion:
      "Múltiples capas de transacciones para ocultar el origen.",
    analisisForense:
      "Cadenas extensas de transacciones diseñadas para dificultar el rastreo del origen de fondos.",
    indicadores: ["Uso de exchanges", "Cuentas en cascada"],
    ejemplo: "A → B → C → D → E (5 saltos)",
  },
  {
    id: "mixer",
    nombre: "Mixer Usage",
    riesgo: "Crítico",
    riesgoColor: "bg-red-800",
    instancias: 8,
    descripcion:
      "Uso de servicios de mezcla en criptomonedas.",
    analisisForense:
      "Utilización de servicios especializados en mezclar fondos en múltiples salidas para romper la trazabilidad.",
    indicadores: ["Detección de mixers centralizados", "Transacciones simultáneas"],
    ejemplo: "BTC In → Mixer → BTC Out (varios destinos)",
  },
]

const PatronesDetectados = () => {
  const [expanded, setExpanded] = useState(null)

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <AlertTriangle className="h-4 w-4 text-gray-500" />
        <h2 className="font-medium text-gray-700">
          Patrones Sospechosos Detectados
        </h2>
      </div>
      <p className="text-sm text-gray-500 px-5 pt-2 pb-4">
        Patrones comunes de lavado de dinero y ocultamiento de fondos
      </p>

      <div className="space-y-4 px-5 pb-5">
        {patrones.map((p) => (
          <div
            key={p.id}
            className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-start">
              {/* Título y descripción */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{p.nombre}</h3>
                  <span
                    className={`text-xs text-white px-2 py-0.5 rounded ${p.riesgoColor}`}
                  >
                    {p.riesgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{p.descripcion}</p>
              </div>

              {/* Instancias */}
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-800">
                  {p.instancias}
                </p>
                <p className="text-xs text-gray-500">instancias</p>
              </div>
            </div>

            {/* Sección expandible */}
            <div className="mt-3">
              <button
                onClick={() => toggleExpand(p.id)}
                className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline"
              >
                <Microscope className="h-4 w-4" />
                {expanded === p.id ? "Ocultar Análisis" : "Ver Análisis Forense"}
              </button>

              {expanded === p.id && (
                <div className="mt-4 bg-white rounded-md border border-gray-100 p-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    <strong>Análisis Forense: </strong>
                    {p.analisisForense}
                  </p>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Indicadores de Detección
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {p.indicadores.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Ejemplo Típico
                    </h4>
                    <div className="bg-green-50 text-sm text-gray-800 px-3 py-2 rounded-md border border-green-100">
                      {p.ejemplo}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition">
                      <Search className="h-4 w-4" />
                      Ver Casos Detectados
                    </button>
                    <button className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-md border border-green-300 transition">
                      <FileText className="h-4 w-4" />
                      Generar Reporte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PatronesDetectados
