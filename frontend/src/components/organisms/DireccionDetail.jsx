"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/DataTable/DataTable"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, ArrowDownRight, ArrowUpRight, Wallet, List, Activity } from "lucide-react"

const API_URL = "http://localhost:8000"

export default function DireccionDetail({ direccion }) {
  const [info, setInfo] = useState(null)
  const [transacciones, setTransacciones] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [infoRes, txRes] = await Promise.all([
          fetch(`${API_URL}/direcciones/${direccion}`).then((r) => r.json()),
          fetch(`${API_URL}/direcciones/${direccion}/transacciones`).then((r) => r.json()),
        ])
        setInfo(infoRes)
        setTransacciones(txRes)
      } catch (err) {
        console.error("Error al cargar datos:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [direccion])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600">
        No se encontró información para la dirección <strong className="ml-1">{direccion}</strong>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      {/* Encabezado limpio con la dirección */}
      <div className="mb-8 border-l-4 border-green-700 pl-4">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          Dirección analizada
        </p>
        <p className="font-mono text-lg text-gray-800">{direccion}</p>
      </div>

      {/* === TABS === */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="flex gap-2 bg-transparent mb-6">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="bloques">Bloques</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="analisis">Análisis</TabsTrigger>
        </TabsList>

        {/* === TAB: RESUMEN === */}
        <TabsContent value="resumen">
          {/* PANEL DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs uppercase text-gray-500">Balance Final</p>
                <h3 className="text-xl font-semibold text-gray-900 font-mono">{info.final_balance} BTC</h3>
                <p className="text-xs text-gray-500">Disponible actualmente</p>
              </div>
              <Wallet className="text-green-700 w-6 h-6 opacity-80" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs uppercase text-gray-500">Total Recibido</p>
                <h3 className="text-xl font-semibold text-gray-900 font-mono">{info.total_recibido} BTC</h3>
                <p className="text-xs text-gray-500">Acumulado</p>
              </div>
              <ArrowDownRight className="text-green-600 w-6 h-6 opacity-80" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs uppercase text-gray-500">Total Enviado</p>
                <h3 className="text-xl font-semibold text-gray-900 font-mono">{info.total_enviado} BTC</h3>
                <p className="text-xs text-gray-500">Acumulado</p>
              </div>
              <ArrowUpRight className="text-red-600 w-6 h-6 opacity-80" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs uppercase text-gray-500">Transacciones</p>
                <h3 className="text-xl font-semibold text-gray-900 font-mono">
                  {transacciones.length}
                </h3>

                <p className="text-xs text-gray-500">Histórico</p>
              </div>
              <List className="text-gray-600 w-6 h-6 opacity-80" />
            </div>
          </div>

          {/* PERFIL DE RIESGO + ESTADO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfil de Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Nivel de riesgo asociado a la dirección según su comportamiento histórico.
                </p>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    info.perfil_riesgo === "alto"
                      ? "bg-red-100 text-red-700"
                      : info.perfil_riesgo === "medio"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {info.perfil_riesgo?.toUpperCase()}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  <p>Primera transacción: {info.primer_tx || "N/A"}</p>
                  <p>Última transacción: {info.ultima_tx || "N/A"}</p>
                  <p>Estado actual: <span className="text-green-700 font-medium">Activa</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === TAB: TRANSACCIONES === */}
        <TabsContent value="transacciones">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Asociadas</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={transacciones}
                columns={[
                  { accessorKey: "hash", header: "Hash" },
                  { accessorKey: "fecha", header: "Fecha" },
                  { accessorKey: "monto_total", header: "Monto (BTC)" },
                  { accessorKey: "estado", header: "Estado" },
                  { accessorKey: "confirmations", header: "Confirmaciones" },
                ]}
                filterColumn="hash"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB: BLOQUES === */}
        <TabsContent value="bloques">
          <Card>
            <CardHeader>
              <CardTitle>Bloques Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {info.bloques?.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1">
                  {info.bloques.map((b, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      Bloque #{b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sin bloques asociados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB: HISTORIAL === */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>Primera transacción: {info.primer_tx || "N/A"}</li>
                <li>Última transacción: {info.ultima_tx || "N/A"}</li>
                <li>Total de operaciones: {info.n_tx || 0}</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB: ANÁLISIS === */}
        <TabsContent value="analisis">
          <Card>
            <CardHeader>
              <CardTitle>Trazabilidad y Análisis de Red</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[500px] bg-white rounded shadow flex items-center justify-center">
                <p className="text-gray-500">[Grafo interactivo aquí]</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
