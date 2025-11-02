"use client"

import { Search, TrendingUp, Network, Clock } from "lucide-react"
import { useState } from "react"
import ModalDetalleTraza from "@/components/molecules/ModalDetalleTraza"

// ========== COMPONENTE MODAL ==========
const ResultadoRastreoModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null
  return (
    <ModalDetalleTraza
      isOpen={isOpen}
      onClose={onClose}
      data={data}
    />
  )
}

// ========== COMPONENTE PRINCIPAL ==========
const AnalisisForenseTools = () => {
  const [form, setForm] = useState({
    origen: "",
    destino: "",
    profundidad: "",
    periodo: "",
    algoritmo: "",
    ventana: "",
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resultadoRastreo, setResultadoRastreo] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // 👇 FUNCIÓN QUE CONSULTA TU API REAL DE FASTAPI
  const handleAction = async (accion) => {
    if (accion === "Rastreo de Origen") {
      try {
        setLoading(true)

        // 🔹 Llamamos al endpoint real
        const response = await fetch("http://localhost:8000/trazabilidad/trazas")
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const data = await response.json()

        if (!data?.trazas || data.trazas.length === 0) {
          alert("⚠️ No se encontraron trazas en la respuesta.")
          return
        }

        // 🔹 Buscamos la traza que contenga la dirección buscada en origen o destino
        const trazaEncontrada = data.trazas.find(
          (t) =>
            t.origen?.includes(form.destino) ||
            t.destino?.includes(form.destino)
        )

        // Si no la encuentra, usa la primera como fallback
        const traza = trazaEncontrada || data.trazas[0]

        // 🔹 Normalizamos para que coincida con ModalDetalleTraza
        const trazaFormateada = {
          direccion: traza.origen?.[0] || "Desconocido",
          perfil_riesgo: traza.perfil_riesgo || "desconocido",
          actividad: traza.estado || "sin estado",
          cantidad_reportes: traza.reportes_totales || 0,
          total_recibido: (traza.monto_total || 0) * 100000000,
          total_enviado: 0,
          final_balance: (traza.monto_total || 0) * 100000000,
          n_tx: data.cantidad || 0,
          primer_tx: traza.bloque?.fecha || "",
          ultima_tx: traza.bloque?.fecha || "",
          categorias: traza.categorias_denuncia || [],
          ultimo_update_riesgo: traza.ultimo_update_riesgo || "N/A",
          ponderaciones: {
            reportes: traza.reportes_totales || 0,
            categorias: traza.categorias_denuncia?.length || 0,
            actividad: traza.patrones_sospechosos?.length || 0,
            total:
              (traza.reportes_totales || 0) +
              (traza.categorias_denuncia?.length || 0) +
              (traza.patrones_sospechosos?.length || 0),
          },
        }
        console.log("🧩 Data recibida en modal:", data)

        setResultadoRastreo(trazaFormateada)
        setIsModalOpen(true)
      } catch (error) {
        console.error("Error al rastrear dirección:", error)
        alert("⚠️ Error al obtener los datos del servidor.")
      } finally {
        setLoading(false)
      }
    } else {
      alert(`🔍 Ejecutando ${accion}...\n${JSON.stringify(form, null, 2)}`)
    }
  }

  return (
    <>
      {/* 👇 MODAL REAL */}
      <ResultadoRastreoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={resultadoRastreo}
      />

      <div className="bg-gray-50 min-h-screen p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Herramientas de Análisis Forense
          </h2>
          <p className="text-sm text-gray-500">
            Investigación detallada y seguimiento de actividades sospechosas
          </p>
        </div>

        {/* Contenedor en cuadrícula */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 🔹 Rastreo de Origen */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-green-700" />
              <h3 className="font-semibold text-gray-800">Rastreo de Origen</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Identifica el origen de los fondos rastreando hacia atrás en la blockchain
            </p>

            <label className="block text-sm text-gray-700 mb-1">
              Dirección de Destino
            </label>
            <input
              type="text"
              name="destino"
              placeholder="Ingrese dirección..."
              value={form.destino}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm text-gray-700 mb-1">
              Profundidad de Búsqueda
            </label>
            <select
              name="profundidad"
              value={form.profundidad}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar profundidad</option>
              <option value="1">1 salto</option>
              <option value="3">3 saltos</option>
              <option value="5">5 saltos</option>
            </select>

            <button
              onClick={() => handleAction("Rastreo de Origen")}
              disabled={loading}
              className={`w-full ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              <Search className="h-4 w-4" />
              {loading ? "Cargando..." : "Iniciar Rastreo"}
            </button>
          </div>

          {/* 🔹 Análisis de Destino */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-700" />
              <h3 className="font-semibold text-gray-800">Análisis de Destino</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Rastrea hacia dónde se dirigen los fondos desde una dirección específica
            </p>

            <label className="block text-sm text-gray-700 mb-1">
              Dirección de Origen
            </label>
            <input
              type="text"
              name="origen"
              placeholder="Ingrese dirección..."
              value={form.origen}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm text-gray-700 mb-1">Período de Tiempo</label>
            <select
              name="periodo"
              value={form.periodo}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar período</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>

            <button
              onClick={() => handleAction("Análisis de Destino")}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Analizar Destinos
            </button>
          </div>

          {/* 🔹 Detección de Clusters */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-5 w-5 text-green-700" />
              <h3 className="font-semibold text-gray-800">Detección de Clusters</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Identifica grupos de direcciones que probablemente pertenecen a la misma entidad
            </p>

            <label className="block text-sm text-gray-700 mb-1">Dirección Base</label>
            <input
              type="text"
              name="direccionBase"
              placeholder="Ingrese dirección..."
              value={form.direccionBase}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm text-gray-700 mb-1">Algoritmo</label>
            <select
              name="algoritmo"
              value={form.algoritmo}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar algoritmo</option>
              <option value="coincidencia-etiquetas">Coincidencia de etiquetas</option>
              <option value="coincidencia-transacciones">Coincidencia de transacciones</option>
            </select>

            <button
              onClick={() => handleAction("Detección de Clusters")}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Network className="h-4 w-4" />
              Detectar Cluster
            </button>
          </div>

          {/* 🔹 Análisis Temporal */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-green-700" />
              <h3 className="font-semibold text-gray-800">Análisis Temporal</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Analiza patrones temporales de transacciones para detectar comportamientos coordinados
            </p>

            <label className="block text-sm text-gray-700 mb-1">Direcciones a Analizar</label>
            <input
              type="text"
              name="direcciones"
              placeholder="Ingrese direcciones separadas por coma..."
              value={form.direcciones}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm text-gray-700 mb-1">Ventana de Tiempo</label>
            <select
              name="ventana"
              value={form.ventana}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar ventana</option>
              <option value="24h">24 horas</option>
              <option value="7d">7 días</option>
              <option value="30d">30 días</option>
            </select>

            <button
              onClick={() => handleAction("Análisis Temporal")}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Clock className="h-4 w-4" />
              Analizar Patrones
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AnalisisForenseTools
