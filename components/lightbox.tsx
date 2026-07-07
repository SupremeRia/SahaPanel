"use client";

import { ZoomIn } from "lucide-react";
import { Modal, useDisclosure } from "@/components/modal";
import { secondaryButtonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

// Tiklaninca tam ekran onizleme acan yeniden kullanilabilir gorsel bileseni.
// Kullanici tarafindan yuklenen dinamik Supabase URL'leri icin next/image uygun degil.
export function ImageLightbox({
  src,
  alt,
  title = "Görsel önizleme",
  thumbClassName,
  trigger
}: {
  src: string;
  alt: string;
  title?: string;
  thumbClassName?: string;
  trigger?: (open: () => void) => React.ReactNode;
}) {
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <>
      {trigger ? (
        trigger(onOpen)
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "focus-ring group relative inline-flex overflow-hidden rounded-lg border border-line",
            thumbClassName
          )}
          aria-label="Görseli büyüt"
          title="Görseli büyüt"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/0 text-white/0 transition group-hover:bg-ink/30 group-hover:text-white">
            <ZoomIn className="h-5 w-5" aria-hidden />
          </span>
        </button>
      )}
      <Modal open={open} onClose={onClose} title={title} size="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
        <div className="mt-4 flex justify-end">
          <a href={src} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
            Yeni sekmede aç
          </a>
        </div>
      </Modal>
    </>
  );
}
