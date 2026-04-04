"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const validImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const handleSelect = (index: number) => {
    if (index === activeIndex) return;
    setFade(false);
    setTimeout(() => {
      setActiveIndex(index);
      setFade(true);
    }, 150);
  };

  const mainImage = validImages[activeIndex] ?? validImages[0];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={alt}
            fill
            priority
            className={`object-cover transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-12 h-12 text-purple-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails — only if more than one image */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {validImages.map((url, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                index === activeIndex
                  ? "border-purple-500 shadow-md shadow-purple-300/40 scale-105"
                  : "border-transparent opacity-60 hover:opacity-90 hover:border-purple-300"
              }`}
              title={`Ver ángulo ${index + 1}`}
              aria-label={`Imagen ${index + 1} de ${validImages.length}`}
            >
              <Image
                src={url}
                alt={`${alt} - ángulo ${index + 1}`}
                fill
                loading="lazy"
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
