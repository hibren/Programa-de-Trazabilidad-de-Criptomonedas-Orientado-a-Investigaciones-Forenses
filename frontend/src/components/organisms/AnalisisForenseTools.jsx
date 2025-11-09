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
  const [loading, setLoading] = useState(false)

  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false)
  const [resultadoCluster, setResultadoCluster] = useState(null)
  const [loadingCluster, setLoadingCluster] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // ======================= FUNCIÓN PRINCIPAL =======================
  const handleAction = async (tipoAccion) => {
    try {
      let url = ""
      let tipo = ""
      let direccion = ""
      let params = {}

      // ================== RASTREO DE ORIGEN ==================
      if (tipoAccion === "origen") {
        setLoading(true)
        tipo = "origen"
        direccion = form.direccionDestino
        if (!direccion) throw new Error("⚠️ Ingrese una dirección para rastrear el origen.")

        params = { direccion, profundidad: form.profundidad || 3 }
        url = `http://localhost:8000/rastreo/origen?${new URLSearchParams(params)}`
      }

      // ================== ANÁLISIS DE DESTINO ==================
      else if (tipoAccion === "destino") {
        setLoading(true)
        tipo = "destino"
        direccion = form.direccionOrigen
        if (!direccion) throw new Error("⚠️ Ingrese una dirección para analizar destinos.")

        params = { direccion, dias: form.periodo || 7 }
        url = `http://localhost:8000/rastreo/destino?${new URLSearchParams(params)}`
      }

      // ================== DETECCIÓN DE CLUSTERS ==================
      else if (tipoAccion === "cluster") {
        setLoadingCluster(true)
        const direccionBase = form.direccionBase
        if (!direccionBase) throw new Error("⚠️ Ingrese una dirección base para detectar el cluster.")

        const algoritmo = form.algoritmo || "coincidencia-etiquetas"
        const clusterUrl = `http://localhost:8000/clusters/detectar?direccion=${direccionBase}&algoritmo=${algoritmo}`

        console.log(`🌐 Solicitando cluster → ${clusterUrl}`)
        const res = await fetch(clusterUrl)
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Error en detección de cluster")

        console.log("✅ Cluster detectado:", data)
        setResultadoCluster({ ...data, algoritmo })
        setIsClusterModalOpen(true)
        return
      }

      // ================== ACCIÓN NO IMPLEMENTADA ==================
      else {
        alert(`🔍 Acción "${tipoAccion}" aún no implementada.`)
        return
      }

      console.log(`🌐 Solicitando → ${url}`)
      const response = await fetch(url, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || response.statusText)

      console.log("✅ Datos recibidos:", data)

      const conexiones = Array.isArray(data.resultado) ? data.resultado : []
      const trazaFormateada = {
        direccion: data.direccion_inicial,
        tipo,
        actividad: tipo === "destino" ? "Análisis de Destino" : "Rastreo de Origen",
        cantidad_reportes: data.total_conexiones,
        conexiones,
        fecha_analisis: data.fecha_analisis,
      }

      setResultadoRastreo(trazaFormateada)
      setIsModalOpen(true)
    } catch (error) {
      console.error("❌ Error al procesar:", error)
      alert(error.message)
    } finally {
      setLoading(false)
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

            <label className="block text-sm text-gray-700 mb-1">
              Dirección de Destino
            </label>
            <input
              type="text"
              name="direccionDestino"
              placeholder="Ingrese dirección..."
              value={form.direccionDestino}
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
              <option value="3">3 saltos (recomendado)</option>
              <option value="1">1 salto</option>
              <option value="5">5 saltos</option>
            </select>

            <button
              onClick={() => handleAction("origen")}
              disabled={loading}
              className={`w-full ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              {loading ? (
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
            </select>

            <button
              onClick={() => handleAction("destino")}
              disabled={loading}
              className={`w-full ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              {loading ? (
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
