"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Star } from "lucide-react";
import type { MediaBase } from "@/types/media";
import { getTitle, getCover } from "@/types/media";

const CARD_W = 150;
const CARD_H = 210;
const CARD_GAP = 12;

export default function Top10Row({ items }: { items: MediaBase[] }) {
  const [pad, setPad] = useState(24);

  useEffect(() => {
    const calc = () => setPad(Math.max(24, (window.innerWidth - 1280) / 2 + 24));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  if (!items.length) return null;
  const top10 = items.slice(0, 10);

  return (
    <section className="py-14">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,179,71,0.12)", border: "1px solid rgba(255,179,71,0.25)" }}
          >
            <Flame size={16} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1 text-yellow-400">
              Esta semana
            </p>
            <h2 className="font-display text-[28px] font-bold text-white leading-none">Top 10</h2>
            <p className="text-white/35 text-[13px] mt-1.5">Lo más visto por la comunidad</p>
          </div>
        </div>
      </div>

      {/* Track */}
      <div
        suppressHydrationWarning
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "visible",
          gap: CARD_GAP,
          paddingLeft: pad,
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {top10.map((item, i) => {
          const cover = getCover(item.cover_image);
          const title = getTitle(item.title);
          const score = item.average_score ? (item.average_score / 10).toFixed(1) : null;
          const rank = i + 1;

          return (
            <Link
              key={item.id}
              href={`/media/${item.id}?type=${item.media_type}`}
              className="group flex-shrink-0"
              style={{ width: CARD_W }}
            >
              {/* Card */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
                }}
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-200" />
                )}

                {/* Gradient */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
                />

                {/* Rank badge — top left */}
                <div
                  className="absolute top-0 left-0 flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    background: rank <= 3
                      ? "linear-gradient(135deg, #FFB347, #FF6B35)"
                      : "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(8px)",
                    borderBottomRightRadius: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display, sans-serif)",
                      fontSize: rank >= 10 ? 14 : 16,
                      fontWeight: 900,
                      color: rank <= 3 ? "#fff" : "rgba(255,255,255,0.7)",
                      lineHeight: 1,
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Score */}
                {score && (
                  <div
                    className="absolute flex items-center gap-1 backdrop-blur-sm rounded-md"
                    style={{ top: 8, right: 8, background: "rgba(0,0,0,0.75)", padding: "3px 6px" }}
                  >
                    <Star size={9} fill="#facc15" style={{ color: "#facc15" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#facc15" }}>{score}</span>
                  </div>
                )}

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{title}</p>
                </div>

                {/* Hover border */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 2px rgba(255,179,71,0.7)" }}
                />
              </div>
            </Link>
          );
        })}
                {/* Spacer para right padding en scroll containers */}
        <div style={{ flexShrink: 0, width: pad }} />
      </div>
    </section>
  );
}
