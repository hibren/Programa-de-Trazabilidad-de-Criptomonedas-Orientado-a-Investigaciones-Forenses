"use client"

import AnalisisGraph from "@/components/organisms/AnalisisGraph"

export default function GrafoPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Mapa de Relaciones Globales</h2>
      <p className="text-gray-500 mb-4">
        Visualización interactiva de vínculos entre direcciones, dominios y wallets.
      </p>

      <AnalisisGraph />
    </div>
  )
}
