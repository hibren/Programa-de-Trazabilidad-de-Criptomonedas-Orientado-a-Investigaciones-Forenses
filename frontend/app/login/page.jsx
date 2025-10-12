"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("http://127.0.0.1:8000/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw new Error("Error en login")
      }

      const data = await res.json()
      localStorage.setItem("token", data.token)
      setSuccess(true)
    } catch (err) {
      setError("Credenciales inválidas")
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
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl shadow-xl"
        >
          <h1 className="text-2xl font-bold text-center text-foreground">
            Iniciar sesión
          </h1>
          <p className="text-center text-muted-foreground">
            Ingresa tus credenciales para acceder a BlockAnalyzer
          </p>

          {error && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                ✅ Inicio de sesión exitoso
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
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
            <p className="text-sm text-muted-foreground text-right cursor-pointer hover:underline">
              ¿Has olvidado tu contraseña?
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
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
  )
}






