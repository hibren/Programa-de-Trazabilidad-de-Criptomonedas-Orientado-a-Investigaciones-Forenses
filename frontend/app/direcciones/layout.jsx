import Sidebar from "@/components/organisms/SideBar"
import TopBar from "@/components/organisms/TopBar"

export default function DireccionesLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fijo */}
      <Sidebar activeItem="direcciones" />

      {/* Contenido corrido */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          title="Gestión de Direcciones"
          subtitle="Administra y monitorea direcciones blockchain"
        />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}
