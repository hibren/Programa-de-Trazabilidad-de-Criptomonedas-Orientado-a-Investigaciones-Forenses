import Button from "@/components/atoms/Button"
import Checkbox from "@/components/atoms/Checkbox"
import Card from "@/components/molecules/Card"
import CardContent from "@/components/molecules/CardContent"
import FormField from "@/components/molecules/FormField"
import PasswordField from "@/components/molecules/PasswordField"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-green-50 to-gray-100">
      {/* Left Side - Responsive Rounded Logo */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-[32rem] lg:h-[32rem] rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/logo2.png"
            alt="Block Analyzer Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card shadow="lg">
            <CardContent>
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h2>
                <p className="text-center text-gray-600">
                  Ingresa tus credenciales para acceder a BlockAnalyzer
                </p>
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
                  <Checkbox id="remember" label="Recordarme" variant="success" />
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




