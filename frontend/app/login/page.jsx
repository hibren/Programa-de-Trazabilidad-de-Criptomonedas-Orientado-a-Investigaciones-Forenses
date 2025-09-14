import Button from "@/components/atoms/Button"
import Checkbox from "@/components/atoms/Checkbox"
import Card from "@/components/molecules/Card"
import CardContent from "@/components/molecules/CardContent"
import FormField from "@/components/molecules/FormField"
import PasswordField from "@/components/molecules/PasswordField"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Green with Logo and Branding */}
      <div className="flex-1 bg-green-900 flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md text-center space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-xl">BA</span>
            </div>
            <h1 className="text-3xl font-bold">BlockAnalyzer</h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold leading-tight">Monitoreo y análisis de blockchain en tiempo real</h2>
            <p className="text-lg opacity-90 leading-relaxed">
              Plataforma profesional para el análisis de transacciones, monitoreo de direcciones y detección de riesgos
              en blockchain.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Análisis de transacciones en tiempo real</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Detección automática de riesgos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Monitoreo de direcciones vigiladas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card shadow="lg">
            <CardContent>
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h2>
                <p className="text-center text-gray-600">Ingresa tus credenciales para acceder a BlockAnalyzer</p>
              </div>

              <form className="space-y-4">
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                />

                <PasswordField
                  id="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  required
                />

                <div className="flex items-center justify-between">
                  <Checkbox
                    id="remember"
                    label="Recordarme"
                    variant="success"
                  />
                  <a href="#" className="text-sm text-green-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <Button type="submit" variant="success" className="w-full">
                  Iniciar Sesión
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600 mt-6">
                ¿No tienes una cuenta?{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Contacta al administrador
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}