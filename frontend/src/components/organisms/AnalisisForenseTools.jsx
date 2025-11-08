"use client"

import { Search, TrendingUp, Network, Clock } from "lucide-react"
import { useState } from "react"
import ModalDetalleRastreo from "@/components/molecules/ModalDetalleRastreo"

// ======================= MODAL DE RESULTADOS =======================
const ResultadoRastreoModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null
  return (
    <ModalDetalleRastreo
      isOpen={isOpen}
      onClose={onClose}
      data={data}
    />
  )
}

// ======================= COMPONENTE PRINCIPAL =======================
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

  // ======================= FUNCIÓN PRINCIPAL =======================
const handleAction = async (accion) => {
  const action = accion.trim().toLowerCase(); // 👈 normaliza

  try {
    setLoading(true);

    let url = "";
    let tipo = "";
    let direccion = "";

    if (action.includes("origen")) {
      tipo = "origen";
      direccion = form.destino;
      const profundidad = form.profundidad || 3;

      if (!direccion) {
        alert("⚠️ Ingrese una dirección para rastrear el origen.");
        setLoading(false);
        return;
      }

      url = `http://localhost:8000/rastreo/origen?direccion=${direccion}&profundidad=${profundidad}`;
    }

    else if (action.includes("destino")) {
      tipo = "destino";
      direccion = form.origen;
      const dias = form.periodo || 7;

      if (!direccion) {
        alert("⚠️ Ingrese una dirección para analizar destinos.");
        setLoading(false);
        return;
      }

      url = `http://localhost:8000/rastreo/destino?direccion=${direccion}&dias=${dias}`;
    }

    else {
      alert(`🔍 Ejecutando ${accion}...\n${JSON.stringify(form, null, 2)}`);
      setLoading(false);
      return;
    }

    console.log(`🌐 Solicitando → ${url}`);

    const response = await fetch(url, { method: "POST" });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

    const data = await response.json();
    console.log("✅ Datos recibidos:", data);

    const conexiones = Array.isArray(data.resultado) ? data.resultado : [];
    const trazaFormateada = {
      direccion: data.direccion_inicial,
      tipo,
      actividad: tipo === "destino" ? "Análisis de Destino" : "Rastreo de Origen",
      cantidad_reportes: data.total_conexiones,
      conexiones,
      fecha_analisis: data.fecha_analisis,
    };

    setResultadoRastreo(trazaFormateada);
    setIsModalOpen(true);
  } catch (error) {
    console.error("Error al procesar el análisis:", error);
    alert("⚠️ Error al obtener los datos del servidor.");
  } finally {
    setLoading(false);
  }
};

  // ======================= UI =======================
  return (
    <>
      {/* MODAL DE RESULTADOS */}
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

            {resultadoRastreo && resultadoRastreo.tipo === "origen" && (
              <p className="text-sm text-gray-600 mt-3">
                🔍 Conexiones encontradas: {resultadoRastreo?.conexiones?.length || 0}
              </p>
            )}
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
              disabled={loading}
              className={`w-full ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
              } text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium`}
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? "Cargando..." : "Analizar Destinos"}
            </button>

            {resultadoRastreo && resultadoRastreo.tipo === "destino" && (
              <p className="text-sm text-gray-600 mt-3">
                📈 Conexiones encontradas: {resultadoRastreo?.conexiones?.length || 0}
              </p>
            )}
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
