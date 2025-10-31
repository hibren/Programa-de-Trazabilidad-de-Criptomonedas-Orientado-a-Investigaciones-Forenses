"use client"

import TrazabilidadList from "@/components/organisms/TrazabilidadList" // Ajustá la ruta si usás otro esquema

export default function Page() {
  return (
    <div className="p-6">
      {/* Encabezado principal */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span> Resultados de Trazabilidad</span>
        </h1>
        <p className="text-sm text-gray-500">
          Flujos de fondos detectados desde origen a destino
        </p>
      </div>

      {/* Componente principal de la sección */}
      <TrazabilidadList />
    </div>
  )
}
