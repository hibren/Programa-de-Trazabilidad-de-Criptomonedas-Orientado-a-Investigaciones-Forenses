"use client"

const AnalisisTrazabilidadContent = ({ children }) => {
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Contenido dinámico de la pestaña */}
      <div>{children}</div>
    </div>
  )
}

export default AnalisisTrazabilidadContent
