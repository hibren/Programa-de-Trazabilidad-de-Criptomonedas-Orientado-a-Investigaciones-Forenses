"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2 } from "lucide-react"

export default function ProgramarReporteModal({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    formato: "",
    frecuencia: "",
    fecha_inicio: "",
    activo: true,
    // Campos condicionales
    direccion_hash: "",
    fecha_inicio_periodo: "",
    fecha_fin_periodo: "",
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    if (!formData.nombre || !formData.tipo || !formData.formato || !formData.frecuencia || !formData.fecha_inicio) {
      return "Por favor completa todos los campos obligatorios"
    }

    // Validaciones específicas por tipo
    if (formData.tipo === "riesgo" && !formData.direccion_hash) {
      return "Los reportes de riesgo requieren una dirección"
    }

    if (formData.tipo === "actividad") {
      if (!formData.fecha_inicio_periodo || !formData.fecha_fin_periodo) {
        return "Los reportes de actividad requieren un rango de fechas"
      }
    }

    return null
  }

  const handleSubmit = async () => {
    setError(null)
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // Preparar datos según el tipo de reporte
      const payload = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        formato: formData.formato,
        frecuencia: formData.frecuencia,
        fecha_inicio: formData.fecha_inicio,
        activo: formData.activo,
      }

      // Agregar campos específicos
      if (formData.tipo === "riesgo") {
        payload.direccion_hash = formData.direccion_hash
      }

      if (formData.tipo === "actividad") {
        payload.fecha_inicio_periodo = formData.fecha_inicio_periodo
        payload.fecha_fin_periodo = formData.fecha_fin_periodo
      }

      const response = await fetch(`${API_BASE_URL}/reportes-programados/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al crear el reporte")
      }

      const data = await response.json()
      console.log("✅ Reporte programado creado:", data)

      // Resetear formulario
      setFormData({
        nombre: "",
        tipo: "",
        formato: "",
        frecuencia: "",
        fecha_inicio: "",
        activo: true,
        direccion_hash: "",
        fecha_inicio_periodo: "",
        fecha_fin_periodo: "",
      })

      // Cerrar modal
      setOpen(false)

      // Callback de éxito (para refrescar lista)
      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      console.error("❌ Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white">
          <Plus className="h-4 w-4" /> Programar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programar nuevo reporte</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 py-2">
          <div>
            <Label>Nombre del reporte *</Label>
            <Input
              placeholder="Ej: Reporte Semanal de Riesgo"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          <div>
            <Label>Tipo de reporte *</Label>
            <Select onValueChange={(v) => handleChange("tipo", v)} value={formData.tipo}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="riesgo">Reporte de Riesgo por Dirección</SelectItem>
                <SelectItem value="actividad">Reporte de Actividad por Período</SelectItem>
                <SelectItem value="clusters">Reporte de Clusters y Redes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos condicionales según tipo */}
          {formData.tipo === "riesgo" && (
            <div>
              <Label>Dirección blockchain *</Label>
              <Input
                placeholder="0x..."
                value={formData.direccion_hash}
                onChange={(e) => handleChange("direccion_hash", e.target.value)}
              />
            </div>
          )}

          {formData.tipo === "actividad" && (
            <>
              <div>
                <Label>Fecha inicio del período *</Label>
                <Input
                  type="date"
                  value={formData.fecha_inicio_periodo}
                  onChange={(e) => handleChange("fecha_inicio_periodo", e.target.value)}
                />
              </div>
              <div>
                <Label>Fecha fin del período *</Label>
                <Input
                  type="date"
                  value={formData.fecha_fin_periodo}
                  onChange={(e) => handleChange("fecha_fin_periodo", e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <Label>Formato de salida *</Label>
            <Select onValueChange={(v) => handleChange("formato", v)} value={formData.formato}>
              <SelectTrigger><SelectValue placeholder="Seleccionar formato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Frecuencia *</Label>
            <Select onValueChange={(v) => handleChange("frecuencia", v)} value={formData.frecuencia}>
              <SelectTrigger><SelectValue placeholder="Seleccionar frecuencia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fecha y hora de inicio *</Label>
            <Input
              type="datetime-local"
              value={formData.fecha_inicio}
              onChange={(e) => handleChange("fecha_inicio", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.activo}
              onCheckedChange={(checked) => handleChange("activo", checked)}
            />
            <Label>Activar reporte al guardar</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            className="bg-green-700 hover:bg-green-800 text-white" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}