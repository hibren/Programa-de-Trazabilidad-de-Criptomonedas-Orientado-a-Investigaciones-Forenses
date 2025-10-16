"use client"

import { useAuth } from "@/contexts/AuthContext"
import Button from "../atoms/Button"

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, perfil } = useAuth()

  if (!isOpen || !user) return null

  // Corrige el problema de la zona horaria al mostrar la fecha
  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    // La fecha de la base de datos puede ser interpretada como UTC,
    // lo que puede causar que se muestre el día anterior en zonas horarias locales.
    // Para corregirlo, creamos una nueva fecha usando las partes UTC de la fecha original.
    const date = new Date(dateString);
    const correctedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return correctedDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          {user.datos_personales.nombre} {user.datos_personales.apellido}
          {perfil && <span className="text-lg font-medium text-gray-500"> ({perfil.nombre})</span>}
        </h2>
        <div className="space-y-4 mt-4">
          <div className="flex justify-between border-b pb-2">
            <p className="font-semibold text-gray-600">Nombre:</p>
            <p className="text-gray-800">{user.datos_personales.nombre}</p>
          </div>
          <div className="flex justify-between border-b pb-2">
            <p className="font-semibold text-gray-600">Apellido:</p>
            <p className="text-gray-800">{user.datos_personales.apellido}</p>
          </div>
          <div className="flex justify-between border-b pb-2">
            <p className="font-semibold text-gray-600">Usuario/Email:</p>
            <p className="text-gray-800">{user.username}</p>
          </div>
          <div className="flex justify-between border-b pb-2">
            <p className="font-semibold text-gray-600">CUIT:</p>
            <p className="text-gray-800">{user.datos_personales.cuit}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-semibold text-gray-600">Fecha de Nacimiento:</p>
            <p className="text-gray-800">{getFormattedDate(user.datos_personales.fecha_nacimiento)}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">Cerrar</Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal