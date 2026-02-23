import { SITE_NAME } from "@/lib/constants";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-md border-t border-white/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-8 h-8 overflow-hidden">
                <Image
                  src="/logo.svg"
                  alt={SITE_NAME}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {SITE_NAME}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Tu papelería favorita con los mejores productos escolares y de oficina.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              Enlaces
            </h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Inicio</a></li>
              <li><a href="/mas-vendidos" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Más Vendidos</a></li>
              <li><a href="/recientes" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Recientes</a></li>
              <li><a href="/contactanos" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Contáctanos</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              Contacto
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                info@kinderpapeleria.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +58 123 456 7890
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
