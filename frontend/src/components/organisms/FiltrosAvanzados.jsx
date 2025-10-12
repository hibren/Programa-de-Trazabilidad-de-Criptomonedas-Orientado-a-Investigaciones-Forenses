"use client";

import React, { useState } from "react";
import { 
  Filter, X, Play, Search, AlertCircle, TrendingUp, 
  Network, Eye, Calendar, Coins, Activity,
  MapPin, Download, Plus, ChevronRight
} from "lucide-react";

const mockResultados = [
  {
    id: 1,
    hash: "a1b2c3d4e5f6890",
    fecha: "2024-01-15",
    monto: 5.234,
    origen: "1A1zP1eP...DivfNa",
    destino: "1BvBMSE...aNVN2",
    patron: "Mixing",
    riesgo: "Alto"
  },
  {
    id: 2,
    hash: "f6e5d4c3b2a1098",
    fecha: "2024-01-16",
    monto: 3.891,
    origen: "1BvBMSE...aNVN2",
    destino: "1F1tAaz...n4xqX",
    patron: "Layering",
    riesgo: "Medio"
  },
  {
    id: 3,
    hash: "9z8y7x6w5v4u321",
    fecha: "2024-01-17",
    monto: 8.156,
    origen: "1F1tAaz...n4xqX",
    destino: "1HQ3Go3...8Hbhx",
    patron: "Fraude",
    riesgo: "Alto"
  },
  {
    id: 4,
    hash: "k9l8m7n6o5p4q32",
    fecha: "2024-01-18",
    monto: 1.523,
    origen: "1HQ3Go3...8Hbhx",
    destino: "1J6PYEz...NM1wk",
    patron: "Smurf",
    riesgo: "Medio"
  },
  {
    id: 5,
    hash: "t5r4e3w2q1a0987",
    fecha: "2024-01-19",
    monto: 12.678,
    origen: "1J6PYEz...NM1wk",
    destino: "1CK6KHY...jbH1cE",
    patron: "Mixing",
    riesgo: "Alto"
  },
  {
    id: 6,
    hash: "b8c7d6e5f4g3h21",
    fecha: "2024-01-20",
    monto: 4.234,
    origen: "1CK6KHY...jbH1cE",
    destino: "1MzXqvB...kL9pQ",
    patron: "Layering",
    riesgo: "Bajo"
  }
];

const FiltrosAvanzados = () => {
  const [selectedTx, setSelectedTx] = useState(null);

  const getRiesgoColor = (riesgo) => {
    const colors = {
      Alto: "bg-red-100 text-red-700 border-red-300",
      Medio: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Bajo: "bg-green-100 text-green-700 border-green-300"
    };
    return colors[riesgo];
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Análisis de Blockchain</h1>
            <p className="text-sm text-gray-500 mt-0.5">Sistema de trazabilidad y detección de patrones</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">
              <Plus className="w-4 h-4" />
              Nueva Trazabilidad
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm">
              <Play className="w-4 h-4" />
              Iniciar Análisis
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal - 2 columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda - Filtros (35%) */}
        <div className="w-[420px] bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h2>
            </div>
            <p className="text-sm text-gray-500">Configurar criterios de búsqueda</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Rango de monto */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Rango de Monto (BTC)
                </label>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #16a34a 0%, #16a34a 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 BTC</span>
                    <span className="font-medium text-green-600">50 BTC</span>
                    <span>100 BTC</span>
                  </div>
                </div>
              </div>

              {/* Período */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Período
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Fecha Inicio</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Fecha Fin</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Patrón */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Tipo de Patrón
                </label>
                <select className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                  <option value="">Seleccionar patrón...</option>
                  <option value="mixing">Mixing</option>
                  <option value="layering">Layering</option>
                  <option value="fraude">Fraude</option>
                  <option value="smurf">Smurf</option>
                </select>
              </div>

              {/* Tipo de Transacción */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Tipo de Transacción
                </label>
                <select className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                  <option value="">Seleccionar tipo...</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="interna">Interna</option>
                </select>
              </div>

              {/* Dirección Específica */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Dirección Específica
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Ingrese dirección Bitcoin..."
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Hash de Transacción */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Hash de Transacción
                </label>
                <input 
                  type="text"
                  placeholder="Ingrese hash de transacción..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción fijos abajo */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-2">
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              <Filter className="w-4 h-4" />
              Aplicar Filtros
            </button>
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Columna derecha - Resultados COMPACTOS (65%) */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            {/* Stats bar compactos */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                    <p className="text-xs text-gray-500">Transacciones</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-gray-500">Direcciones</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">35.7</p>
                    <p className="text-xs text-gray-500">BTC Total</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">Alto</p>
                    <p className="text-xs text-gray-500">Riesgo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Título + botón Ver Grafo */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resultados del Análisis</h3>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <Network className="w-4 h-4" />
                Ver Grafo Completo
              </button>
            </div>

            {/* Tabla compacta */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Hash</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Fecha</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Monto</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Origen → Destino</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Patrón</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Riesgo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockResultados.map((tx) => (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {tx.hash}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{tx.fecha}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900">{tx.monto} BTC</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs">
                          <code className="text-blue-600">{tx.origen}</code>
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          <code className="text-green-600">{tx.destino}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          {tx.patron}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getRiesgoColor(tx.riesgo)}`}>
                          {tx.riesgo}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-green-600 hover:text-green-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosAvanzados;