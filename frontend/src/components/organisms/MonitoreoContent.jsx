"use client"

const MonitoreoContent = ({ activeTab }) => {
  switch (activeTab) {
    case "alertas":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Alertas Activas</h2>
          <p className="text-sm text-gray-600 mt-2">
            Listado de alertas en tiempo real generadas por patrones sospechosos.
          </p>
        </div>
      )
    case "historial":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Alertas</h2>
          <p className="text-sm text-gray-600 mt-2">
            Registro histórico de alertas generadas por el sistema.
          </p>
        </div>
      )
    case "reglas":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Reglas de Monitoreo</h2>
          <p className="text-sm text-gray-600 mt-2">
            Configuración de umbrales, triggers y condiciones de monitoreo.
          </p>
        </div>
      )
    case "clusters":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Clusters Sospechosos</h2>
          <p className="text-sm text-gray-600 mt-2">
            Identificación de conexiones entre direcciones agrupadas en clusters.
          </p>
        </div>
      )
    default:
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          Seleccione una pestaña para visualizar el contenido.
        </div>
      )
  }
}

export default MonitoreoContent
