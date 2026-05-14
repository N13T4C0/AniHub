"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, Play, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import dynamic from "next/dynamic";
import type { MediaBase } from "@/types/media";
import { getTitle } from "@/types/media";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const QUICK_GENRES = ["Action", "Romance", "Fantasy", "Sci-Fi", "Horror", "Isekai"];

export default function CinematicHero({ bannerItems }: { bannerItems: MediaBase[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const items = bannerItems.filter((b) => b.banner_image);
  const current = items[activeIdx];

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setActiveIdx((idx + items.length) % items.length);
      setFading(false);
    }, 500);
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => goTo(activeIdx + 1), 8000);
    return () => clearInterval(id);
  }, [activeIdx, goTo, items.length]);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: 640 }}>

      {/* ── Banner images ── */}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === activeIdx && !fading ? 1 : 0 }}
        >
          <img
            src={item.banner_image!}
            alt=""
            className="w-full h-full object-cover"
            style={{
              animation: i === activeIdx ? "kenBurns 16s ease-in-out infinite alternate" : "none",
              transformOrigin: "center center",
            }}
          />
        </div>
      ))}

      {/* ── Layered overlays ── */}
      {/* Strong dark at bottom for text */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark from-20% via-dark/50 to-transparent" style={{ zIndex: 2 }} />
      {/* Left vignette for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/40 to-transparent" style={{ zIndex: 2 }} />
      {/* Top gradient for navbar */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-dark/80 to-transparent" style={{ zIndex: 2 }} />
      {/* Subtle color tint from cover */}
      {current?.cover_image?.color && (
        <div
          className="absolute inset-0 opacity-15 transition-opacity duration-700"
          style={{ background: `radial-gradient(ellipse at 60% 40%, ${current.cover_image.color}80, transparent 70%)`, zIndex: 2 }}
        />
      )}

      {/* ── Three.js particles ── */}
      <div className="absolute inset-0" style={{ zIndex: 3, mixBlendMode: "screen", opacity: 0.5 }}>
        <HeroScene />
      </div>

      {/* ── Main content ── */}
      <div className="absolute inset-0 flex items-end pb-24 px-8 md:px-16" style={{ zIndex: 4 }}>
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">

          {/* Left: Title + search */}
          <div className="lg:col-span-3">
            {/* Platform badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 text-xs text-white/70 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Anime · Manga · Manhwa
            </div>

            {/* Main title */}
            <h1 className="font-display font-black leading-none tracking-tight mb-6">
              <span className="block text-7xl md:text-8xl bg-gradient-to-br from-white via-white/95 to-white/50 bg-clip-text text-transparent drop-shadow-2xl">
                Descubre.
              </span>
              <span className="block text-7xl md:text-8xl bg-gradient-to-br from-white via-white/95 to-white/50 bg-clip-text text-transparent drop-shadow-2xl">
                Rastrea.
              </span>
              <span className="block text-7xl md:text-8xl bg-gradient-to-r from-primary via-violet-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                Disfruta.
              </span>
            </h1>

            {/* Search */}
            <Link href="/search" className="block max-w-xl mb-5">
              <div className="flex items-center gap-3 bg-dark/60 backdrop-blur-xl border border-white/20 hover:border-primary/60 rounded-2xl px-5 py-4 transition-all duration-200 group cursor-text shadow-2xl">
                <Search size={18} className="text-white/50 group-hover:text-primary transition-colors flex-shrink-0" />
                <span className="text-white/40 group-hover:text-white/60 transition-colors text-sm">
                  Busca un anime, manga, estudio...
                </span>
                <kbd className="ml-auto text-[10px] text-white/25 border border-white/15 rounded-md px-2 py-1 font-mono hidden sm:block backdrop-blur-sm">
                  ⌘K
                </kbd>
              </div>
            </Link>

            {/* Genre pills */}
            <div className="flex flex-wrap gap-2">
              {QUICK_GENRES.map((g) => (
                <Link key={g} href={`/search?genre=${g}`}
                  className="rounded-full bg-white/10 backdrop-blur-sm border border-white/15 hover:border-primary/60 hover:bg-primary/15 px-4 py-1.5 text-xs text-white/60 hover:text-white transition-all duration-200 font-medium">
                  {g}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Stacked anime cards */}
          {current && (
            <div className="lg:col-span-2 flex items-end justify-center lg:justify-end">
              <div className="relative" style={{ width: 260, height: 370 }}>

                {/* Glow ambiental */}
                {current.cover_image?.color && (
                  <div
                    className="absolute pointer-events-none opacity-20 blur-3xl transition-all duration-700"
                    style={{
                      background: current.cover_image.color,
                      inset: 0,
                      borderRadius: 32,
                      transform: "scale(0.8) translateY(12%)",
                    }}
                  />
                )}

                {/* Carta trasera — más rotada, casi invisible */}
                {items.length > 2 && items[(activeIdx + 2) % items.length]?.cover_image?.large && (
                  <div
                    className="absolute rounded-xl overflow-hidden border border-white/8 shadow-lg transition-all duration-700"
                    style={{
                      width: 144,
                      bottom: 0,
                      right: 0,
                      zIndex: 1,
                      opacity: 0.28,
                      transform: "rotate(12deg)",
                      transformOrigin: "bottom right",
                    }}
                  >
                    <div className="aspect-[2/3]">
                      <img src={items[(activeIdx + 2) % items.length].cover_image!.large!} className="w-full h-full object-cover" alt="" />
                    </div>
                  </div>
                )}

                {/* Carta media */}
                {items.length > 1 && items[(activeIdx + 1) % items.length]?.cover_image?.large && (
                  <div
                    className="absolute rounded-xl overflow-hidden border border-white/12 shadow-xl transition-all duration-700"
                    style={{
                      width: 165,
                      bottom: 0,
                      right: 12,
                      zIndex: 2,
                      opacity: 0.55,
                      transform: "rotate(5.5deg)",
                      transformOrigin: "bottom right",
                    }}
                  >
                    <div className="aspect-[2/3]">
                      <img src={items[(activeIdx + 1) % items.length].cover_image!.large!} className="w-full h-full object-cover" alt="" />
                    </div>
                  </div>
                )}

                {/* Carta frontal — activa */}
                <div className="group absolute" style={{ width: 192, bottom: 0, left: 0, zIndex: 3 }}>
                  <div className="bg-dark/40 backdrop-blur-sm rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {(current.cover_image?.large || current.cover_image?.extra_large) && (
                        <img
                          src={current.cover_image.extra_large || current.cover_image.large!}
                          alt={getTitle(current.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent" />

                      {/* Posición en el carrusel */}
                      <div className="absolute top-2.5 left-2.5 bg-dark/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                        <span className="text-[9px] text-white/35 font-mono tabular-nums">{activeIdx + 1}/{items.length}</span>
                      </div>

                      {/* Score */}
                      {current.average_score && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 bg-dark/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                          <Star size={10} className="text-yellow-400" fill="currentColor" />
                          <span className="text-xs font-bold text-yellow-400">
                            {(current.average_score / 10).toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Play overlay */}
                      <Link
                        href={`/media/${current.id}?type=ANIME`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                          <Play size={16} className="text-white ml-0.5" fill="white" />
                        </div>
                      </Link>
                    </div>

                    <div className="p-3">
                      <p className="text-[9px] text-primary/60 uppercase tracking-widest font-semibold mb-1">Trending</p>
                      <h3 className="font-display font-bold text-white text-sm leading-snug line-clamp-2 mb-1.5">
                        {getTitle(current.title)}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {current.genres?.slice(0, 3).map((g) => (
                          <span key={g} className="text-[9px] bg-white/5 border border-white/8 text-white/40 rounded-full px-1.5 py-0.5">{g}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dots */}
                  {items.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {items.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i)}
                          className={`rounded-full transition-all duration-300 ${
                            i === activeIdx
                              ? "w-4 h-[3px] bg-primary"
                              : "w-[3px] h-[3px] bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Nav arrows (sides) ── */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => goTo(activeIdx - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark/50 backdrop-blur-sm border border-white/10 hover:border-white/30 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ zIndex: 5 }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(activeIdx + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark/50 backdrop-blur-sm border border-white/10 hover:border-white/30 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ zIndex: 5 }}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 animate-bounce" style={{ zIndex: 5 }}>
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ArrowDown size={14} />
      </div>

      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1)    translate(0%,   0%); }
          to   { transform: scale(1.1) translate(-1.5%, -1%); }
        }
      `}</style>
    </section>
  );
}
