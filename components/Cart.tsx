"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useBcvRate, toBs } from "@/lib/useBcvRate";
import WhatsAppCheckout from "./WhatsAppCheckout";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { tasa, fechaActualizacion, loading: rateLoading, error: rateError } = useBcvRate();

  // Formatea la fecha de actualización de la tasa
  const fechaLabel = fechaActualizacion
    ? new Date(fechaActualizacion).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Mi Carrito</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tasa BCV Euro */}
          <div className="px-6 py-2.5 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-pink-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-purple-700">$ Tasa BCV</span>
                {rateLoading && (
                  <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                )}
              </div>
              {rateError ? (
                <span className="text-xs text-red-400">No disponible</span>
              ) : tasa ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-800">
                    1 $ = Bs. {tasa.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {fechaLabel && (
                    <span className="text-[10px] text-gray-400">{fechaLabel}</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400 mt-1">¡Agrega algunos productos!</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-purple-100 transition-colors duration-200"
                >
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {item.product.title}
                    </h3>
                    {/* Price in $ */}
                    <p className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      ${item.product.price.toFixed(2)}
                    </p>
                    {/* Price in Bs */}
                    {tasa && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Bs. {toBs(item.product.price, tasa)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-purple-300 hover:text-purple-600 active:scale-90 transition-all duration-200"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-gray-700 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-purple-300 hover:text-purple-600 active:scale-90 transition-all duration-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      {tasa && (
                        <p className="text-[11px] text-gray-400">
                          Bs. {toBs(item.product.price * item.quantity, tasa)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-6 space-y-4">
              {/* Total en $ */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Total:</span>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </p>
                  {/* Total en Bs */}
                  {tasa && (
                    <p className="text-sm font-semibold text-gray-500">
                      Bs. {toBs(total, tasa)}
                    </p>
                  )}
                </div>
              </div>

              {user ? (
                <WhatsAppCheckout />
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Inicia sesión para continuar</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Necesitas una cuenta para finalizar tu compra. ¡Es rápido y gratis!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setIsCartOpen(false); router.push("/login?redirect=checkout"); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-500/25 active:scale-95 transition-all duration-200"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => { setIsCartOpen(false); router.push("/register?redirect=checkout"); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-purple-600 border border-purple-200 hover:bg-purple-50 active:scale-95 transition-all duration-200"
                    >
                      Registrarse
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
