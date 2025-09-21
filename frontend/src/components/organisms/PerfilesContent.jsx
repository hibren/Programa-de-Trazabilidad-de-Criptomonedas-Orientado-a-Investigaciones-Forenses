"use client"

const PerfilesContent = ({ activeTab }) => {
  switch (activeTab) {
    case "direcciones":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Scoring de Direcciones</h2>
          <p className="text-sm text-gray-600 mt-2">
            Evaluación dinámica de direcciones con puntajes de riesgo y patrones asociados.
          </p>
        </div>
      )
    case "transacciones":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Scoring de Transacciones</h2>
          <p className="text-sm text-gray-600 mt-2">
            Análisis y actualización del riesgo de transacciones basado en actividad sospechosa.
          </p>
        </div>
      )
    case "clusters":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Clústers de Direcciones</h2>
          <p className="text-sm text-gray-600 mt-2">
            Identificación y evaluación de grupos de direcciones vinculadas.
          </p>
        </div>
      )
    case "monitoreo":
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Monitoreo Continuo</h2>
          <p className="text-sm text-gray-600 mt-2">
            Generación automática de alertas ante detección de comportamientos sospechosos.
          </p>
        </div>
      )
    default:
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          Seleccione un tab para visualizar el contenido.
        </div>
      )
  }
}

export default PerfilesContent
