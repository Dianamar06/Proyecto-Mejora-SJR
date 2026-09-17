import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mejora SJR - Admin",
  description: "Panel de administración de Mejora SJR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col overflow-hidden bg-gray-50">
        {/* Header superior oscuro */}
        <header className="relative z-20 flex h-16 shrink-0 items-center bg-gray-900 px-4 md:px-6 text-white shadow-md">
          <h1 className="text-xl font-bold tracking-tight">Mejora SJR</h1>
        </header>

        {/* Contenedor principal (Sidebar + Contenido) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar lateral izquierdo */}
          <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex overflow-y-auto">
            <nav className="flex-1 space-y-2 px-4 py-6">
              <div className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900">
                Dashboard
              </div>
              <div className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                Usuarios
              </div>
              <div className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                Reportes
              </div>
              <div className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                Configuración
              </div>
            </nav>
          </aside>

          {/* Área central principal (inyección de pantallas) */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
