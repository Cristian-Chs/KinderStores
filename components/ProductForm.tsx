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

  // Multi-image state: seed from imageUrls if present, else from imageUrl
  const initialUrls =
    product?.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product?.imageUrl
      ? [product.imageUrl]
      : [""];
  const [imageUrls, setImageUrls] = useState<string[]>(initialUrls);
  const [available, setAvailable] = useState<boolean>(product?.available !== false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- Image URL helpers ---
  const updateUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  };

  const addUrl = () => {
    if (imageUrls.length < 8) setImageUrls((prev) => [...prev, ""]);
  };

  const removeUrl = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // First non-empty URL for preview
  const previewUrl = imageUrls.find((u) => u.trim() !== "") ?? "";

  // --- Submit ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const finalCategory = useCustomCategory ? customCategory : category;
      const filteredUrls = imageUrls.filter((u) => u.trim() !== "");
      const primaryUrl = filteredUrls[0] ?? "";

      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: finalCategory,
        imageUrl: primaryUrl,          // retrocompat
        imageUrls: filteredUrls,       // new multi-image field
        available,
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
        setImageUrls([""]);
        setAvailable(true);
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
      {/* Multi-Image Manager */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del Producto{" "}
          <span className="text-xs text-gray-400 font-normal">(máx. 8)</span>
        </label>

        {/* Preview of first image */}
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden mb-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa principal"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <svg
                className="w-8 h-8 text-purple-300 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs text-purple-400">
                Ingresa una URL de imagen para ver la vista previa
              </p>
            </div>
          )}
        </div>

        {/* URL Inputs */}
        <div className="flex flex-col gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                required={index === 0}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800 text-sm"
                placeholder={
                  index === 0
                    ? "URL imagen principal (requerida)"
                    : `URL ángulo ${index + 1} (opcional)`
                }
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(index)}
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                  title="Eliminar esta imagen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {imageUrls.length < 8 && (
          <button
            type="button"
            onClick={addUrl}
            className="mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar otra imagen
          </button>
        )}
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
              <option key={cat} value={cat}>
                {cat}
              </option>
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

      {/* Availability Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Disponibilidad</label>
        <button
          type="button"
          onClick={() => setAvailable((v) => !v)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            available ? "bg-purple-500" : "bg-gray-300"
          }`}
          aria-label="Disponibilidad del producto"
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              available ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`ml-3 text-sm font-medium ${
          available ? "text-purple-600" : "text-gray-400"
        }`}>
          {available ? "En stock" : "Agotado"}
        </span>
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
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Guardando...
          </span>
        ) : product ? (
          "Actualizar Producto"
        ) : (
          "Crear Producto"
        )}
      </button>
    </form>
  );
}
