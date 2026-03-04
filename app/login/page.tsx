"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCheckout = searchParams.get("redirect") === "checkout";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: any) {
      setError("Error al iniciar sesión con Google.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-purple-500/10 border border-white/40">

          {/* Checkout context banner */}
          {fromCheckout && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-purple-50 border border-purple-100 p-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-800">¡Ya casi terminas tu pedido!</p>
                <p className="text-xs text-purple-600 mt-0.5">Inicia sesión para finalizar tu compra por WhatsApp.</p>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Bienvenido de nuevo
            </h1>
            <p className="text-gray-500 mt-2">Ingresa a tu cuenta de KinderStore</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">O continúa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Continuar con Google</span>
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            ¿No tienes una cuenta?{" "}
            <Link
              href={fromCheckout ? "/register?redirect=checkout" : "/register"}
              className="text-purple-600 font-semibold hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
