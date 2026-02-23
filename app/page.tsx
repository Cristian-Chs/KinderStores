"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import { DEFAULT_CATEGORIES, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import EditProductModal from "@/components/EditProductModal";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    if (activeCategory === "Todos") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 hero-gradient" />
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {SITE_NAME}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {SITE_DESCRIPTION}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#tienda"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all"
            >
              Comprar Ahora
            </a>
            <a
              href="/recientes"
              className="px-8 py-4 rounded-2xl bg-white text-purple-600 font-bold border border-purple-100 hover:bg-purple-50 transition-all"
            >
              Ver Novedades
            </a>
          </div>
        </div>
      </section>

      {/* Product Grid & Filtering */}
      <section id="tienda" className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-3xl font-bold text-gray-800">Nuestros Productos</h2>
            
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {["Todos", ...DEFAULT_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-500 mt-4 text-lg">No encontramos productos en esta categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* Inline Edit Modal */}
      <EditProductModal 
        product={editingProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
