"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { DataTable } from "@/components/DataTable/DataTable"
import { getColumnsAnalisis } from "@/components/DataTable/columns/getColumnsAnalisis"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { XCircle } from "lucide-react"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"

const API_URL = "http://localhost:8000"

const AnalisisContent = () => {
  const [analisis, setAnalisis] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { token } = useAuth() 

  const loadAnalisis = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/analisis/`, {
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ Agregado header
        },
      })
      if (!res.ok) throw new Error("Error cargando análisis")
      const data = await res.json()
      setAnalisis(data)
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Error</span>
          </div>
        ),
        description: "No se pudieron cargar los análisis.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalisis()
  }, [token])

  const analisisCriticos = analisis.filter((a) => {
    const riesgo = a.riesgo?.toString().toLowerCase()
    return riesgo === "alto" || riesgo === "high"
  })

  const exportToExcel = () => {
    const data = analisis.map((a) => ({
      ID: a._id,
      Riesgo: a.riesgo,
      "BTC Total": a.btc_total,
      Saltos: a.saltos,
      Origen: a.origen,
      Destino: a.destino,
      Creado: a.createdAt ? new Date(a.createdAt).toLocaleString() : "-",
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Análisis")
    XLSX.writeFile(workbook, "analisis.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text("Resultados de Análisis", 14, 15)
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Riesgo", "BTC", "Saltos", "Origen", "Destino", "Creado"]],
      body: analisis.map((a) => [
        a._id,
        a.riesgo,
        a.btc_total,
        a.saltos,
        a.origen,
        a.destino,
        a.createdAt ? new Date(a.createdAt).toLocaleString() : "-",
      ]),
    })
    doc.save("analisis.pdf")
  }

  if (!token) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-600">
            No tiene permisos para acceder a esta funcionalidad.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="flex gap-2 bg-transparent mb-6">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="comparaciones">Comparaciones</TabsTrigger>
          <TabsTrigger value="patrones">Patrones</TabsTrigger>
          <TabsTrigger value="criticos">Críticos</TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* === TAB 1 — TODOS === */}
          <TabsContent value="todos">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Resultados de Análisis
              </h2>
              <Button variant="outline" onClick={exportToExcel}>
                <Icon name="reports" size={16} className="mr-2" />
                Exportar
              </Button>
            </div>
            <DataTable
              columns={getColumnsAnalisis()}
              data={analisis}
              filterColumn="_id"
            />
          </TabsContent>

          {/* === TAB 2 — COMPARACIONES === */}
          <TabsContent value="comparaciones">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Comparaciones por nivel de riesgo</h3>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>Utilizar este panel para comparar la cantidad de análisis generados según su nivel de riesgo.</li>
                  <li>Identificar concentraciones elevadas de casos “Alto” para priorizar revisiones manuales.</li>
                  <li>Detectar variaciones inusuales en la distribución de los análisis.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Riesgo Alto</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analisis.filter((a) => a.riesgo?.toLowerCase() === "alto").length}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Riesgo Medio</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {analisis.filter((a) => a.riesgo?.toLowerCase() === "medio").length}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Riesgo Bajo</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analisis.filter((a) => a.riesgo?.toLowerCase() === "bajo").length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="text-base font-semibold mb-4 text-gray-800">
                  Distribución de análisis por nivel de riesgo
                </h4>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          riesgo: "Alto",
                          cantidad: analisis.filter((a) => a.riesgo?.toLowerCase() === "alto").length,
                        },
                        {
                          riesgo: "Medio",
                          cantidad: analisis.filter((a) => a.riesgo?.toLowerCase() === "medio").length,
                        },
                        {
                          riesgo: "Bajo",
                          cantidad: analisis.filter((a) => a.riesgo?.toLowerCase() === "bajo").length,
                        },
                      ]}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="riesgo" tick={{ fontSize: 12, fill: "#4b5563" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                        {["#dc2626", "#facc15", "#16a34a"].map((color, i) => (
                          <Cell key={`cell-${i}`} fill={color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* === TAB 3 — PATRONES === */}
          <TabsContent value="patrones">
            <div className="space-y-8">
              {/* === Sección 1 === */}
              <section>
                <h3 className="text-lg font-semibold mb-2">Patrones en categorías de riesgo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Analiza la frecuencia de cada tipo de reporte (por categoría) en todos los análisis.
                </p>
                <div className="w-full h-[300px] bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const counts = {}
                        analisis.forEach((a) =>
                          a.reportes?.forEach((r) => {
                            const cat = r.scamCategory || "Sin categoría"
                            counts[cat] = (counts[cat] || 0) + 1
                          })
                        )
                        return Object.entries(counts)
                          .map(([categoria, cantidad]) => ({ categoria, cantidad }))
                          .sort((a, b) => b.cantidad - a.cantidad)
                      })()}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 100, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" />
                      <YAxis dataKey="categoria" type="category" tick={{ fontSize: 12, fill: "#4b5563" }} width={120} />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* === Sección 2 === */}
              <section>
                <h3 className="text-lg font-semibold mb-2">Agrupamiento de direcciones repetidas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Revisa wallets o clusters que aparecen en más de un análisis.
                </p>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="py-2 px-3 font-medium text-gray-600">Wallet ID</th>
                        <th className="py-2 px-3 font-medium text-gray-600">Direcciones</th>
                        <th className="py-2 px-3 font-medium text-gray-600">Riesgo Promedio</th>
                        <th className="py-2 px-3 font-medium text-gray-600">Reportes Totales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grouped = {}
                        analisis.forEach((a) => {
                          const id = a.cluster?.wallet_id || "Sin ID"
                          if (!grouped[id])
                            grouped[id] = { direcciones: new Set(), riesgos: [], reportes: 0 }
                          a.cluster?.direccion?.forEach((d) => grouped[id].direcciones.add(d))
                          grouped[id].riesgos.push(a.riesgo?.toUpperCase())
                          grouped[id].reportes += a.reportes?.length || 0
                        })
                        return Object.entries(grouped)
                          .filter(([_, v]) => v.direcciones.size > 1)
                          .map(([wallet, data], i) => {
                            const riesgos = data.riesgos
                            const promedio =
                              riesgos.includes("ALTO")
                                ? "ALTO"
                                : riesgos.includes("MEDIO")
                                ? "MEDIO"
                                : "BAJO"
                            return (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3 font-mono">
                                  <HoverCard>
                                    <HoverCardTrigger className="cursor-pointer text-blue-600 underline">
                                      {wallet}
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                      <p className="text-xs font-medium mb-1">Direcciones:</p>
                                      <ul className="text-xs text-gray-700 space-y-1">
                                        {[...data.direcciones].map((d, j) => (
                                          <li key={j} className="font-mono break-all">
                                            {d}
                                          </li>
                                        ))}
                                      </ul>
                                    </HoverCardContent>
                                  </HoverCard>
                                </td>
                                <td className="py-2 px-3">{data.direcciones.size}</td>
                                <td
                                  className={`py-2 px-3 font-semibold ${
                                    promedio === "ALTO"
                                      ? "text-red-600"
                                      : promedio === "MEDIO"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {promedio}
                                </td>
                                <td className="py-2 px-3">{data.reportes}</td>
                              </tr>
                            )
                          })
                      })()}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* === Sección 3 === */}
              <section>
                <h3 className="text-lg font-semibold mb-2">Indicadores de comportamiento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">Promedio de reportes por análisis</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {analisis.length > 0
                        ? (
                            analisis.reduce(
                              (sum, a) => sum + (a.reportes?.length || 0),
                              0
                            ) / analisis.length
                          ).toFixed(2)
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">% de reportes confiables</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {(() => {
                        const total = analisis.flatMap((a) => a.reportes || []).length
                        const trusted = analisis
                          .flatMap((a) => a.reportes || [])
                          .filter((r) => r.trusted).length
                        return total > 0 ? ((trusted / total) * 100).toFixed(1) + "%" : "-"
                      })()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">Categorías distintas detectadas</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {(() => {
                        const cats = new Set()
                        analisis.forEach((a) =>
                          a.reportes?.forEach((r) => cats.add(r.scamCategory))
                        )
                        return cats.size
                      })()}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>

          {/* === TAB 4 — CRÍTICOS === */}
          <TabsContent value="criticos">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Análisis críticos</h3>
              {analisisCriticos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No se detectaron análisis con nivel de riesgo alto.
                </p>
              ) : (
                <DataTable
                  columns={getColumnsAnalisis()}
                  data={analisisCriticos}
                  filterColumn="_id"
                />
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {loading && <p className="text-gray-500 mt-4">Cargando...</p>}
    </div>
  )
}

export default AnalisisContent


