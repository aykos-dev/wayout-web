'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  images: string[];
  alt: string;
  open: boolean;
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, alt, open, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, prev, next]);

  if (!open || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        className="relative h-[80vh] w-[90vw] max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${alt} ${index + 1}`}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-caption text-white backdrop-blur">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
