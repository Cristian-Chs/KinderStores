"use client";

import { useState, FormEvent } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

interface ProductFormProps {
  product?: Product;
  onSave?: () => void;
}

export default function ProductForm({ product, onSave }: ProductFormProps) {
  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState(product?.category || DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const finalCategory = useCustomCategory ? customCategory : category;

      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: finalCategory,
        imageUrl,
        createdAt: product?.createdAt || Date.now(),
        sales: product?.sales || 0,
      };

      if (product?.id) {
        await updateDoc(doc(db, "products", product.id), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }

      setSuccess(true);
      if (!product) {
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory(DEFAULT_CATEGORIES[0]);
        setCustomCategory("");
        setUseCustomCategory(false);
        setImageUrl("");
      }
      setTimeout(() => setSuccess(false), 3000);
      onSave?.();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image Preview & URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <svg className="w-8 h-8 text-purple-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-purple-400">Ingresa una URL de imagen para ver la vista previa</p>
              </div>
            )}
          </div>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800 text-sm"
            placeholder="https://ejemplo.com/foto-producto.jpg"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800"
          placeholder="Nombre del producto"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800"
          placeholder="0.00"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800 resize-none"
          placeholder="Descripción del producto"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        {!useCustomCategory ? (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800"
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800"
            placeholder="Escribe una categoría personalizada"
          />
        )}
        <button
          type="button"
          onClick={() => setUseCustomCategory(!useCustomCategory)}
          className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          {useCustomCategory ? "← Usar categoría predefinida" : "+ Categoría personalizada"}
        </button>
      </div>

      {/* Submit */}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium text-center">
          Producto {product ? "actualizado" : "creado"} exitosamente
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Guardando...
          </span>
        ) : (
          product ? "Actualizar Producto" : "Crear Producto"
        )}
      </button>
    </form>
  );
}
