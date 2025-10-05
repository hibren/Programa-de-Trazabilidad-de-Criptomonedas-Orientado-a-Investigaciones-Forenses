"use client"

import { useEffect, useRef, useState } from "react"
import { Network } from "vis-network"

export default function ChartsPage() {
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  useEffect(() => {
    if (!containerRef.current) return

    const fetchData = async () => {
      const [direccionesRes, transaccionesRes] = await Promise.all([
        fetch("http://localhost:8000/direcciones/"),
        fetch("http://localhost:8000/transacciones/")
      ])
      const direcciones = await direccionesRes.json()
      const transacciones = await transaccionesRes.json()

      // Dirección raíz desde la cual parte el rastreo
      const direccionRaiz = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT"

      // Crear mapa ID → dirección
      const direccionMap = {}
      direcciones.forEach(d => {
        direccionMap[d._id] = d.direccion
      })

      // Filtrar transacciones donde participa la dirección raíz
      const transaccionesFiltradas = transacciones.filter(tx =>
        tx.inputs.some(i => direccionMap[i] === direccionRaiz) ||
        tx.outputs.some(o => direccionMap[o] === direccionRaiz)
      )

      // Obtener todas las direcciones relacionadas (entradas/salidas de esas transacciones)
      const direccionesRelacionadas = new Set()
      transaccionesFiltradas.forEach(tx => {
        tx.inputs.forEach(i => direccionesRelacionadas.add(direccionMap[i]))
        tx.outputs.forEach(o => direccionesRelacionadas.add(direccionMap[o]))
      })

      // Nodos filtrados (solo los relacionados)
      const nodesTemp = direcciones
        .filter(d => direccionesRelacionadas.has(d.direccion))
        .map(d => ({
          id: d.direccion,
          label: d.direccion.substring(0, 10) + "...",
          title: `Balance: ${d.balance} BTC\nRiesgo: ${d.perfil_riesgo}`,
          group: d.direccion === direccionRaiz
            ? "origen"
            : d.perfil_riesgo === "alto"
              ? "sospechoso"
              : d.perfil_riesgo === "medio"
                ? "intermedia"
                : "bajo",
          value: d.total_recibido > 50 ? 40 : 20
        }))

      // Edges solo entre direcciones filtradas
      const edgesTemp = []
      transaccionesFiltradas.forEach(tx => {
        const monto = tx.monto_total || 0
        tx.inputs.forEach(inputId => {
          const inputAddr = direccionMap[inputId]
          tx.outputs.forEach(outputId => {
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
                color: { color: inputAddr === direccionRaiz ? "#facc15" : "#60a5fa" }
              })
            }
          })
        })
      })

      setNodes(nodesTemp)
      setEdges(edgesTemp)

      const data = { nodes: nodesTemp, edges: edgesTemp }

      const options = {
        layout: { improvedLayout: true },
        physics: {
          enabled: true,
          barnesHut: { gravitationalConstant: -3000, centralGravity: 0.2, springLength: 180 }
        },
        nodes: {
          shape: "dot",
          font: { size: 14, color: "#fff", face: "monospace" },
          borderWidth: 2,
          shadow: true
        },
        edges: {
          width: 2,
          smooth: { type: "dynamic" },
          arrows: { to: { enabled: true, scaleFactor: 1.2 } }
        },
        groups: {
          origen: { color: { background: "#3b82f6", border: "#1e40af" } }, // azul: dirección inicial
          alto: { color: { background: "#ef4444", border: "#991b1b" } },
          medio: { color: { background: "#facc15", border: "#92400e" } },
          bajo: { color: { background: "#22c55e", border: "#15803d" } }
        }
      }

      const network = new Network(containerRef.current, data, options)

      // Centrar en la dirección raíz
      setTimeout(() => {
        network.focus(direccionRaiz, { scale: 1.5, animation: { duration: 1000 } })
      }, 800)

      network.on("click", params => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          const node = nodesTemp.find(n => n.id === nodeId)
          setSelectedNode(node)
        } else setSelectedNode(null)
      })

      return () => network.destroy()
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Grafo de Trazabilidad Blockchain
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafo */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Flujo de Transacciones
              </h2>
              <div ref={containerRef} className="w-full h-[600px] border rounded bg-[#0f172a]" />
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Detalles */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalles</h3>
              {selectedNode ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Tipo:</strong> {selectedNode.group}</p>
                  <p><strong>ID:</strong> {selectedNode.id}</p>
                  <p><strong>Info:</strong> {selectedNode.title}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Haz clic en un nodo para ver sus detalles</p>
              )}
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Estadísticas</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Direcciones:</strong> {nodes.length}</li>
                <li><strong>Transacciones:</strong> {edges.length}</li>
                <li><strong>Clústeres:</strong> 1</li>
                <li><strong>Conexiones:</strong> {edges.length}</li>
              </ul>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtros</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-blue-500" /> Mostrar direcciones
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-yellow-500" /> Mostrar clústeres
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-orange-400" /> Mostrar entradas
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-red-500" /> Mostrar salidas
                </label>
              </div>
            </div>

            {/* Leyenda */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Leyenda</h3>
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
                  <span className="w-4 h-4 rounded-full bg-yellow-400 inline-block"></span>
                  Conexiones principales
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
