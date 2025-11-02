import { redirect } from "next/navigation"

export default function AnalisisPage() {
  // Redirige automáticamente a la pestaña principal (Trazabilidad)
  redirect("/analisis/trazabilidad")
}
