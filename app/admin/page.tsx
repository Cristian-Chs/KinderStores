"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm from "@/components/ProductForm";
import LiveAdmin from "@/components/admin/LiveAdmin";

const PAGE_SIZE = 10;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"inventory" | "live">("inventory");

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      setProducts(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6">
              Panel de Administración
            </h1>
            <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl w-fit border border-gray-200/50">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "inventory" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
              >
                📦 Inventario
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "live" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
              >
                🔴 En Vivo
              </button>
            </div>
          </div>

          {activeTab === "inventory" && (
            <button
              onClick={() => { if (showForm) handleCloseForm(); else setShowForm(true); }}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${showForm && !editingProduct ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"}`}
            >
              {showForm && !editingProduct ? "Cancelar" : "+ Nuevo Producto"}
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "inventory" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up">

            {/* Form Section */}
            <div className={`lg:col-span-1 ${showForm ? "block" : "hidden lg:block opacity-40 pointer-events-none"}`}>
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {editingProduct ? "Editar Producto" : "Agregar Nuevo"}
                </h2>
                {/* key forces re-mount when switching products, fixing empty form bug */}
                <ProductForm
                  key={editingProduct?.id ?? "new"}
                  product={editingProduct || undefined}
                  onSave={handleCloseForm}
                />
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header + search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Lista de Productos
                  <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {filtered.length} de {products.length}
                  </span>
                </h2>

                <div className="relative w-full sm:w-72">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar por nombre o categoría..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all text-sm text-gray-700"
                  />
                  {search && (
                    <button
                      onClick={() => { setSearch(""); setCurrentPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Product List */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {paginated.map((product) => (
                      <div
                        key={product.id}
                        className={`flex flex-col sm:flex-row items-center gap-6 p-4 bg-white/60 backdrop-blur-sm rounded-3xl border transition-all group ${editingProduct?.id === product.id ? "border-purple-400 ring-2 ring-purple-200" : "border-white/40 hover:border-purple-200"}`}
                      >
                        {/* Image */}
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <svg className="w-8 h-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                              {product.category}
                            </span>
                            {product.onOrder && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-pink-50 text-pink-600 border border-pink-100">
                                Bajo Encargo
                              </span>
                            )}
                            {product.available === false && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-red-50 text-red-500 border border-red-100">
                                Agotado
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-800 truncate">{product.title}</h3>
                          <p className="text-sm text-gray-500 font-bold mt-1">${product.price.toFixed(2)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-3 rounded-xl bg-white text-gray-400 hover:text-purple-600 hover:bg-purple-50 border border-gray-100 transition-all"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-3 rounded-xl bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 transition-all"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-gray-400">
                        Página <span className="font-semibold text-gray-600">{currentPage}</span> de{" "}
                        <span className="font-semibold text-gray-600">{totalPages}</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-purple-600 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((item, idx) =>
                            item === "..." ? (
                              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                            ) : (
                              <button
                                key={item}
                                onClick={() => setCurrentPage(item as number)}
                                className={`min-w-[36px] h-9 rounded-xl text-sm font-semibold border transition-all ${currentPage === item ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-purple-200 hover:text-purple-600"}`}
                              >
                                {item}
                              </button>
                            )
                          )}

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-purple-600 hover:border-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/40 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
                  {search ? (
                    <>
                      <p className="text-gray-500 font-medium">Sin resultados para &ldquo;<span className="text-purple-600">{search}</span>&rdquo;</p>
                      <p className="text-sm text-gray-400 mt-1">Intenta con otro nombre.</p>
                    </>
                  ) : (
                    <p className="text-gray-400">Aún no hay productos en la tienda.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <LiveAdmin />
        )}
      </div>
    </ProtectedRoute>
  );
}
