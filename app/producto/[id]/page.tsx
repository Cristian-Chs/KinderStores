"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import ImageGallery from "@/components/ImageGallery";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // undefined → available (retrocompat)
  const isAvailable = product?.available !== false;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
          router.push("/");
          return;
        }
        const data = { id: snap.id, ...snap.data() } as Product;
        setProduct(data);

        // Fetch related products (same category, exclude current)
        const relQ = query(
          collection(db, "products"),
          where("category", "==", data.category),
          limit(5)
        );
        const relSnap = await getDocs(relQ);
        const relDocs = relSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Product))
          .filter((p) => p.id !== data.id)
          .slice(0, 4);
        setRelated(relDocs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product || !isAvailable) return;
    for (let i = 0; i < quantity; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          <p className="text-gray-400 text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-purple-500 font-medium">{product.category}</span>
        <span>/</span>
        <span className="text-gray-700 font-medium line-clamp-1">{product.title}</span>
      </nav>

      {/* Main layout: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* LEFT — Gallery */}
        <div className="w-full lg:sticky lg:top-24">
          <ImageGallery images={images} alt={product.title} />
        </div>

        {/* RIGHT — Product Info */}
        <div className="flex flex-col gap-6">
          {/* Category + availability badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
              {product.category}
            </span>
            {!isAvailable && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                Agotado
              </span>
            )}
            {isAvailable && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                En stock
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400">USD</span>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {product.description}
            </p>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Quantity + Add to Cart */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Cantidad:</span>
              <div className={`flex items-center border rounded-xl overflow-hidden ${
                isAvailable ? "border-gray-200" : "border-gray-100 opacity-40 pointer-events-none"
              }`}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || added}
              className={`w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 shadow-lg active:scale-[0.98] ${
                !isAvailable
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : added
                  ? "bg-green-500 shadow-green-400/30"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/40"
              }`}
            >
              {!isAvailable ? (
                <span className="flex items-center justify-center gap-2 text-gray-500">
                  No disponible actualmente
                </span>
              ) : added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Agregado al carrito!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Agregar al carrito
                </span>
              )}
            </button>

            <Link
              href="/"
              className="w-full py-3 rounded-2xl font-semibold text-purple-600 text-base text-center border-2 border-purple-200 hover:bg-purple-50 transition-all"
            >
              ← Seguir comprando
            </Link>
          </div>

          {/* Extras */}
          <div className="mt-2 p-4 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col gap-2 text-sm text-purple-800">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Compra 100% segura vía WhatsApp
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {isAvailable ? "Producto disponible en tienda" : "Sin stock por el momento"}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Más productos en{" "}
            <span className="text-purple-600">{product.category}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
