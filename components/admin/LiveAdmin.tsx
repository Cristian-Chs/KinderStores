"use client";

import { useState, useEffect, FormEvent } from "react";
import { collection, query, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { LiveItem, LiveSettings } from "@/types";

export default function LiveAdmin() {
    const [settings, setSettings] = useState<LiveSettings>({ isActive: false, dateText: "Hoy, " + new Date().toLocaleDateString("es-VE", { day: "numeric", month: "long" }) });
    const [items, setItems] = useState<LiveItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [editingItem, setEditingItem] = useState<LiveItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [badge, setBadge] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Settings subscription
        const unsubSettings = onSnapshot(doc(db, "settings", "live"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setSettings(docSnapshot.data() as LiveSettings);
            }
        });

        // Items subscription
        const q = query(collection(db, "liveProducts"), orderBy("createdAt", "desc"));
        const unsubItems = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LiveItem)));
            setLoading(false);
        });

        return () => {
            unsubSettings();
            unsubItems();
        };
    }, []);

    const handleSaveSettings = async (newSettings: LiveSettings) => {
        try {
            await setDoc(doc(db, "settings", "live"), newSettings);
        } catch (error) {
            console.error("Error saving settings", error);
        }
    };

    const openForm = (item?: LiveItem) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setDescription(item.description);
            setPrice(item.price.toString());
            setImageUrl(item.imageUrl);
            setBadge(item.badge);
        } else {
            setEditingItem(null);
            setTitle("");
            setDescription("");
            setPrice("");
            setImageUrl("");
            setBadge("");
        }
        setShowForm(true);
    };

    const handleSaveItem = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = {
                title,
                description,
                price: parseFloat(price),
                imageUrl,
                badge,
                createdAt: editingItem?.createdAt || Date.now()
            };

            if (editingItem) {
                await updateDoc(doc(db, "liveProducts", editingItem.id), data);
            } else {
                await addDoc(collection(db, "liveProducts"), data);
            }
            setShowForm(false);
        } catch (error) {
            console.error("Error saving live item", error);
            alert("Error guardando el artículo");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (confirm("¿Eliminar este artículo del live?")) {
            try {
                await deleteDoc(doc(db, "liveProducts", id));
            } catch (error) {
                console.error("Error deleting live item", error);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Barra de Estado y Configuración general */}
            <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                            Estado de la Sección "En Vivo"
                            <span className={`relative flex h-3 w-3 ${settings.isActive ? "bg-red-500" : "bg-gray-400"} rounded-full`}>
                                {settings.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Controla si la zona live aparece en la tienda y personaliza su texto superior.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleSaveSettings({ ...settings, isActive: !settings.isActive })}
                            className={`px-6 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all ${settings.isActive
                                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                    : "bg-red-500 text-white shadow-red-500/25 hover:bg-red-600"
                                }`}
                        >
                            {settings.isActive ? "Apagar Live" : "Encender Live"}
                        </button>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6 max-w-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Texto de la fecha/evento</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={settings.dateText}
                            onChange={(e) => setSettings({ ...settings, dateText: e.target.value })}
                            onBlur={() => handleSaveSettings(settings)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none text-sm"
                            placeholder="Ej: Hoy, 4 de marzo"
                        />
                    </div>
                </div>
            </div>

            {/* Gestión de Productos Live */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Artículos del Live
                            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{items.length}</span>
                        </h2>
                        <button
                            onClick={() => openForm()}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 shadow-md transition-all active:scale-95"
                        >
                            + Añadir Artículo
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-red-50 hover:border-red-200 transition-all">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden flex-shrink-0 border border-red-100">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <svg className="w-6 h-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <div className="flex gap-2 justify-center sm:justify-start mb-1">
                                            {item.badge && <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-orange-100 text-orange-700">{item.badge}</span>}
                                        </div>
                                        <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                                        <p className="text-sm font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">€{item.price.toFixed(2)}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openForm(item)} className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-orange-500 hover:bg-orange-50 border border-gray-100">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/40 border border-dashed border-red-200 rounded-3xl p-8 text-center">
                            <p className="text-red-400">No hay artículos configurados para el live actual.</p>
                        </div>
                    )}
                </div>

                {/* Creador / Editor */}
                <div className={`lg:col-span-1 ${showForm ? "block" : "hidden lg:block opacity-40 pointer-events-none"}`}>
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-red-100 shadow-xl sticky top-24">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">
                            {editingItem ? "Editar Artículo Live" : "Nuevo Artículo Live"}
                        </h2>
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
                                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:ring-2 focus:ring-red-400/20 focus:border-red-400 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción Corta (opcional)</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:ring-2 focus:ring-red-400/20 focus:border-red-400 outline-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Precio (€)</label>
                                    <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:ring-2 focus:ring-red-400/20 focus:border-red-400 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Etiqueta (opcional)</label>
                                    <input type="text" placeholder="Ej: Oferta" value={badge} onChange={e => setBadge(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 outline-none text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">URL de Imagen (opcional)</label>
                                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:ring-2 focus:ring-red-400/20 focus:border-red-400 outline-none text-sm" />
                            </div>

                            <div className="pt-4 flex gap-2">
                                {showForm && (
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 shadow-md transition-all active:scale-95 disabled:opacity-50">
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
