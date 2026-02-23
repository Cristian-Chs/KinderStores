import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KinderStore | Tu Tienda Favorita",
  description: "Encuentra los mejores productos escolares y de oficina. Cuadernos, lápices, mochilas y mucho más al mejor precio.",
  keywords: ["papelería", "útiles escolares", "cuadernos", "lápices", "mochilas", "oficina"],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-white`}>
        <Providers>
          <Navbar />
          <Cart />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
