import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Arya Estética — Posadas, Misiones",
    template: "%s | Arya Estética",
  },
  description:
    "Centro de estética en Posadas, Misiones. Tratamientos capilares, uñas, masoterapia, cosmetología, maquillaje y depilación láser.",
  keywords: ["estética", "posadas", "misiones", "tratamientos", "belleza", "arya"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arya Estética",
  },
  openGraph: {
    type:        "website",
    locale:      "es_AR",
    siteName:    "Arya Estética",
    title:       "Arya Estética — Posadas, Misiones",
    description: "Centro de estética en Posadas, Misiones. Tratamientos capilares, uñas, masajes, cosmetología y depilación láser.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
