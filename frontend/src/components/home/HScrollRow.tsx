"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Star, Play, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaBase } from "@/types/media";
import { getTitle, getCover, getTypeLabel } from "@/types/media";

const CARD_W = 185;
const CARD_GAP = 16;
const STEP = CARD_W + CARD_GAP;
const AUTO_INTERVAL = 3500;

/* ── Card ─────────────────────────────────────────────── */
function HScrollCard({ item }: { item: MediaBase }) {
  const cover = getCover(item.cover_image);
  const title = getTitle(item.title);
  const score = item.average_score ? (item.average_score / 10).toFixed(1) : null;
  const scoreNum = item.average_score ? item.average_score / 10 : 0;
  const scoreColor =
    scoreNum >= 8 ? "#4ade80" :
    scoreNum >= 7 ? "#facc15" :
    scoreNum >= 5 ? "#fb923c" : "#f87171";

  return (
    <Link
      href={`/media/${item.id}?type=${item.media_type}`}
      className="group flex-shrink-0"
      style={{ width: CARD_W }}
    >
      <div
        className="relative rounded-xl overflow-hidden bg-dark-200 shadow-xl"
        style={{ width: CARD_W, height: 265 }}
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ width: CARD_W, height: 265 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            {item.media_type === "ANIME" ? <Play size={32} /> : <BookOpen size={32} />}
          </div>
        )}

        {/* Bottom gradient + title */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
            padding: "32px 10px 10px",
          }}
        >
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{title}</p>
          {item.season_year && (
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{item.season_year}</p>
          )}
        </div>

        {/* Score badge */}
        {score && (
          <div
            className="absolute flex items-center gap-1 backdrop-blur-sm rounded-lg"
            style={{ top: 8, left: 8, background: "rgba(0,0,0,0.75)", padding: "3px 7px" }}
          >
            <Star size={10} fill={scoreColor} style={{ color: scoreColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{score}</span>
          </div>
        )}

        {/* Type badge */}
        <div
          className="absolute backdrop-blur-sm rounded-md"
          style={{
            top: 8, right: 8,
            background: "rgba(139,92,246,0.85)",
            padding: "2px 6px",
            fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.05em",
          }}
        >
          {getTypeLabel(item)}
        </div>

        {/* Hover genre pills */}
        <div
          className="absolute inset-x-0 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ bottom: 52, padding: "0 8px" }}
        >
          {item.genres?.slice(0, 3).map((g) => (
            <span
              key={g}
              style={{
                fontSize: 9,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                borderRadius: 4,
                padding: "2px 6px",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Glow border on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 2px rgba(139,92,246,0.6)" }}
        />
      </div>
    </Link>
  );
}

/* ── Row with carousel ────────────────────────────────── */
export default function HScrollRow({
  title, subtitle, icon, items, viewAllHref, accentColor = "text-primary",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: MediaBase[];
  viewAllHref: string;
  accentColor?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [leftPad, setLeftPad] = useState(24);

  useEffect(() => {
    const calc = () => setLeftPad(Math.max(24, (window.innerWidth - 1280) / 2 + 24));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * STEP * 4, behavior: "smooth" });
  }, []);

  const startAuto = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
      el.scrollBy({ left: atEnd ? -el.scrollWidth : STEP * 3, behavior: "smooth" });
    }, AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    updateArrows();
    if (!isPaused) startAuto();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, startAuto, updateArrows]);

  if (!items.length) return null;

  return (
    <section
      className="py-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header — same max-w as the rest of the page */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {icon}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>
        <Link
          href={viewAllHref}
          className={`hidden sm:flex items-center gap-1 text-sm ${accentColor} hover:opacity-80 transition-opacity`}
        >
          Ver todo <ChevronRight size={14} />
        </Link>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="flex overflow-x-auto"
        suppressHydrationWarning
        style={{
          gap: CARD_GAP,
          paddingLeft: leftPad,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: 4,
        }}
      >
        {items.map((item) => (
          <div
            key={`${item.media_type}-${item.id}`}
            style={{ scrollSnapAlign: "start", flexShrink: 0 }}
          >
            <HScrollCard item={item} />
          </div>
        ))}

        {/* Ver todo tile */}
        <Link
          href={viewAllHref}
          className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl border border-dashed hover:border-primary/50 transition-all"
          style={{
            width: CARD_W, height: 265,
            borderColor: "rgba(255,255,255,0.1)",
            scrollSnapAlign: "start",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            <ChevronRight size={20} className="text-primary" />
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Ver todo</p>
        </Link>
      </div>

      {/* Arrow buttons — centered below the track */}
      <div
        className="flex items-center justify-center gap-3 mt-5"
      >
        <button
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          className="flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: 38, height: 38,
            background: canPrev ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
            border: canPrev ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
            color: canPrev ? "#c084fc" : "rgba(255,255,255,0.2)",
            cursor: canPrev ? "pointer" : "default",
          }}
        >
          <ChevronLeft size={17} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: Math.ceil(items.length / 4) }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = trackRef.current;
                if (el) el.scrollTo({ left: i * STEP * 4, behavior: "smooth" });
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: 6, height: 6,
                background: "rgba(139,92,246,0.4)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          className="flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: 38, height: 38,
            background: canNext ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
            border: canNext ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
            color: canNext ? "#c084fc" : "rgba(255,255,255,0.2)",
            cursor: canNext ? "pointer" : "default",
          }}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </section>
  );
}
