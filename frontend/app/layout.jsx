import '../src/styles/globals.css' // tus estilos globales

export const metadata = {
  title: 'Trazabilidad de Criptomonedas',
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
