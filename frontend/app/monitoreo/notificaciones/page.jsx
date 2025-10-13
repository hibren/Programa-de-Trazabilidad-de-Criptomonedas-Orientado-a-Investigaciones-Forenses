"use client"

import React, { useState } from "react"
import Card from "@/components/molecules/Card"
import Switch from "@/components/atoms/Switch"

export default function NotificacionesPage() {
  const [config, setConfig] = useState({
    email: false,
    sms: false,
    push: true,
  })

  const handleToggle = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card className="bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">
        Configuración de Notificaciones
      </h2>

      <div className="space-y-4">
        {/* EMAIL */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
          <div>
            <p className="font-medium text-gray-800">Email</p>
            <p className="text-sm text-gray-500">
              Recibir alertas por correo electrónico
            </p>
          </div>
          <Switch checked={config.email} onCheckedChange={() => handleToggle("email")} />
        </div>

        {/* SMS */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
          <div>
            <p className="font-medium text-gray-800">SMS</p>
            <p className="text-sm text-gray-500">
              Recibir alertas por mensaje de texto
            </p>
          </div>
          <Switch checked={config.sms} onCheckedChange={() => handleToggle("sms")} />
        </div>

        {/* PUSH */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
          <div>
            <p className="font-medium text-gray-800">Push</p>
            <p className="text-sm text-gray-500">
              Notificaciones push en el navegador
            </p>
          </div>
          <Switch checked={config.push} onCheckedChange={() => handleToggle("push")} />
        </div>
      </div>
    </Card>
  )
}
