import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BarChart3, PlusCircle, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Huella Digital — Inteligencia Comercial Local",
  description: "Análisis de crecimiento para negocios locales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-indigo-700 text-lg">
              <BarChart3 className="w-5 h-5" />
              Huella Digital
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/nuevo"
                className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Nuevo análisis
              </Link>
              <Link
                href="/configuracion"
                className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
