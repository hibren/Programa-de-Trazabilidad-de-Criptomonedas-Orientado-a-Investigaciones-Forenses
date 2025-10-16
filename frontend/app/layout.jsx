//"use client"

import '../src/styles/globals.css' // tus estilos globales
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'Trazabilidad de Criptomonedas',
  description: 'Descripción del proyecto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
