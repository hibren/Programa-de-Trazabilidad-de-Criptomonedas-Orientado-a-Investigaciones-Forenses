import { redirect } from "next/navigation"

export default function ReportesPage() {
  // 🔁 Redirige automáticamente a la pestaña principal (Generar)
  redirect("/reportes/generar")
}
