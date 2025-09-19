import Button from "@/components/atoms/Button"
import Checkbox from "@/components/atoms/Checkbox"
import Card from "@/components/molecules/Card"
import CardContent from "@/components/molecules/CardContent"
import FormField from "@/components/molecules/FormField"
import PasswordField from "@/components/molecules/PasswordField"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Green Background with Logo */}
      <div className="flex-1 bg-green-900 relative">
  <Image
    src="/fotologin.png"
    alt="Block Analyzer Background"
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-green-900/70" /> {/* overlay */}
</div>


      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-gray-100">
        <div className="w-full max-w-md">
          <Card shadow="2xl" className="rounded-2xl">

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

                <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-500"
              >
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





