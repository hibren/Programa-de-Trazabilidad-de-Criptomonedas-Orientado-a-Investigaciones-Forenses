"use client"

import { Dialog } from "@headlessui/react"
import { Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function ModalAnalisisTemporal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null

  const series = data.series || []
  const horas = new Set()
  const chartData = []

  series.forEach((s) => Object.keys(s.conteos_por_hora || {}).forEach((h) => horas.add(h)))

  horas.forEach((hora) => {
    const fila = { hora }
    series.forEach((s) => (fila[s.direccion] = s.conteos_por_hora?.[hora] || 0))
    chartData.push(fila)
  })

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-700" />
            Resultado del Análisis Temporal
          </Dialog.Title>

          <p className="text-sm text-gray-600 mb-4">
            Total de transacciones analizadas: <b>{data.total_txs}</b>
          </p>

          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="hora" angle={-30} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                {series.map((s, i) => (
                  <Bar key={i} dataKey={s.direccion} fill={`hsl(${i * 90}, 60%, 50%)`} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {data.patrones?.length ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Correlaciones detectadas:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {data.patrones.map((p, i) => (
                  <li key={i}>
                    Grupo: {p.grupo.join(", ")} → Correlación:{" "}
                    <b>{(p.correlacion * 100).toFixed(0)}%</b>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No se detectaron patrones correlacionados.
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
