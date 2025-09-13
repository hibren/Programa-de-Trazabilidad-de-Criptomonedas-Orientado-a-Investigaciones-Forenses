import Sidebar from "../../src/components/organisms/SideBar"
import DireccionesContent from "@/components/organisms/DireccionesContent"

export default function DireccionesPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="direcciones" />
      <DireccionesContent />
    </div>
  )
}
