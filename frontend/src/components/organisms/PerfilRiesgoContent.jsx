"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Shield } from "lucide-react"
import { DataTable } from "@/components/DataTable/DataTable"
import { getColumnsPerfilRiesgo } from "@/components/DataTable/columns/getColumnsPerfilRiesgo"
import { useToast } from "@/components/ui/use-toast"

const API_URL = "http://localhost:8000"

export default function PerfilRiesgoContent() {
  const [direcciones, setDirecciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const { toast } = useToast()

  const loadDirecciones = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/direcciones`)
      const data = await res.json()
      setDirecciones(data)
    } catch (error) {
      toast({
        title: "Error al cargar direcciones",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const reAnalizarTodo = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/analisis/riesgo`, { method: "POST" })
      const data = await res.json()
      toast({
        title: "Reanálisis completado",
        description: `${data.analizadas} direcciones analizadas`,
      })
      await loadDirecciones()
    } catch (error) {
      toast({
        title: "Error al reanalizar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Reanalizar una dirección individual
  const actualizarRiesgoIndividual = async (direccion) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/analisis/riesgo?direccion=${direccion}`, {
        method: "POST",
      })
      const data = await res.json()
      toast({
        title: "Riesgo actualizado",
        description: `Dirección ${direccion} → Nivel: ${data?.resultados?.[0]?.nivel || "Desconocido"}`,
      })
      await loadDirecciones()
    } catch (error) {
      toast({
        title: "Error al actualizar riesgo",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDirecciones()
  }, [])

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Monitoreo de Perfiles de Riesgo
        </h2>
        <Button onClick={reAnalizarTodo} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading && "animate-spin"}`} />
          {loading ? "Actualizando..." : "Reanalizar Todo"}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Direcciones Monitoreadas</h3>
        <DataTable
          columns={getColumnsPerfilRiesgo(setSelected, actualizarRiesgoIndividual)}
          data={direcciones}
          filterColumn="direccion"
        />
      </div>

      {/* Modal de detalle */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] sm:w-[450px] p-6">
            <h2 className="text-lg font-semibold mb-3">Detalle de Riesgo</h2>
            <p className="text-sm mb-2">
              <strong>Dirección:</strong>{" "}
              <span className="font-mono">{selected.direccion}</span>
            </p>
            <p className="text-sm mb-1">
              <strong>Nivel:</strong> {selected.perfil_riesgo}
            </p>
            <p className="text-sm mb-1">
              <strong>Total puntos:</strong> {selected.total ?? "N/A"}
            </p>
            <p className="text-sm mb-1">
              <strong>Reportes:</strong> {selected.cantidad_reportes}
            </p>
            <p className="text-sm mb-1">
              <strong>Actividad:</strong> {selected.actividad}
            </p>
            <p className="text-sm mb-1">
              <strong>Categorías:</strong>{" "}
              {selected.categorias?.join(", ") || "N/A"}
            </p>
            {selected.ponderaciones && (
              <div className="mt-3">
                <p className="font-semibold">Ponderaciones:</p>
                <ul className="list-disc ml-5 text-sm">
                  <li>Reportes: {selected.ponderaciones.reportes}</li>
                  <li>Categorías: {selected.ponderaciones.categorias}</li>
                  <li>Actividad: {selected.ponderaciones.actividad}</li>
                </ul>
              </div>
            )}
            <div className="mt-5 text-right">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

