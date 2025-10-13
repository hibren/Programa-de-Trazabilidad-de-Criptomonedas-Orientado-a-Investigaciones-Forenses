import Badge from "@/components/atoms/Badge"

export default function StatusTag({ value }) {
  const variants = {
    Activa: "success",
    "En Revisión": "warning",
    Revisada: "secondary",
  }

  return <Badge variant={variants[value] || "secondary"}>{value}</Badge>
}
