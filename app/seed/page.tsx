"use client";

import { useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";

export default function SeedPage() {
    const [status, setStatus] = useState("Listo para empezar");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const startSeeding = async () => {
        const TOTAL = 108;
        setLoading(true);
        setStatus("Iniciando carga masiva...");
        
        for (let i = 1; i <= TOTAL; i++) {
            try {
                await addDoc(collection(db, "products"), {
                    title: `Foto ${i}`,
                    description: `Descripción ${i}`,
                    price: Number(i),
                    category: "Cuadernos",
                    imageUrl: `/Productos/producto_${i}.jpg`,
                    createdAt: Date.now(),
                    sales: 0
                });
                setProgress(i);
                setStatus(`Agregando producto ${i} de ${TOTAL}...`);
            } catch (e: any) {
                console.error(e);
                setStatus(`Error en producto ${i}: ${e.message}`);
                setLoading(false);
                return;
            }
        }
        
        setStatus("¡Carga masiva completada exitosamente!");
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Sembrador de Productos</h1>
                <p className="text-gray-500 mb-8 text-sm">
                    Esta herramienta cargará los 108 productos recién renombrados a tu base de datos de Firebase.
                </p>
                
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        <span>Progreso</span>
                        <span>{Math.round((progress / 108) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300" 
                            style={{ width: `${(progress / 108) * 100}%` }}
                        />
                    </div>
                </div>

                <div className={`p-4 rounded-2xl mb-8 text-sm font-medium ${
                    status.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-700"
                }`}>
                    {status}
                </div>

                <button 
                    onClick={startSeeding}
                    disabled={loading || progress === 108}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Procesando..." : progress === 108 ? "Tarea Finalizada" : "Empezar Carga Masiva"}
                </button>
                
                <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest">
                    RECUERDA ELIMINAR ESTA RUTA (/app/seed) CUANDO TERMINES
                </p>
            </div>
        </div>
    );
}
