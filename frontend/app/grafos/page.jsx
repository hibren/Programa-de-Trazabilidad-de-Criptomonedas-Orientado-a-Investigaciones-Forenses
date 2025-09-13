import GrafosContent from "../../src/components/organisms/GrafosContent"
import Sidebar from "../../src/components/organisms/SideBar"


export default function GrafosPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="grafos" />
      <GrafosContent />
    </div>
  )
}
