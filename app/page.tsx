"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import { DEFAULT_CATEGORIES, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import EditProductModal from "@/components/EditProductModal";

const PAGE_SIZE = 20;

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
        setAllProducts(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Filtered products based on active category
  const filteredProducts =
    activeCategory === "Todos"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll up to start of product grid
    document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Determine which page numbers to show (max 7 buttons with ellipsis)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
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
      <section id="tienda" className="max-w-7xl mx-auto px-6 w-full scroll-mt-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-bold text-gray-800">Nuestros Productos</h2>
              {!loading && (
                <span className="text-sm text-gray-400">
                  {filteredProducts.length} productos
                </span>
              )}
            </div>

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
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                  />
                ))}
              </div>

              {/* Numbered Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-4 flex-wrap">
                  {/* Prev arrow */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Página anterior"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page as number)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-400/30"
                            : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next arrow */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Página siguiente"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-center text-xs text-gray-400">
                  Página {currentPage} de {totalPages} · {filteredProducts.length} productos
                </p>
              )}
            </>
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
