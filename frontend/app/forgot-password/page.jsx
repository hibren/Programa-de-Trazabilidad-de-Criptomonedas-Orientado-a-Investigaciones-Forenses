"use client"

import { useState } from "react"
import Link from "next/link"
import Swal from 'sweetalert2'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/administracion/usuarios/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // ¡IMPORTANTE! Verificar si la respuesta de la API fue exitosa (status 2xx)
      if (!response.ok) {
        // Si no fue exitosa, intenta leer el error del backend
        const errorData = await response.json().catch(() => ({ detail: "Error desconocido del servidor." }));
        // Lanza un error para que sea capturado por el bloque catch
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      // Si todo fue bien, muestra el mensaje de éxito
      Swal.fire({
        title: 'Petición enviada',
        text: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#166534',
        background: '#f8fafc',
        color: '#18181b',
      });

    } catch (err) {
       // Ahora sí capturaremos los errores del backend aquí
       Swal.fire({
        title: 'Error',
        text: err.message || 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#166534',
        background: '#f8fafc',
        color: '#18181b',
      });
    } finally {
      setIsLoading(false)
      setEmail("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
      <div className="relative w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-xl">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="h-12 w-12 animate-spin text-green-700" />
          </div>
        )}
        <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-green-700" />
            <h1 className="text-2xl font-bold text-foreground mt-4">
                ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-muted-foreground mt-2">
                No te preocupes. Ingresa tu correo y te enviaremos un enlace para recuperarla.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@dominio.com"
              required
              className="bg-background text-foreground"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500 transition-colors"
          >
            Enviar enlace de recuperación
          </Button>
        </form>
         <div className="text-center">
            <Link href="/login">
                <span className="text-sm text-green-600 hover:underline flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Iniciar sesión
                </span>
            </Link>
        </div>
      </div>
    </div>
  )
}
