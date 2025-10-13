import AlertasDashboard from "@/components/organisms/AlertasDashboard"

export default function PageAlertas() {
  const alertas = [
    {
      id: "ALT_001",
      tipo: "Alto Riesgo",
      severidad: "Crítica",
      mensaje: "Transacción sospechosa detectada",
      direccion: "1A1zP1eP5QGefi2...",
      estado: "Activa",
      fecha: "2024-01-15 14:30:00",
    },
    {
      id: "ALT_002",
      tipo: "Nuevo Patrón",
      severidad: "Media",
      mensaje: "Patrón de lavado identificado",
      direccion: "3J98t1WpEZ73CNm...",
      estado: "En Revisión",
      fecha: "2024-01-15 13:15:00",
    },
    {
      id: "ALT_003",
      tipo: "Volumen Alto",
      severidad: "Baja",
      mensaje: "Volumen inusual en dirección vigilada",
      direccion: "1BvBMSEYstWetqT...",
      estado: "Revisada",
      fecha: "2024-01-15 12:00:00",
    },
  ]

  return <AlertasDashboard alertas={alertas} />
}
