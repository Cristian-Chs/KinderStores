"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function BajoEncargoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filter by onOrder field
    const q = query(
      collection(db, "products"),
      where("onOrder", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching on-order products:", error);
      // If index is missing or other error, fallback to client-side filtering
      const fallbackQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
      onSnapshot(fallbackQuery, (snapshot) => {
        const docs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
          .filter(p => p.onOrder === true);
        setProducts(docs);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Page title */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Bajo Encargo
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Productos exclusivos disponibles bajo pedido.</p>
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm font-medium text-gray-400 px-2">Catálogo Especial</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Productos bajo encargo */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 stagger-children">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-50 text-pink-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Actualmente no hay productos bajo encargo disponibles.</p>
          <a href="/" className="mt-6 inline-block text-purple-600 font-medium hover:underline">
            Volver a la tienda
          </a>
        </div>
      )}
    </div>
  );
}
