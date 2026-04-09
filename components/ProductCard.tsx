"use client";

import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAILS } from "@/lib/constants";
import ImageGallery from "@/components/ImageGallery";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
}

export default function ProductCard({ product, onEdit }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));
  // undefined means available (retrocompat with existing products)
  const isAvailable = product.available !== false;

  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg shadow-purple-500/5 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
      {/* Image Gallery */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 p-1 sm:p-2">
        <ImageGallery
          images={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl]}
          alt={product.title}
          showThumbnails={false}
        />

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {!isAvailable && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
              Agotado
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-purple-600 border border-purple-100 shadow-sm">
            {product.category}
          </span>

          {/* Admin Edit Button */}
          {isAdmin && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-2 rounded-full bg-white text-purple-600 border border-purple-100 shadow-md hover:bg-purple-600 hover:text-white transition-all duration-300 animate-bounce-in"
              title="Editar producto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Info — clickable to detail */}
      <Link href={`/producto/${product.id}`} className="p-3 sm:p-4 space-y-4 block">
        <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); if (isAvailable) addToCart(product); }}
            disabled={!isAvailable}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 ${
              isAvailable
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
                : "bg-gray-300 cursor-not-allowed opacity-60"
            }`}
          >
            {isAvailable ? "Agregar" : "Agotado"}
          </button>
        </div>
      </Link>
    </div>
  );
}
