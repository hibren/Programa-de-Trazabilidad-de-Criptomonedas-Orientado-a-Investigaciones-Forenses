"use client"

import { useEffect, useRef, useState } from "react"
import { Network } from "vis-network"

export default function ChartsPage() {
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Datos más realistas: 1 dirección con múltiples transacciones
    const nodes = [
      { 
        id: "addr1", 
        label: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", 
        group: "address",
        title: "Dirección Bitcoin",
        value: 30
      },
      { id: "tx1", label: "TX-001", group: "tx", title: "Transacción 1", value: 15 },
      { id: "tx2", label: "TX-002", group: "tx", title: "Transacción 2", value: 15 },
      { id: "tx3", label: "TX-003", group: "tx", title: "Transacción 3", value: 15 },
      { id: "tx4", label: "TX-004", group: "tx", title: "Transacción 4", value: 15 },
      { id: "tx5", label: "TX-005", group: "tx", title: "Transacción 5", value: 15 },
      
      { id: "addr2", label: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", group: "address", title: "Dirección destino 1", value: 20 },
      { id: "addr3", label: "3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy", group: "address", title: "Dirección destino 2", value: 20 },
      { id: "addr4", label: "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6", group: "address", title: "Dirección destino 3", value: 20 },
      
      { id: "block1", label: "Block 916650", group: "block", title: "Bloque Bitcoin", value: 25 },
    ]

    const edges = [
      // Dirección principal conectada a sus transacciones
      { from: "addr1", to: "tx1", arrows: "to" },
      { from: "addr1", to: "tx2", arrows: "to" },
      { from: "addr1", to: "tx3", arrows: "to" },
      { from: "addr1", to: "tx4", arrows: "to" },
      { from: "addr1", to: "tx5", arrows: "to" },
      
      // Transacciones a direcciones destino
      { from: "tx1", to: "addr2", arrows: "to" },
      { from: "tx2", to: "addr2", arrows: "to" },
      { from: "tx3", to: "addr3", arrows: "to" },
      { from: "tx4", to: "addr4", arrows: "to" },
      { from: "tx5", to: "addr3", arrows: "to" },
      
      // Transacciones al bloque
      { from: "tx1", to: "block1", arrows: "to", color: { color: "#94a3b8" } },
      { from: "tx2", to: "block1", arrows: "to", color: { color: "#94a3b8" } },
      { from: "tx3", to: "block1", arrows: "to", color: { color: "#94a3b8" } },
      { from: "tx4", to: "block1", arrows: "to", color: { color: "#94a3b8" } },
      { from: "tx5", to: "block1", arrows: "to", color: { color: "#94a3b8" } },
    ]

    const data = { nodes, edges }

    const options = {
      nodes: {
        shape: "dot",
        font: {
          size: 12,
          color: "#ffffff",
          face: "monospace"
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true,
        smooth: {
          type: "continuous"
        }
      },
      groups: {
        address: {
          color: { background: "#3b82f6", border: "#1e40af" },
          shape: "box"
        },
        tx: {
          color: { background: "#f59e0b", border: "#b45309" },
          shape: "diamond"
        },
        block: {
          color: { background: "#22c55e", border: "#15803d" },
          shape: "hexagon"
        }
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04
        },
        stabilization: {
          iterations: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100
      }
    }

    const network = new Network(containerRef.current, data, options)

    network.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0]
        const node = nodes.find(n => n.id === nodeId)
        setSelectedNode(node)
      } else {
        setSelectedNode(null)
      }
    })

    return () => {
      network.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Análisis de Transacciones Bitcoin
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafo - 2/3 del espacio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Grafo de Conexiones
              </h2>
              <div 
                ref={containerRef}
                className="w-full h-[500px] border border-gray-200 rounded"
              />
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Direcciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Transacciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Bloques</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral - 1/3 del espacio */}
          <div className="space-y-6">
            {/* Info del nodo seleccionado */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Detalles
              </h3>
              {selectedNode ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tipo:</span>
                    <p className="text-gray-900 capitalize">{selectedNode.group}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">ID:</span>
                    <p className="text-gray-900 text-xs break-all font-mono">
                      {selectedNode.label}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Haz clic en un nodo para ver sus detalles
                </p>
              )}
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Direcciones:</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transacciones:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bloques:</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conexiones:</span>
                  <span className="font-semibold">15</span>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Filtros
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Mostrar direcciones</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Mostrar transacciones</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Mostrar bloques</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}