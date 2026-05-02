"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2, ChevronDown, Star } from "lucide-react";
import Link from "next/link";
import { seasonApi } from "@/lib/api";
import type { MediaBase } from "@/types/media";
import { getTitle, getCover } from "@/types/media";
import Navbar from "@/components/layout/Navbar";

// ── Types ────────────────────────────────────────────────

type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

const SEASON_CONFIG: Record<Season, {
  label: string; months: string; kanji: string;
  bg: string; accent: string; glow: string;
  particleColor: string[]; particleShape: "snow" | "petal" | "star" | "leaf";
}> = {
  WINTER: {
    label: "Invierno", months: "Enero – Marzo", kanji: "冬",
    bg: "from-[#0a0f2e] via-[#0d1a3a] to-[#061020]",
    accent: "text-cyan-300", glow: "shadow-cyan-500/30",
    particleColor: ["#a8d8f0", "#cce8ff", "#ffffff", "#7ec8e3"],
    particleShape: "snow",
  },
  SPRING: {
    label: "Primavera", months: "Abril – Junio", kanji: "春",
    bg: "from-[#1a0a1e] via-[#2d0a2e] to-[#0f0a18]",
    accent: "text-pink-300", glow: "shadow-pink-500/30",
    particleColor: ["#ffb7d5", "#ff85b3", "#ffc0cb", "#ff69b4"],
    particleShape: "petal",
  },
  SUMMER: {
    label: "Verano", months: "Julio – Septiembre", kanji: "夏",
    bg: "from-[#1a1000] via-[#1f1500] to-[#0f0a00]",
    accent: "text-yellow-300", glow: "shadow-yellow-500/30",
    particleColor: ["#ffd700", "#ffec8b", "#fffacd", "#ffa500"],
    particleShape: "star",
  },
  FALL: {
    label: "Otoño", months: "Octubre – Diciembre", kanji: "秋",
    bg: "from-[#1a0800] via-[#2a0e00] to-[#100500]",
    accent: "text-orange-300", glow: "shadow-orange-500/30",
    particleColor: ["#d2691e", "#ff6b35", "#ff4500", "#cd853f"],
    particleShape: "leaf",
  },
};

const SEASON_ORDER: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + 1 - i);

function getCurrentSeason(): { season: Season; year: number } {
  const m = new Date().getMonth() + 1;
  return {
    season: m <= 3 ? "WINTER" : m <= 6 ? "SPRING" : m <= 9 ? "SUMMER" : "FALL",
    year: CURRENT_YEAR,
  };
}

function prevSeason(s: Season, y: number) {
  const i = SEASON_ORDER.indexOf(s);
  return i === 0 ? { season: "FALL" as Season, year: y - 1 } : { season: SEASON_ORDER[i - 1], year: y };
}
function nextSeason(s: Season, y: number) {
  const i = SEASON_ORDER.indexOf(s);
  return i === 3 ? { season: "WINTER" as Season, year: y + 1 } : { season: SEASON_ORDER[i + 1], year: y };
}

// ── Particle Canvas ──────────────────────────────────────

