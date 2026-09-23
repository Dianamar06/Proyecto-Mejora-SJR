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
  title: "Mejora SJR — Panel Administrativo",
  description:
    "Panel de gestión y seguimiento de reportes ciudadanos urbanos del Municipio de San Juan del Río, Querétaro. Exclusivo para personal del Ayuntamiento.",
  keywords: ["reportes ciudadanos", "San Juan del Río", "Querétaro", "panel administrativo", "municipio"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0B0F19] text-slate-100">{children}</body>
    </html>
  );
}
