"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  trailerUrl: string;
  title: string;
  onClose: () => void;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function TrailerModal({ trailerUrl, title, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoId = getYouTubeId(trailerUrl);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Cerrar al clic en el overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!videoId) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4"
    >
      <div className="relative w-full max-w-4xl animate-slide-up">
        {/* Header del modal */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-sm truncate">{title} — Trailer</p>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Iframe de YouTube */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
             style={{ paddingBottom: "56.25%" /* 16:9 */ }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p className="text-center text-xs text-white/20 mt-3">
          Presiona Esc o haz clic fuera para cerrar
        </p>
      </div>
    </div>
  );
}
