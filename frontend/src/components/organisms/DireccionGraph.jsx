"use client"

import { useEffect, useRef, useState } from "react"
import { Network } from "vis-network"

export default function DireccionGraph({ direccion }) {
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  useEffect(() => {
    if (!direccion || !containerRef.current) return

    const fetchData = async () => {
      const [direccionesRes, transaccionesRes] = await Promise.all([
        fetch("http://localhost:8000/direcciones/"),
        fetch("http://localhost:8000/transacciones/"),
      ])
      const direcciones = await direccionesRes.json()
      const transacciones = await transaccionesRes.json()

      // Crear mapa ID → dirección
      const direccionMap = {}
      direcciones.forEach((d) => {
        direccionMap[d._id] = d.direccion
      })

      // Filtrar transacciones donde participa la dirección actual
      const transaccionesFiltradas = transacciones.filter(
        (tx) =>
          tx.inputs.some((i) => direccionMap[i] === direccion) ||
          tx.outputs.some((o) => direccionMap[o] === direccion)
      )

      // Direcciones relacionadas
      const direccionesRelacionadas = new Set()
      transaccionesFiltradas.forEach((tx) => {
        tx.inputs.forEach((i) => direccionesRelacionadas.add(direccionMap[i]))
        tx.outputs.forEach((o) => direccionesRelacionadas.add(direccionMap[o]))
      })

      // === NODOS ===
      const nodesTemp = direcciones
        .filter((d) => direccionesRelacionadas.has(d.direccion))
        .map((d) => ({
          id: d.direccion,
          label: d.direccion.substring(0, 10) + "...",
          title: `Balance: ${d.balance} BTC\nRiesgo: ${d.perfil_riesgo}`,
          group: d.direccion === direccion ? "origen" : "otro",
          value: d.total_recibido > 50 ? 40 : 20,
        }))

      // === ARISTAS ===
      const edgesTemp = []
      transaccionesFiltradas.forEach((tx) => {
        const monto = tx.monto_total || 0
        tx.inputs.forEach((inputId) => {
          const inputAddr = direccionMap[inputId]
          tx.outputs.forEach((outputId) => {
            const outputAddr = direccionMap[outputId]
            if (
              inputAddr &&
              outputAddr &&
              direccionesRelacionadas.has(inputAddr) &&
              direccionesRelacionadas.has(outputAddr)
            ) {
              edgesTemp.push({
                from: inputAddr,
                to: outputAddr,
                label: `${monto} BTC`,
                arrows: "to",
                // Amarillo = conexiones principales, Celeste = resto
                color: { color: inputAddr === direccion ? "#facc15" : "#60a5fa" },
              })
            }
          })
        })
      })

      setNodes(nodesTemp)
      setEdges(edgesTemp)

      // === CONFIGURACIÓN VIS-NETWORK ===
      const network = new Network(
        containerRef.current,
        { nodes: nodesTemp, edges: edgesTemp },
        {
          layout: { improvedLayout: true },
          physics: {
            enabled: true,
            barnesHut: { gravitationalConstant: -3000, centralGravity: 0.2, springLength: 180 },
          },
          nodes: {
            shape: "dot",
            font: { size: 13, color: "#fff", face: "monospace" },
            borderWidth: 2,
            shadow: true,
          },
          edges: {
            width: 2,
            smooth: { type: "dynamic" },
            arrows: { to: { enabled: true, scaleFactor: 1.2 } },
          },
          groups: {
            origen: { color: { background: "#3b82f6", border: "#1e40af" } }, // azul
            otro: { color: { background: "#22c55e", border: "#15803d" } },   // verde
          },
        }
      )

      // Centrar en la dirección actual
      setTimeout(() => {
        network.focus(direccion, { scale: 1.5, animation: { duration: 1000 } })
      }, 800)

      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          const node = nodesTemp.find((n) => n.id === nodeId)
          setSelectedNode(node)
        } else {
          setSelectedNode(null)
        }
      })

      return () => network.destroy()
    }

    fetchData()
  }, [direccion])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Grafo principal */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Flujo de Transacciones
        </h2>
        <div ref={containerRef} className="w-full h-[500px] border rounded bg-[#0f172a]" />
      </div>

      {/* Panel lateral */}
      <div className="space-y-6">
        {/* Nodo seleccionado */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Nodo seleccionado</h3>
          {selectedNode ? (
            <div className="text-xs text-gray-700 space-y-1">
              <p><strong>ID:</strong> {selectedNode.id}</p>
              <p><strong>Tipo:</strong> {selectedNode.group === "origen" ? "Dirección de inicio" : "Otra dirección"}</p>
              <p><strong>Info:</strong> {selectedNode.title}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-xs">Haz clic en un nodo para ver detalles</p>
          )}
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Estadísticas</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li><strong>Direcciones:</strong> {nodes.length}</li>
            <li><strong>Conexiones:</strong> {edges.length}</li>
            <li><strong>Clústeres:</strong> 1</li>
          </ul>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Leyenda</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block"></span>
              Dirección de inicio
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span>
              Otras direcciones
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-yellow-400 rounded inline-block"></span>
              Conexiones principales
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
