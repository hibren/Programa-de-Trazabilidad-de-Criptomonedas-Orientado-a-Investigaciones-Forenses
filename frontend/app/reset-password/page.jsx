"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Swal from 'sweetalert2'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, KeyRound, ArrowLeft } from "lucide-react"

function ResetPasswordFormComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
    } else {
       Swal.fire({
        title: 'Error',
        text: 'No se ha proporcionado un token de recuperación.',
        icon: 'error',
        confirmButtonText: 'Volver',
        confirmButtonColor: '#166534',
      }).then(() => router.push('/login'));
    }
  }, [searchParams, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/administracion/usuarios/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "No se pudo restablecer la contraseña.");
      }

      await Swal.fire({
        title: '¡Éxito!',
        text: 'Tu contraseña ha sido restablecida. Ahora puedes iniciar sesión.',
        icon: 'success',
        confirmButtonText: 'Ir a Iniciar Sesión',
        confirmButtonColor: '#166534',
      })
      router.push('/login')

    } catch (err) {
       Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#166534',
      });
    } finally {
      setIsLoading(false)
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
            <KeyRound className="mx-auto h-12 w-12 text-green-700" />
            <h1 className="text-2xl font-bold text-foreground mt-4">
                Restablecer Contraseña
            </h1>
            <p className="text-muted-foreground mt-2">
                Ingresa tu nueva contraseña a continuación.
            </p>
        </div>
        {token ? (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
                />
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500 transition-colors"
            >
                Restablecer Contraseña
            </Button>
            </form>
        ) : (
             <div className="text-center">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        )}
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


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordFormComponent />
        </Suspense>
    )
}
