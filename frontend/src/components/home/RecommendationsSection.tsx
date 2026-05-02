"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { recommendationsApi } from "@/lib/api";
import type { MediaBase } from "@/types/media";
import MediaCard from "@/components/media/MediaCard";

const FALLBACK_GENRES = ["Action", "Romance", "Fantasy", "Sci-Fi", "Mystery", "Comedy"];

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchTopGenres(token: string): Promise<string[]> {
  const res = await fetch(`${BASE_API}/api/v1/profile/top-genres`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres ?? [];
}

export default function RecommendationsSection() {
  const { user, token } = useAuth();
  const [items, setItems] = useState<MediaBase[]>([]);
  const [genre, setGenre] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshIdx, setRefreshIdx] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let chosenGenre = genre;

      if (!chosenGenre) {
        if (token) {
          const userGenres = await fetchTopGenres(token);
          chosenGenre = userGenres[0] || FALLBACK_GENRES[0];
        } else {
          chosenGenre = FALLBACK_GENRES[Math.floor(Math.random() * FALLBACK_GENRES.length)];
        }
        setGenre(chosenGenre);
      }

      const result = await recommendationsApi.getByGenre(chosenGenre, "ANIME", 1, 12);
      setItems(result.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, genre, refreshIdx]);

  useEffect(() => {
    load();
  }, [load]);

  function handleRefresh() {
    // Pick a different random genre
    const next = FALLBACK_GENRES.filter((g) => g !== genre);
    setGenre(next[Math.floor(Math.random() * next.length)]);
    setRefreshIdx((i) => i + 1);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Sparkles size={16} className="text-violet-400" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              {user ? "Para ti" : "Descubre"}
              {genre && (
                <span className="text-sm font-normal text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  {genre}
                </span>
              )}
            </h2>
            <p className="text-sm text-white/40">
              {user
                ? "Basado en tu historial de anime"
                : "Popular en este género ahora mismo"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-primary transition-colors"
            >
              <LogIn size={12} />
              Entra para personalizarlo
            </Link>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors disabled:opacity-30"
            title="Cambiar género"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">No se encontraron resultados para este género.</p>
      )}
    </section>
  );
}
