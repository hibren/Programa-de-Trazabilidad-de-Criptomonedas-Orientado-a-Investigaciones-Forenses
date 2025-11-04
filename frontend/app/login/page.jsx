"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetch("http://localhost:8000/administracion/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error en login");
      }

      const data = await res.json()
      login(data.access_token)

      await Swal.fire({
        title: '¡Éxito!',
        text: 'Inicio de sesión exitoso. Redirigiendo...',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#f8fafc', // zinc-50
        color: '#18181b', // zinc-900
      });

      router.push("/dashboard")
    } catch (err) {
      Swal.fire({
        title: 'Error de autenticación',
        text: err.message || "Credenciales inválidas",
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#166534', // green-800
        background: '#f8fafc',
        color: '#18181b',
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Imagen de fondo */}
      <div className="flex-1 bg-green-900 relative">
        <Image
          src="/fotologin.png"
          alt="Block Analyzer Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay más suave */}
        <div className="absolute inset-0 bg-green-900/50" />
      </div>

      {/* Right Side - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-gray-100">
        <div className="relative w-full max-w-md">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-green-700" />
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card p-8 rounded-xl shadow-xl"
          >
          <h1 className="text-2xl font-bold text-center text-foreground">
            Iniciar sesión
          </h1>
          <p className="text-center text-muted-foreground">
            Ingresa tus credenciales para acceder a BlockAnalyzer
          </p>

          <div className="space-y-2">
            <Label htmlFor="email">Usuario</Label>
            <Input
              id="email"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario@dominio.com"
              required
              className="bg-background text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="bg-background text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 shrink-0" />
                ) : (
                  <EyeIcon className="h-5 w-5 shrink-0" />
                )}
              </button>
            </div>
            <Link href="/forgot-password">
              <p className="text-sm text-muted-foreground text-right cursor-pointer hover:underline">
                ¿Has olvidado tu contraseña?
              </p>
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500 transition-colors"
            >
            Iniciar sesión
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes una cuenta?{" "}
            <a href="#" className="text-green-600 hover:underline">
              Contacta al administrador
            </a>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}
