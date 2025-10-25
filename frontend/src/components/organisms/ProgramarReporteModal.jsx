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
import { Plus } from "lucide-react"

export default function ProgramarReporteModal() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    formato: "",
    frecuencia: "",
    fecha: "",
    activo: true,
  })

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    console.log("Reporte programado:", formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white">
          <Plus className="h-4 w-4" /> Programar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Programar nuevo reporte</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Nombre del reporte</Label>
            <Input
              placeholder="Ej: Reporte Semanal de Riesgo"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          <div>
            <Label>Tipo de reporte</Label>
            <Select onValueChange={(v) => handleChange("tipo", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="riesgo">Reporte de Riesgo por Dirección</SelectItem>
                <SelectItem value="actividad">Reporte de Actividad por Período</SelectItem>
                <SelectItem value="clusters">Reporte de Clusters y Redes</SelectItem>
                <SelectItem value="alertas">Reporte de Alertas</SelectItem>
                <SelectItem value="compliance">Reporte de Compliance</SelectItem>
                <SelectItem value="ejecutivo">Reporte Ejecutivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Formato de salida</Label>
            <Select onValueChange={(v) => handleChange("formato", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar formato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="pptx">PowerPoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Frecuencia</Label>
            <Select onValueChange={(v) => handleChange("frecuencia", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar frecuencia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fecha y hora de inicio</Label>
            <Input
              type="datetime-local"
              value={formData.fecha}
              onChange={(e) => handleChange("fecha", e.target.value)}
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button className="bg-green-700 hover:bg-green-800 text-white" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
