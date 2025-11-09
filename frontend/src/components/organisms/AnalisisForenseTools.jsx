"use client"

import { Search, TrendingUp, Network, Clock, Loader2 } from "lucide-react"
import { useState } from "react"
import ModalDetalleRastreo from "@/components/molecules/ModalDetalleRastreo"
import ModalDetalleCluster from "@/components/molecules/ModalDetalleCluster"

// ======================= MODAL DE RESULTADOS =======================
const ResultadoRastreoModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null
  return <ModalDetalleRastreo isOpen={isOpen} onClose={onClose} data={data} />
}

// ======================= COMPONENTE PRINCIPAL =======================
const AnalisisForenseTools = () => {
  const [form, setForm] = useState({
    direccionOrigen: "",
    direccionDestino: "",
    direccionBase: "",
    profundidad: "3",
    periodo: "7",
    algoritmo: "coincidencia-etiquetas",
    ventana: "24h",
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resultadoRastreo, setResultadoRastreo] = useState(null)
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false)
  const [resultadoCluster, setResultadoCluster] = useState(null)
  const [loadingAction, setLoadingAction] = useState(null)
  const [loadingCluster, setLoadingCluster] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // ======================= FUNCIÓN PRINCIPAL =======================
  const handleAction = async (tipoAccion) => {
    try {
      setLoadingAction(tipoAccion)

      let url = ""
      let tipo = ""
      let direccion = ""
      let params = {}

      if (tipoAccion === "origen") {
        tipo = "origen"
        direccion = form.direccionDestino
        params = { direccion, profundidad: form.profundidad || 3 }
        if (!direccion) {
          alert("⚠️ Ingrese una dirección para rastrear el origen.")
          return
        }
        url = `http://localhost:8000/rastreo/origen?${new URLSearchParams(params)}`
      } else if (tipoAccion === "destino") {
        tipo = "destino"
        direccion = form.direccionOrigen
        params = { direccion, dias: form.periodo || 7 }
        if (!direccion) {
          alert("⚠️ Ingrese una dirección para analizar destinos.")
          return
        }
        url = `http://localhost:8000/rastreo/destino?${new URLSearchParams(params)}`
      } else if (tipoAccion === "cluster") {
        const direccionBase = form.direccionBase
        if (!direccionBase) {
          alert("⚠️ Ingrese una dirección base para detectar el cluster.")
          return
        }

        const algoritmo = form.algoritmo || "coincidencia-etiquetas"
        setLoadingCluster(true)

        const res = await fetch(
          `http://localhost:8000/clusters/detectar?direccion=${direccionBase}&algoritmo=${algoritmo}`
        )

        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Error en detección de cluster")

        console.log("✅ Cluster detectado:", data)
        setResultadoCluster(data)
        setIsClusterModalOpen(true)
        return
      } else {
        alert(`🔍 Acción "${tipoAccion}" aún no implementada.`)
        return
      }

      console.log(`🌐 Solicitando → ${url}`)
      const response = await fetch(url, { method: "POST" })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail
          ? typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail)
          : response.statusText
        throw new Error(`Error HTTP ${response.status}: ${errorMessage}`)
      }

      const data = await response.json()
      console.log("✅ Datos recibidos:", data)
      setResultadoRastreo(data)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error al procesar el análisis:", error)
      alert(`⚠️ Error al obtener los datos del servidor: ${error.message}`)
    } finally {
      setLoadingAction(null)
      setLoadingCluster(false)
    }
  }

  // ======================= UI =======================
  return (
    <>
      {/* MODAL DE RESULTADOS DE RASTREO */}
      <ResultadoRastreoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={resultadoRastreo}
      />

      {/* MODAL DE RESULTADOS DE CLUSTER */}
      <ModalDetalleCluster
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        data={resultadoCluster}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ==================== Rastreo de Origen ==================== */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-green-700" />
              <h3 className="font-semibold text-gray-800">Rastreo de Origen</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Identifica el origen de los fondos rastreando hacia atrás en la blockchain
            </p>

            <label className="block text-sm text-gray-700 mb-1">Dirección de Destino</label>
            <input
              type="text"
              name="direccionDestino"
              placeholder="Ingrese dirección..."
              value={form.direccionDestino}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm text-gray-700 mb-1">Profundidad de Búsqueda</label>
            <select
              name="profundidad"
              value={form.profundidad}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="3">3 saltos (recomendado)</option>
              <option value="1">1 salto</option>
              <option value="5">5 saltos</option>
            </select>

            <button
              onClick={() => handleAction("origen")}
              disabled={loadingAction === "origen"}
              className={`w-full ${
                loadingAction === "origen"
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              {loadingAction === "origen" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Iniciar Rastreo
                </>
              )}
            </button>
          </div>

          {/* ==================== Análisis de Destino ==================== */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-700" />
              <h3 className="font-semibold text-gray-800">Análisis de Destino</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Rastrea hacia dónde se dirigen los fondos desde una dirección específica
            </p>

            <label className="block text-sm text-gray-700 mb-1">Dirección de Origen</label>
            <input
              type="text"
              name="direccionOrigen"
              placeholder="Ingrese dirección..."
              value={form.direccionOrigen}
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
              <option value="historico">Histórico (completo)</option>
            </select>

            <button
              onClick={() => handleAction("destino")}
              disabled={loadingAction === "destino"}
              className={`w-full ${
                loadingAction === "destino"
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              {loadingAction === "destino" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Analizar Destinos
                </>
              )}
            </button>
          </div>

          {/* ==================== Detección de Clusters ==================== */}
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
              <option value="coincidencia-etiquetas">Coincidencia de etiquetas</option>
              <option value="coincidencia-transacciones">Coincidencia de transacciones</option>
            </select>

            <button
              onClick={() => handleAction("cluster")}
              disabled={loadingCluster}
              className={`w-full ${
                loadingCluster
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              {loadingCluster ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detectando...
                </>
              ) : (
                <>
                  <Network className="h-4 w-4" />
                  Detectar Cluster
                </>
              )}
            </button>
          </div>

          {/* ==================== Análisis Temporal ==================== */}
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
              <option value="24h">24 horas</option>
              <option value="7d">7 días</option>
              <option value="30d">30 días</option>
            </select>

            <button
              onClick={() => handleAction("temporal")}
              disabled={true}
              className="w-full bg-gray-400 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium cursor-not-allowed"
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
