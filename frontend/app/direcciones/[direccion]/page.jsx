import Sidebar from "@/components/organisms/SideBar"
import DireccionDetail from "@/components/organisms/DireccionDetail"

export default function DireccionPage({ params }) {
  const { direccion } = params

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="direcciones" />
      <DireccionDetail direccion={direccion} />
    </div>
  )
}
