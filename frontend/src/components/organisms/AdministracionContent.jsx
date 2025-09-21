"use client"

const AdministracionContent = ({ activeTab }) => {
  switch (activeTab) {
    case "usuarios":
      return <div className="bg-white p-6 rounded-lg shadow-sm">Gestión de Usuarios</div>
    case "roles":
      return <div className="bg-white p-6 rounded-lg shadow-sm">Gestión de Roles y Permisos</div>
    case "reglas":
      return <div className="bg-white p-6 rounded-lg shadow-sm">Configuración de Reglas de Riesgo</div>
    case "alertas":
      return <div className="bg-white p-6 rounded-lg shadow-sm">Configuración de Alertas</div>
    case "conectores":
      return <div className="bg-white p-6 rounded-lg shadow-sm">Gestión de Conectores Externos</div>
    default:
      return <div className="bg-white p-6 rounded-lg shadow-sm">Seleccione una opción</div>
  }
}

export default AdministracionContent
