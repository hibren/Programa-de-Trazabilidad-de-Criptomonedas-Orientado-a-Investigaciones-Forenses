import '../src/styles/globals.css' // tus estilos globales
import { ThemeProvider } from '../src/components/ui/ThemeProvider'
export const metadata = {
  title: 'Mi Proyecto',
  description: 'Descripción del proyecto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
