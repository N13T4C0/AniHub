"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Sparkles, RefreshCw, ExternalLink, Star, Play, ChevronRight } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────
interface PlaylistItem {
  id: number; title: string; cover?: string;
  score?: number; episodes?: number; genres: string[];
  description?: string; reason: string;
}
interface PlaylistResponse {
  items: PlaylistItem[]; vibe: string; playlist_type: string; title: string;
}

// ── Option configs ─────────────────────────────────────────────
const VIBES = [
  { id: "epic",      label: "Épico",      emoji: "⚔️",  desc: "Aventuras y batallas legendarias",   color: "from-orange-500/20 border-orange-500/30 text-orange-300" },
  { id: "chill",     label: "Chill",      emoji: "🍵",  desc: "Relajado y sin estrés",              color: "from-emerald-500/20 border-emerald-500/30 text-emerald-300" },
  { id: "intense",   label: "Intenso",    emoji: "⚡",  desc: "Adrenalina al máximo",               color: "from-yellow-500/20 border-yellow-500/30 text-yellow-300" },
  { id: "emotional", label: "Emocional",  emoji: "💧",  desc: "Llanto garantizado",                 color: "from-blue-500/20 border-blue-500/30 text-blue-300" },
  { id: "funny",     label: "Gracioso",   emoji: "😂",  desc: "Carcajadas sin parar",               color: "from-pink-500/20 border-pink-500/30 text-pink-300" },
  { id: "dark",      label: "Oscuro",     emoji: "🌑",  desc: "Psicológico y perturbador",          color: "from-violet-500/20 border-violet-500/30 text-violet-300" },
];

const TYPES = [
  { id: "mainstream", label: "Mainstream",  emoji: "🔥",  desc: "Los más populares" },
  { id: "niche",      label: "Nicho",       emoji: "💎",  desc: "Joyas desconocidas" },
  { id: "adventure",  label: "Aventura",    emoji: "🗺️",  desc: "Exploración y descubrimiento" },
  { id: "romance",    label: "Romance",     emoji: "💕",  desc: "Historias de amor" },
  { id: "shonen",     label: "Shonen",      emoji: "👊",  desc: "Protagonistas que no se rinden" },
  { id: "seinen",     label: "Seinen",      emoji: "🧠",  desc: "Maduro y reflexivo" },
  { id: "isekai",     label: "Isekai",      emoji: "🌀",  desc: "Otro mundo, otra vida" },
  { id: "mecha",      label: "Mecha",       emoji: "🤖",  desc: "Robots gigantes" },
  { id: "horror",     label: "Terror",      emoji: "👻",  desc: "Escalofriante" },
  { id: "sports",     label: "Deportes",    emoji: "🏆",  desc: "Competición y superación" },
];

const LENGTHS = [
  { id: "any",    label: "Cualquiera",   emoji: "♾️" },
  { id: "short",  label: "Corta (≤13)",  emoji: "🎯" },
  { id: "medium", label: "Media (13-26)", emoji: "📺" },
  { id: "long",   label: "Larga (26+)",  emoji: "🏔️" },
  { id: "movie",  label: "Película",     emoji: "🎬" },
];

const ERAS = [
  { id: "any",     label: "Todas las épocas", emoji: "🌐" },
  { id: "classic", label: "Clásico (<2000)",  emoji: "📼" },
  { id: "2000s",   label: "Años 2000",        emoji: "💿" },
  { id: "2010s",   label: "Años 2010",        emoji: "📱" },
  { id: "recent",  label: "Reciente (2020+)", emoji: "✨" },
];

