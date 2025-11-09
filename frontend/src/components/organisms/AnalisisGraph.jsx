"use client"

import { useEffect, useRef, useState } from "react"
import { Network } from "vis-network"
import { Loader2 } from "lucide-react"

export default function AnalisisGraph() {
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(true)

  const API = "http://localhost:8000"

  // 🔧 Render seguro del grafo
  const renderNetworkSafely = (data, options) => {
    const container = containerRef.current
    if (!container) {
      console.warn("Contenedor del grafo aún no disponible. Reintentando...")
      setTimeout(() => renderNetworkSafely(data, options), 200)
      return
    }

    setTimeout(() => {
      try {
        const network = new Network(container, data, options)

        network.on("click", (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0]
            const node = data.nodes.find((n) => n.id === nodeId)
            setSelectedNode(node)
          } else {
            setSelectedNode(null)
          }
        })
      } catch (err) {
        console.error("❌ Error al crear el grafo:", err)
      }
    }, 0)
  }

  useEffect(() => {
    const cargarRelaciones = async () => {
      try {
        // 🔑 Obtener token del localStorage (ajusta si usas useAuth)
        const token = localStorage.getItem("token")
        if (!token) {
          console.warn("⚠️ No hay token disponible. Inicia sesión.")
          setLoading(false)
          return
        }

        // 1️⃣ Detectar relaciones (no bloqueante)
        fetch(`${API}/relaciones/detectar/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() =>
          console.warn("No se pudo detectar relaciones nuevas (no bloqueante)")
        )

        // 2️⃣ Obtener relaciones actuales
        const res = await fetch(`${API}/relaciones/`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          console.error("❌ Error HTTP:", res.status, res.statusText)
          setLoading(false)
          return
        }

        // 3️⃣ Parsear respuesta
        let data
        try {
          data = await res.json()
        } catch (e) {
          console.error("❌ No se pudo parsear JSON:", e)
          setLoading(false)
          return
        }

        const relaciones = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : []

        if (!Array.isArray(relaciones) || relaciones.length === 0) {
          console.warn("⚠️ No se encontraron relaciones en la base de datos.")
          setLoading(false)
          return
        }

        // 4️⃣ Construir nodos y aristas
        const nodosMap = new Map()
        const edgesTemp = []
        const colorMap = {
          dominio_compartido: "#3b82f6",
          wallet_compartida: "#22c55e",
          categoria_compartida: "#f97316",
          transaccion_compartida: "#9333ea",
        }

        relaciones.forEach((rel) => {
          if (!rel || typeof rel !== "object") return
          const { direccion_origen, direccion_destino, tipo_vinculo, valor } = rel
          if (!direccion_origen || !direccion_destino) return

          if (!nodosMap.has(direccion_origen)) {
            nodosMap.set(direccion_origen, {
              id: direccion_origen,
              label: direccion_origen.slice(0, 10) + "...",
              title: `Origen (${tipo_vinculo})`,
              group: tipo_vinculo,
              value: 20,
            })
          }

          if (!nodosMap.has(direccion_destino)) {
            nodosMap.set(direccion_destino, {
              id: direccion_destino,
              label: direccion_destino.slice(0, 10) + "...",
              title: `Destino (${tipo_vinculo})`,
              group: tipo_vinculo,
              value: 20,
            })
          }

          edgesTemp.push({
            from: direccion_origen,
            to: direccion_destino,
            label: valor || "",
            arrows: "to",
            color: { color: colorMap[tipo_vinculo] || "#9ca3af" },
          })
        })

        const dataVis = {
          nodes: Array.from(nodosMap.values()),
          edges: edgesTemp,
        }

        const options = {
          layout: { improvedLayout: true },
          physics: { enabled: true },
          interaction: { hover: true, zoomView: true, dragView: true },
          nodes: {
            shape: "dot",
            font: { size: 12, color: "#fff", face: "monospace" },
            borderWidth: 2,
          },
          groups: {
            dominio_compartido: { color: { background: "#3b82f6", border: "#1e40af" } },
            wallet_compartida: { color: { background: "#22c55e", border: "#15803d" } },
            categoria_compartida: { color: { background: "#f97316", border: "#9a3412" } },
            transaccion_compartida: { color: { background: "#9333ea", border: "#581c87" } },
          },
        }

        renderNetworkSafely(dataVis, options)
      } catch (error) {
        console.error("❌ Error al cargar grafo:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarRelaciones()
  }, [])

  // 🎨 Paleta de color para el borde/títulos del panel de detalles (sin fondo para que NO se vea todo junto)
  const detalleAccent = {
    dominio_compartido: { border: "border-blue-400", text: "text-blue-600" },
    wallet_compartida: { border: "border-green-400", text: "text-green-600" },
    categoria_compartida: { border: "border-orange-400", text: "text-orange-600" },
    transaccion_compartida: { border: "border-purple-400", text: "text-purple-600" },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center text-gray-500 py-10">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Cargando relaciones...
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-[600px] border rounded bg-[#0f172a]" />
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* === PANEL DE DETALLES (secciones separadas) === */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-5 rounded-sm bg-gradient-to-b from-indigo-500 to-purple-600" />
            Detalles
          </h3>

          {selectedNode ? (
            <div
              className={`text-sm border-l-4 pl-3 rounded-md space-y-4 ${
                detalleAccent[selectedNode.group]?.border || "border-gray-300"
              }`}
            >
              {/* Dirección */}
              <div className="bg-gray-50 p-3 rounded-md shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                  Dirección
                </p>
                <p className="font-mono text-[13px] font-medium text-gray-800 break-all">
                  {selectedNode.id}
                </p>
              </div>

              {/* Tipo de vínculo */}
              <div className="bg-gray-50 p-3 rounded-md shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                  Tipo de vínculo
                </p>
                <p
                  className={`capitalize font-semibold ${
                    detalleAccent[selectedNode.group]?.text || "text-gray-700"
                  }`}
                >
                  {selectedNode.group.replace("_", " ")}
                </p>
              </div>

              {/* Información */}
              <div className="bg-gray-50 p-3 rounded-md shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                  Información
                </p>
                <p className="text-gray-700 leading-snug">{selectedNode.title}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Haz clic en un nodo para ver sus detalles
            </p>
          )}
        </div>

        {/* === LEYENDA === */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Leyenda</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block" />
              Dominio compartido
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block" />
              Wallet compartida
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500 inline-block" />
              Categoría compartida
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-600 inline-block" />
              Transacción compartida
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
