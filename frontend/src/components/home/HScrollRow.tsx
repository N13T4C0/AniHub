"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Star, Play, BookOpen, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { MediaBase } from "@/types/media";
import { getTitle, getCover, getTypeLabel } from "@/types/media";

const CARD_W = 175;
const CARD_H = 248;
const CARD_GAP = 14;
const STEP = CARD_W + CARD_GAP;
const AUTO_INTERVAL = 4000;

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
      className="group flex-shrink-0 block"
      style={{ width: CARD_W }}
    >
      <div
        className="relative rounded-2xl overflow-hidden bg-dark-200 shadow-xl"
        style={{ width: CARD_W, height: CARD_H }}
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-50"
            style={{ width: CARD_W, height: CARD_H }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            {item.media_type === "ANIME" ? <Play size={32} /> : <BookOpen size={32} />}
          </div>
        )}

        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
            padding: "36px 10px 10px",
          }}
        >
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{title}</p>
          {item.season_year && (
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{item.season_year}</p>
          )}
        </div>

        {score && (
          <div
            className="absolute flex items-center gap-1 backdrop-blur-sm rounded-lg"
            style={{ top: 8, left: 8, background: "rgba(0,0,0,0.75)", padding: "3px 7px" }}
          >
            <Star size={10} fill={scoreColor} style={{ color: scoreColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{score}</span>
          </div>
        )}

        <div
          className="absolute backdrop-blur-sm rounded-md"
          style={{
            top: 8, right: 8,
            background: "linear-gradient(135deg, #6C63FF, #FF5E9F)",
            padding: "2px 7px",
            fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.08em",
            boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
          }}
        >
          {getTypeLabel(item)}
        </div>

        <div
          className="absolute inset-x-0 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ bottom: 56, padding: "0 8px" }}
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
                fontWeight: 600,
              }}
            >
              {g}
            </span>
          ))}
        </div>

        <div
          className="absolute inset-x-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
          style={{ bottom: 34, padding: "0 8px" }}
        >
          <button
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1 rounded-lg text-white text-[10px] font-bold px-2.5 py-1.5 flex-1 justify-center"
            style={{ background: "rgba(108,99,255,0.9)", backdropFilter: "blur(8px)" }}
          >
            <Play size={9} fill="white" /> Ver
          </button>
          <button
            onClick={(e) => e.preventDefault()}
            className="flex items-center rounded-lg text-white/70 px-2 py-1.5 hover:text-white"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
          >
            <Plus size={11} />
          </button>
        </div>

        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 2px rgba(108,99,255,0.7)" }}
        />
      </div>
    </Link>
  );
}

export default function HScrollRow({
  title, subtitle, eyebrow, icon, items, viewAllHref, accentColor = "text-primary",
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
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
      className="py-14 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-end justify-between mb-7">
        <div className="flex items-center gap-4">
          <div
            className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ width: 42, height: 42, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {icon}
          </div>
          <div>
            {eyebrow && (
              <p className={`text-[11px] font-bold uppercase tracking-[0.14em] mb-1 ${accentColor}`}>
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-[28px] font-bold text-white leading-none">{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{subtitle}</p>
          </div>
        </div>
        <Link
          href={viewAllHref}
          className={`hidden sm:flex items-center gap-1 text-sm font-semibold ${accentColor} hover:opacity-70 transition-opacity`}
        >
          Ver todo <ChevronRight size={14} />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: 40, height: 40,
            background: "rgba(108,99,255,0.9)",
            border: "1px solid rgba(108,99,255,0.6)",
            color: "#fff",
            opacity: canPrev ? 1 : 0,
            pointerEvents: canPrev ? "auto" : "none",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 20px rgba(108,99,255,0.4)",
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => scrollBy(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: 40, height: 40,
            background: "rgba(108,99,255,0.9)",
            border: "1px solid rgba(108,99,255,0.6)",
            color: "#fff",
            opacity: canNext ? 1 : 0,
            pointerEvents: canNext ? "auto" : "none",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 20px rgba(108,99,255,0.4)",
          }}
        >
          <ChevronRight size={18} />
        </button>

        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10"
          style={{ width: 80, background: "linear-gradient(to right, rgba(8,8,14,1), transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10"
          style={{ width: 80, background: "linear-gradient(to left, rgba(8,8,14,1), transparent)" }}
        />

        <div
          ref={trackRef}
          onScroll={updateArrows}
          className="flex overflow-x-auto"
          suppressHydrationWarning
          style={{
            gap: CARD_GAP,
            paddingLeft: leftPad,
            paddingRight: leftPad,
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: 6,
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

          <Link
            href={viewAllHref}
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl border border-dashed hover:border-primary/50 transition-all group"
            style={{
              width: CARD_W, height: CARD_H,
              borderColor: "rgba(255,255,255,0.08)",
              scrollSnapAlign: "start",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              style={{ background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)" }}
            >
              <ChevronRight size={20} className="text-primary" />
            </div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Ver todo</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
