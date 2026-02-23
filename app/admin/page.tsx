"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm from "@/components/ProductForm";
import Image from "next/image";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
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

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-gray-500 mt-2">Gestiona tu inventario de productos</p>
          </div>
          <button
            onClick={() => {
              if (showForm) handleCloseForm();
              else setShowForm(true);
            }}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              showForm && !editingProduct
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            }`}
          >
            {showForm && !editingProduct ? "Cancelar" : "Nuevo Producto"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className={`lg:col-span-1 ${showForm ? "block" : "hidden lg:block opacity-40 pointer-events-none"}`}>
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingProduct ? "Editar Producto" : "Agregar Nuevo"}
              </h2>
              <ProductForm 
                product={editingProduct || undefined} 
                onSave={handleCloseForm} 
              />
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Lista de Productos
              <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {products.length}
              </span>
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 hover:border-purple-200 transition-all group"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-8 h-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 truncate">{product.title}</h3>
                      <p className="text-sm text-gray-500 font-bold mt-1">${product.price.toFixed(2)}</p>
                    </div>

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
            ) : (
              <div className="bg-white/40 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
                <p className="text-gray-400">Aún no hay productos en la tienda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
