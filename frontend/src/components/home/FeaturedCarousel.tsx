"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Play, Plus, ChevronRight, Calendar } from "lucide-react";
import type { MediaBase } from "@/types/media";
import { getTitle, getCover } from "@/types/media";

export default function FeaturedCarousel({
  items, title, subtitle, eyebrow, accentColor = "#4ade80", viewAllHref,
}: {
  items: MediaBase[]; title: string; subtitle: string; eyebrow: string;
  accentColor?: string; viewAllHref: string;
}) {
  const [idx, setIdx] = useState(0);
  if (!items.length) return null;

  const featured = items[idx];
  const sideItems = items.filter((_, i) => i !== idx).slice(0, 4);
  const cover = getCover(featured.cover_image);
  const featTitle = getTitle(featured.title);
  const score = featured.average_score ? (featured.average_score / 10).toFixed(1) : null;

  const HERO_H = 440;
  const SIDE_H = (HERO_H - 8) / 2; // gap=8, 2 rows

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
          >
            <Calendar size={16} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: accentColor }}>
              {eyebrow}
            </p>
            <h2 className="font-display text-[28px] font-bold text-white leading-none">{title}</h2>
            <p className="text-white/35 text-[13px] mt-1.5">{subtitle}</p>
          </div>
        </div>
        <Link
          href={viewAllHref}
          className="hidden sm:flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: accentColor }}
        >
          Ver todo <ChevronRight size={14} />
        </Link>
      </div>

      {/* Grid: hero + 2x2 side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 8, height: HERO_H }}>
        {/* Hero card */}
        <Link
          href={`/media/${featured.id}?type=${featured.media_type}`}
          className="group relative rounded-2xl overflow-hidden"
          style={{ height: HERO_H }}
        >
          {cover && (
            <img
              src={cover} alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-25"
            />
          )}
          {cover && (
            <img
              src={cover} alt={featTitle}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 p-7" style={{ maxWidth: "70%" }}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {score && (
                <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-bold text-yellow-400">
                  <Star size={10} fill="#facc15" /> {score}
                </span>
              )}
              {featured.season_year && (
                <span className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-semibold text-white/70">
                  {featured.season_year}
                </span>
              )}
              {featured.genres?.slice(0, 2).map(g => (
                <span key={g} className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-semibold text-white/60">
                  {g}
                </span>
              ))}
            </div>
            <h3 className="font-display text-[28px] font-bold text-white leading-tight mb-5 line-clamp-2">
              {featTitle}
            </h3>
            <div className="flex gap-2.5">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                style={{ background: accentColor }}
                onClick={e => e.preventDefault()}
              >
                <Play size={13} fill="white" /> Ver ahora
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 border border-white/12 hover:border-white/25 hover:text-white transition-all backdrop-blur-sm"
                onClick={e => e.preventDefault()}
              >
                <Plus size={13} /> Mi lista
              </button>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 2px ${accentColor}70` }}
          />
        </Link>

        {/* 2x2 side grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: `${SIDE_H}px ${SIDE_H}px`, gap: 8 }}>
          {sideItems.map((item) => {
            const c = getCover(item.cover_image);
            const t = getTitle(item.title);
            const s = item.average_score ? (item.average_score / 10).toFixed(1) : null;
            const isActive = items[idx] === item;
            return (
              <button
                key={item.id}
                onClick={() => setIdx(items.indexOf(item))}
                className="group relative rounded-xl overflow-hidden text-left w-full h-full"
              >
                {c ? (
                  <img src={c} alt={t} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-dark-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/15 to-transparent" />
                {s && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
                    <Star size={8} fill="#facc15" /> {s}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{t}</p>
                </div>
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-200"
                  style={{ boxShadow: isActive ? `inset 0 0 0 2px ${accentColor}` : "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}