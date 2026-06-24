'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mountain, Image as ImageIcon } from 'lucide-react';
import { Lightbox } from './lightbox';
import { track } from '@/lib/analytics';

interface Props {
  images: string[];
  title: string;
  tourId?: string;
}

export function PhotoGallery({ images, title, tourId }: Props) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const heroSrc = images[0] ?? null;
  const thumbs = images.slice(1, 5);

  const openAt = (i: number) => {
    track('tour_gallery_open', { tour_id: tourId, index: i, total: images.length });
    setStartIndex(i);
    setOpen(true);
  };

  return (
    <section className="container-airbnb">
      <div className="relative grid h-[480px] grid-cols-4 gap-2 overflow-hidden rounded-md">
        <button
          type="button"
          onClick={() => heroSrc && openAt(0)}
          className="relative col-span-4 cursor-zoom-in sm:col-span-2 sm:row-span-2"
        >
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity hover:opacity-95"
              priority
            />
          ) : (
            <Placeholder />
          )}
        </button>
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => thumbs[i] && openAt(i + 1)}
            className="relative col-span-1 hidden cursor-zoom-in sm:block"
          >
            {thumbs[i] ? (
              <Image
                src={thumbs[i]!}
                alt={`${title} ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover transition-opacity hover:opacity-95"
              />
            ) : (
              <Placeholder />
            )}
          </button>
        ))}

        {images.length > 5 && (
          <button
            type="button"
            onClick={() => openAt(4)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-body-sm text-ink shadow-airbnb hover:bg-surface-soft"
          >
            <ImageIcon className="h-4 w-4" />
            Show all photos
          </button>
        )}
      </div>

      <Lightbox
        images={images}
        alt={title}
        open={open}
        initialIndex={startIndex}
        onClose={() => setOpen(false)}
        tourId={tourId}
      />
    </section>
  );
}

function Placeholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-strong to-surface-soft text-muted-soft">
      <Mountain className="h-12 w-12" strokeWidth={1.2} />
    </div>
  );
}
