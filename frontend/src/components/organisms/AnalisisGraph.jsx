"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Network } from "vis-network"
import { Loader2 } from "lucide-react"

export default function AnalisisGraph() {
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const API = "http://localhost:8000"

  // 🔧 Función segura para crear el grafo cuando el contenedor esté montado
  const renderNetworkSafely = (data, options) => {
    const container = containerRef.current
    if (!container) {
      console.warn("Contenedor del grafo aún no disponible. Reintentando...")
      // Reintentar una vez después de 200 ms
      setTimeout(() => renderNetworkSafely(data, options), 200)
      return
    }

    // Esperar un tick para asegurarse de que el div esté montado
    setTimeout(() => {
      try {
        const network = new Network(container, data, options)

        // Evento de click sobre nodos
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
      if (!token) {
        console.warn("No hay token, saltando carga de relaciones.")
        setLoading(false)
        return
      }

      try {
        // 1️⃣ Detectar nuevas relaciones automáticamente
        await fetch(`${API}/relaciones/detectar`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        // 2️⃣ Luego traer las relaciones actuales
        const res = await fetch(`${API}/relaciones`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        const relaciones = await res.json()

        if (!Array.isArray(relaciones) || relaciones.length === 0) {
          console.warn("⚠️ No se encontraron relaciones en la base de datos.")
          setLoading(false)
          return
        }

        // 3️⃣ Construir nodos y aristas
        const nodosMap = new Map()
        const edgesTemp = []
        const colorMap = {
          dominio_compartido: "#3b82f6", // azul
          wallet_compartida: "#22c55e",  // verde
          categoria_compartida: "#f97316", // naranja
        }

        relaciones.forEach((rel) => {
          const { direccion_origen, direccion_destino, tipo_vinculo, valor } = rel

          if (!nodosMap.has(direccion_origen)) {
            nodosMap.set(direccion_origen, {
              id: direccion_origen,
              label: direccion_origen.substring(0, 10) + "...",
              title: `Origen (${tipo_vinculo})`,
              group: tipo_vinculo,
              value: 20,
            })
          }

          if (!nodosMap.has(direccion_destino)) {
            nodosMap.set(direccion_destino, {
              id: direccion_destino,
              label: direccion_destino.substring(0, 10) + "...",
              title: `Destino (${tipo_vinculo})`,
              group: tipo_vinculo,
              value: 20,
            })
          }

          edgesTemp.push({
            from: direccion_origen,
            to: direccion_destino,
            label: valor,
            arrows: "to",
            color: { color: colorMap[tipo_vinculo] || "#9ca3af" },
          })
        })

        const data = { nodes: Array.from(nodosMap.values()), edges: edgesTemp }

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
          },
        }

        // 4️⃣ Renderizar grafo de forma segura
        renderNetworkSafely(data, options)
      } catch (error) {
        console.error("❌ Error al cargar grafo:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarRelaciones()
  }, [token])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 🧠 Grafo principal */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center text-gray-500 py-10">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Cargando relaciones...
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full h-[600px] border rounded bg-[#0f172a]"
            />
          )}
        </div>
      </div>

      {/* 📊 Panel lateral */}
      <div className="space-y-6">
        {/* Detalles de nodo */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalles</h3>
          {selectedNode ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>ID:</strong> {selectedNode.id}</p>
              <p><strong>Tipo:</strong> {selectedNode.group}</p>
              <p><strong>Info:</strong> {selectedNode.title}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Haz clic en un nodo para ver sus detalles
            </p>
          )}
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Leyenda</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block"></span>
              Dominio compartido
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span>
              Wallet compartida
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500 inline-block"></span>
              Categoría compartida
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
