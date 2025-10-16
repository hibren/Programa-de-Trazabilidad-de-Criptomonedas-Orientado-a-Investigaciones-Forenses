"use client"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Button from "../atoms/Button"
import Icon from "../atoms/Icon"
import ProfileModal from "./ProfileModal"

const TopBar = ({
  title = "Dashboard Principal",
  subtitle = "Monitoreo y análisis de blockchain en tiempo real",
}) => {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              {subtitle}
            </p>
          </div>

          {/* Actions Section (solo avatar y nombre) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Usuario Avatar */}
            <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={handleOpenModal}>
              <Icon name="user" size={20} />
            </Button>

            {/* Nombre del usuario */}
            <div className="hidden md:block text-sm text-gray-600 whitespace-nowrap">
              {user ? `${user.datos_personales.nombre} ${user.datos_personales.apellido}` : "Usuario"}
            </div>
          </div>
        </div>
      </div>
      <ProfileModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}

export default TopBar
