import Sidebar from "../src/components/organisms/SideBar"
import TopBar from "../src/components/organisms/TopBar"
import DashboardContent from "../src/components/organisms/DashboardContent"

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeItem="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <TopBar />

        {/* Dashboard Content */}
        <DashboardContent />
      </div>
    </div>
  )
}
