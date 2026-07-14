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

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TenantProvider } from '@/context/TenantContext';

export const metadata: Metadata = {
  title: "Quotix Travel - Panel de Agentes",
  description: "Plataforma de gestión de cotizaciones y ventas para agencias de viajes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TenantProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