function ParticleCanvas({ season }: { season: Season }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const cfg = SEASON_CONFIG[season];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialise particles
    type P = { x: number; y: number; r: number; vx: number; vy: number; op: number; rot: number; vrot: number; color: string };
    const N = 60;
    const particles: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 6 + 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.6 + 0.2,
      op: Math.random() * 0.6 + 0.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.03,
      color: cfg.particleColor[Math.floor(Math.random() * cfg.particleColor.length)],
    }));

    const drawSnow = (ctx: CanvasRenderingContext2D, p: P) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + p.rot;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(a) * p.r, p.y + Math.sin(a) * p.r);
      }
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = p.op;
      ctx.stroke();
    };

    const drawPetal = (ctx: CanvasRenderingContext2D, p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.op;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (ctx: CanvasRenderingContext2D, p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.op;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outer = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const inner = outer + Math.PI / 5;
        if (i === 0) ctx.moveTo(Math.cos(outer) * p.r, Math.sin(outer) * p.r);
        else ctx.lineTo(Math.cos(outer) * p.r, Math.sin(outer) * p.r);
        ctx.lineTo(Math.cos(inner) * p.r * 0.4, Math.sin(inner) * p.r * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawLeaf = (ctx: CanvasRenderingContext2D, p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.op;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.r * 1.5);
      ctx.bezierCurveTo(p.r, -p.r, p.r, p.r, 0, p.r * 1.5);
      ctx.bezierCurveTo(-p.r, p.r, -p.r, -p.r, 0, -p.r * 1.5);
      ctx.fill();
      ctx.restore();
    };

    const draw = { snow: drawSnow, petal: drawPetal, star: drawStar, leaf: drawLeaf };
    const drawFn = draw[cfg.particleShape];

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        drawFn(ctx, p);
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [season, cfg.particleColor, cfg.particleShape]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}

// ── Media Card (enhanced) ────────────────────────────────

function SeasonCard({ item, season }: { item: MediaBase; season: Season }) {
  const cfg = SEASON_CONFIG[season];
  const title = getTitle(item.title);
  const cover = getCover(item.cover_image);
  const score = item.average_score ? (item.average_score / 10).toFixed(1) : null;

  return (
    <Link
      href={`/media/${item.id}?type=${item.media_type}`}
      className="group relative block"
    >
      {/* Card glow on hover */}
      <div className={`absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-sm bg-gradient-to-br ${
        season === "WINTER" ? "from-cyan-400 to-blue-600" :
        season === "SPRING" ? "from-pink-400 to-rose-600" :
        season === "SUMMER" ? "from-yellow-400 to-orange-500" :
        "from-orange-400 to-red-600"
      }`} />

      <div className="relative rounded-xl overflow-hidden bg-dark-100 border border-white/5 group-hover:border-white/20 transition-all duration-300">
        {/* Cover */}
        <div className="aspect-[2/3] overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-dark-200 flex items-center justify-center text-white/20 text-xs">
              {item.media_type}
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Score badge */}
        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <Star size={9} className="text-yellow-400" fill="currentColor" />
            <span className="text-[10px] font-bold text-white">{score}</span>
          </div>
        )}

        {/* Status badge */}
        {item.status === "RELEASING" && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-bold uppercase tracking-wide bg-green-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
              En emisión
            </span>
          </div>
        )}

        {/* Title on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{title}</p>
        </div>

        {/* Normal title */}
        <div className="p-2">
          <p className="text-white/70 text-xs font-medium truncate group-hover:opacity-0 transition-opacity">{title}</p>
          {item.format && (
            <p className="text-white/30 text-[10px] mt-0.5">{item.format.replace("_", " ")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function SeasonPage() {
  const current = getCurrentSeason();
  const [season, setSeason] = useState<Season>(current.season);
  const [year, setYear] = useState(current.year);
  const [items, setItems] = useState<MediaBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [yearOpen, setYearOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const cfg = SEASON_CONFIG[season];

  const fetchSeason = useCallback(async (s: Season, y: number, p: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const data = await seasonApi.getSeason(s, y, p);
      if (append) setItems((prev) => [...prev, ...data.items]);
      else setItems(data.items);
      setHasMore(data.has_next_page);
      setTotal(data.total);
      setPage(p);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => {
    fetchSeason(season, year, 1, false);
  }, [season, year, fetchSeason]);

  const goTo = (s: Season, y: number) => {
    if (s === season && y === year) return;
    setTransitioning(true);
    setTimeout(() => {
      setSeason(s); setYear(y);
      setTransitioning(false);
    }, 300);
  };

  const prev = prevSeason(season, year);
  const next = nextSeason(season, year);
  const isCurrent = season === current.season && year === current.year;
  const isFuture = year > current.year || (year === current.year && SEASON_ORDER.indexOf(season) > SEASON_ORDER.indexOf(current.season));

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.bg} transition-all duration-700`}>

      {/* Navbar */}
      <div className="relative z-20 bg-black/20 backdrop-blur-md border-b border-white/5 px-6 py-3">
        <Navbar />
      </div>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden" style={{ height: "380px" }}>
        {/* Particle canvas */}
        <ParticleCanvas season={season} />

        {/* Radial glow behind kanji */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
          <div className={`w-96 h-96 rounded-full blur-3xl opacity-20 ${
            season === "WINTER" ? "bg-cyan-400" :
            season === "SPRING" ? "bg-pink-400" :
            season === "SUMMER" ? "bg-yellow-400" : "bg-orange-400"
          }`} />
        </div>

        {/* Big kanji background text */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <span className={`text-[14rem] font-bold opacity-5 ${cfg.accent}`} style={{ fontFamily: "serif" }}>
            {cfg.kanji}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

          {/* Season tabs */}
          <div className="flex gap-1 mb-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-1">
            {SEASON_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => goTo(s, year)}
                className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  season === s
                    ? `${cfg.accent} bg-white/10`
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {season === s && (
                  <span className={`absolute inset-0 rounded-xl blur-sm opacity-30 ${
                    s === "WINTER" ? "bg-cyan-400" :
                    s === "SPRING" ? "bg-pink-400" :
                    s === "SUMMER" ? "bg-yellow-400" : "bg-orange-400"
                  }`} />
                )}
                <span className="relative">{SEASON_CONFIG[s].label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h1 className={`font-display text-5xl md:text-6xl font-bold ${cfg.accent} drop-shadow-lg`}
                style={{ textShadow: `0 0 40px currentColor` }}>
              {cfg.label}
            </h1>
            <p className="text-white/40 text-sm mt-1">{cfg.months}</p>
          </div>

          {/* Year selector */}
          <div className="relative">
            <button
              onClick={() => setYearOpen(!yearOpen)}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 hover:border-white/30 rounded-full px-5 py-2 text-white font-bold text-lg transition-all"
            >
              {year}
              <ChevronDown size={15} className={`transition-transform ${yearOpen ? "rotate-180" : ""}`} />
            </button>
            {yearOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-dark-100/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 w-28">
                <div className="max-h-44 overflow-y-auto">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => { goTo(season, y); setYearOpen(false); }}
                      className={`w-full text-center py-2 text-sm transition-colors ${
                        y === year ? `${cfg.accent} font-bold` : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-4">
            {isCurrent && (
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1">
                Temporada actual
              </span>
            )}
            {isFuture && (
              <span className={`text-xs bg-white/5 border border-white/20 rounded-full px-3 py-1 ${cfg.accent}`}>
                Próxima temporada
              </span>
            )}
            {!loading && total > 0 && (
              <span className="text-xs text-white/30 bg-black/30 rounded-full px-3 py-1">
                {total.toLocaleString()} series
              </span>
            )}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => goTo(prev.season, prev.year)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 hover:border-white/25 rounded-full p-3 text-white/50 hover:text-white transition-all group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={() => goTo(next.season, next.year)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 hover:border-white/25 rounded-full p-3 text-white/50 hover:text-white transition-all group"
        >
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* ── CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {!isCurrent && (
          <button
            onClick={() => goTo(current.season, current.year)}
            className={`mb-6 text-sm border rounded-xl px-4 py-2 transition-all ${cfg.accent} border-current bg-current/5 hover:bg-current/10`}
          >
            Volver a temporada actual
          </button>
        )}

        {/* Grid */}
        <div className={`transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {items.map((item) => (
              <SeasonCard key={`${item.media_type}-${item.id}`} item={item} season={season} />
            ))}
            {loading && Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white/5 animate-pulse">
                <div className="aspect-[2/3]" />
                <div className="p-2 h-8" />
              </div>
            ))}
          </div>
        </div>

        {!loading && items.length === 0 && (
          <div className="text-center py-24 text-white/30">
            <p className={`text-5xl mb-4 ${cfg.accent}`}>{cfg.kanji}</p>
            <p className="text-lg font-medium">Sin datos para esta temporada</p>
            <p className="text-sm mt-1 text-white/20">AniList todavía puede no tener el calendario completo</p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => fetchSeason(season, year, page + 1, true)}
              disabled={loadingMore}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl border font-semibold text-sm transition-all disabled:opacity-50 ${cfg.accent} border-current bg-current/10 hover:bg-current/20`}
            >
              {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
              Cargar más
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