// ── Option button ──────────────────────────────────────────────
function OptionBtn({
  selected, onClick, emoji, label, desc, colorCls,
}: {
  selected: boolean; onClick: () => void;
  emoji: string; label: string; desc?: string; colorCls?: string;
}) {
  const [from, border, text] = (colorCls ?? "from-primary/20 border-primary/30 text-primary").split(" ");
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border px-4 py-3 transition-all duration-200 ${
        selected
          ? `bg-gradient-to-br ${from} ${border} ${text} scale-[1.02] shadow-lg`
          : "bg-dark-100 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80"
      }`}
    >
      <span className="text-2xl block mb-1">{emoji}</span>
      <p className="font-semibold text-sm">{label}</p>
      {desc && <p className="text-xs opacity-60 mt-0.5 leading-tight">{desc}</p>}
    </button>
  );
}

// ── Playlist card ──────────────────────────────────────────────
function PlaylistCard({ item, index }: { item: PlaylistItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative flex gap-4 bg-dark-100 border border-white/8 hover:border-primary/25 rounded-2xl p-4 transition-all duration-200 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Index */}
      <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-dark border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
        {index + 1}
      </div>

      {/* Cover */}
      <div className="relative w-16 h-22 flex-shrink-0 rounded-xl overflow-hidden bg-dark-200">
        {item.cover ? (
          <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <Play size={20} />
          </div>
        )}
        {hovered && (
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
            <Link href={`/media/${item.id}?type=ANIME`}>
              <ExternalLink size={16} className="text-white" />
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/media/${item.id}?type=ANIME`}>
          <h3 className="font-semibold text-white/85 group-hover:text-white text-sm leading-snug line-clamp-2 transition-colors">
            {item.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-white/35">
          {item.score && (
            <span className="flex items-center gap-1 text-yellow-400/80">
              <Star size={10} fill="currentColor" />
              {(item.score / 10).toFixed(1)}
            </span>
          )}
          {item.episodes && <span>{item.episodes} eps</span>}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.genres.slice(0, 3).map((g) => (
            <span key={g} className="text-[10px] bg-white/5 text-white/40 rounded-full px-2 py-0.5">{g}</span>
          ))}
        </div>

        {/* Reason badge */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary/70 bg-primary/8 border border-primary/15 rounded-full px-2.5 py-1 w-fit">
          <Sparkles size={9} />
          {item.reason}
        </div>
      </div>

      <Link
        href={`/media/${item.id}?type=ANIME`}
        className="self-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={16} className="text-white/30" />
      </Link>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function PlaylistPage() {
  const [vibe, setVibe]         = useState("epic");
  const [type, setType]         = useState("mainstream");
  const [length, setLength]     = useState("any");
  const [era, setEra]           = useState("any");
  const [count, setCount]       = useState(8);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<PlaylistResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BASE}/api/v1/playlist/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, playlist_type: type, length, era, count }),
      });
      if (!res.ok) throw new Error("Error generando la playlist");
      const data: PlaylistResponse = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-violet-500/5 to-pink-500/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-4">
            <Sparkles size={13} />
            Generador de Playlists
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Tu playlist de anime<br />
            <span className="text-primary">perfecta</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            Cuéntanos tu estado de ánimo y te generamos una lista personalizada de anime en segundos.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!result ? (
          <div className="space-y-8">
            {/* Vibe */}
            <div>
              <h2 className="font-display text-base font-semibold text-white mb-1">¿Qué vibe buscas?</h2>
              <p className="text-xs text-white/30 mb-4">Tu estado de ánimo ahora mismo</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VIBES.map((v) => (
                  <OptionBtn key={v.id} selected={vibe === v.id} onClick={() => setVibe(v.id)}
                    emoji={v.emoji} label={v.label} desc={v.desc} colorCls={v.color} />
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <h2 className="font-display text-base font-semibold text-white mb-1">¿Qué tipo de anime?</h2>
              <p className="text-xs text-white/30 mb-4">El estilo o género principal</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TYPES.map((t) => (
                  <OptionBtn key={t.id} selected={type === t.id} onClick={() => setType(t.id)}
                    emoji={t.emoji} label={t.label} desc={t.desc} />
                ))}
              </div>
            </div>

            {/* Length + Era */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="font-display text-base font-semibold text-white mb-1">Duración</h2>
                <p className="text-xs text-white/30 mb-3">Por episodios o formato</p>
                <div className="space-y-2">
                  {LENGTHS.map((l) => (
                    <button key={l.id} type="button" onClick={() => setLength(l.id)}
                      className={`w-full flex items-center gap-3 text-left rounded-xl border px-4 py-2.5 text-sm transition-all ${
                        length === l.id
                          ? "bg-primary/10 border-primary/30 text-white"
                          : "bg-dark-100 border-white/8 text-white/50 hover:border-white/20"
                      }`}
                    >
                      <span>{l.emoji}</span> {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-white mb-1">Época</h2>
                <p className="text-xs text-white/30 mb-3">Cuándo se emitió</p>
                <div className="space-y-2">
                  {ERAS.map((e) => (
                    <button key={e.id} type="button" onClick={() => setEra(e.id)}
                      className={`w-full flex items-center gap-3 text-left rounded-xl border px-4 py-2.5 text-sm transition-all ${
                        era === e.id
                          ? "bg-primary/10 border-primary/30 text-white"
                          : "bg-dark-100 border-white/8 text-white/50 hover:border-white/20"
                      }`}
                    >
                      <span>{e.emoji}</span> {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Count */}
            <div>
              <h2 className="font-display text-base font-semibold text-white mb-1">
                Número de anime: <span className="text-primary">{count}</span>
              </h2>
              <input type="range" min={5} max={12} value={count} onChange={(e) => setCount(+e.target.value)}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>5 (compacta)</span><span>12 (completa)</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={loading}
              className="w-full btn-primary py-4 text-base font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <><RefreshCw size={18} className="animate-spin" /> Generando tu playlist...</>
              ) : (
                <><Sparkles size={18} /> Generar Playlist</>
              )}
            </button>
          </div>
        ) : (
          <div>
            {/* Result header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-3">
                <Sparkles size={13} /> Playlist generada
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-2">{result.title}</h2>
              <p className="text-white/40 text-sm">{result.items.length} anime · Vibe: {result.vibe} · Tipo: {result.playlist_type}</p>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-8">
              {result.items.map((item, i) => (
                <PlaylistCard key={item.id} item={item} index={i} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={generate}
                className="flex items-center gap-2 text-sm border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl px-5 py-2.5 transition-all"
              >
                <RefreshCw size={14} /> Regenerar
              </button>
              <button
                onClick={() => setResult(null)}
                className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
              >
                <Sparkles size={14} /> Nueva playlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
