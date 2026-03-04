"use client";

import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useEuroRate, toBs } from "@/lib/useEuroRate";
import { LiveItem, LiveSettings } from "@/types";

function LiveCard({ item }: { item: LiveItem }) {
    const { addToCart } = useCart();
    const { tasa } = useEuroRate();

    const asProduct = {
        id: item.id,
        title: item.title,
        description: item.description || "",
        price: item.price,
        imageUrl: item.imageUrl || "",
        category: "Live",
        createdAt: new Date().toISOString(),
    };

    return (
        <div className="relative group bg-white/80 backdrop-blur-sm rounded-2xl border border-red-100 shadow-lg shadow-red-500/5 overflow-hidden hover:shadow-xl hover:shadow-red-400/10 hover:-translate-y-1 transition-all duration-300">
            {item.badge && (
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-md">
                    {item.badge}
                </span>
            )}

            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-red-50 to-orange-50">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <svg className="w-14 h-14 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-red-500 transition-colors">
                    {item.title}
                </h3>
                {item.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-end justify-between pt-1 gap-2">
                    <div>
                        <p className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                            €{item.price.toFixed(2)}
                        </p>
                        {tasa && (
                            <p className="text-xs text-gray-400">Bs. {toBs(item.price, tasa)}</p>
                        )}
                    </div>
                    <button
                        onClick={() => addToCart(asProduct as any)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 shadow-md shadow-red-400/25 hover:shadow-lg active:scale-95 transition-all duration-200 whitespace-nowrap"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LiveSection() {
    const [items, setItems] = useState<LiveItem[]>([]);
    const [settings, setSettings] = useState<LiveSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchar la configuración del live (actividad y fecha)
        const unsubSettings = onSnapshot(doc(db, "settings", "live"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setSettings(docSnapshot.data() as LiveSettings);
            }
        });

        // Escuchar los productos del live
        const q = query(collection(db, "liveProducts"), orderBy("createdAt", "desc"));
        const unsubItems = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveItem)));
            setLoading(false);
        });

        return () => {
            unsubSettings();
            unsubItems();
        };
    }, []);

    if (loading) return null;
    // Si el administrador apaga el live o no hay items, no lo muestra
    if (!settings?.isActive || items.length === 0) return null;

    return (
        <section className="mb-16">
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <span className="absolute w-6 h-6 rounded-full bg-red-400 opacity-40 animate-ping" />
                        <span className="relative w-3.5 h-3.5 rounded-full bg-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        En{" "}
                        <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                            VIVO
                        </span>{" "}
                        hoy
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white tracking-wide shadow-md shadow-red-400/30">
                        LIVE
                    </span>
                </div>
                <span className="text-sm text-gray-400 ml-auto">{settings.dateText}</span>
            </div>

            <p className="text-gray-500 text-sm mb-6 -mt-2">
                Artículos disponibles en nuestro directo de hoy. ¡Cantidades limitadas!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <LiveCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
