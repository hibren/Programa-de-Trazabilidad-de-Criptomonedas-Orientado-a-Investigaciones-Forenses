import Badge from "@/components/atoms/Badge"

export default function SeverityBadge({ level }) {
  const variants = {
    Crítica: "danger",
    Media: "success",
    Baja: "secondary",
  }

  return <Badge variant={variants[level] || "secondary"}>{level}</Badge>
}
