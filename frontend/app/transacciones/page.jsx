import Sidebar from "../../src/components/organisms/SideBar"
import TransaccionesContent from "../../src/components/organisms/TransaccionesContent"

export default function TransaccionesPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="transacciones" />
      <TransaccionesContent />
    </div>
  )
}
