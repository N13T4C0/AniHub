"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { mediaApi, type SearchParams } from "@/lib/api";
import type { MediaBase } from "@/types/media";
import MediaCard, { MediaCardSkeleton } from "@/components/media/MediaCard";
import Navbar from "@/components/layout/Navbar";

// ── Constantes ─────────────────────────────────────────

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy",
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR + 1 - i);

const COUNTRIES = [
  { value: "JP", label: "Japonés" },
  { value: "KR", label: "Manhwa (Coreano)" },
  { value: "CN", label: "Manhua (Chino)" },
];

const FORMATS = [
  { value: "TV", label: "Serie TV" },
  { value: "MOVIE", label: "Película" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MANGA", label: "Manga" },
  { value: "ONE_SHOT", label: "One Shot" },
];

const STATUSES = [
  { value: "RELEASING", label: "En emisión" },
  { value: "FINISHED", label: "Finalizado" },
  { value: "NOT_YET_RELEASED", label: "Próximamente" },
  { value: "HIATUS", label: "En pausa" },
];

// ── Componente ─────────────────────────────────────────

export default function SearchPage() {
  const sp = useSearchParams();
  const router = useRouter();

  // Estado de filtros
  const [query, setQuery] = useState(sp.get("q") || "");
  const [type, setType] = useState<"" | "ANIME" | "MANGA">(
    (sp.get("type") as "ANIME" | "MANGA") || ""
  );
  const [genre, setGenre] = useState(sp.get("genre") || "");
  const [format, setFormat] = useState(sp.get("format") || "");
  const [status, setStatus] = useState(sp.get("status") || "");
  const [year, setYear] = useState<number | "">(sp.get("year") ? Number(sp.get("year")) : "");
  const [minScore, setMinScore] = useState<number | "">(sp.get("min_score") ? Number(sp.get("min_score")) : "");
  const [country, setCountry] = useState(sp.get("country") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Estado de resultados
  const [items, setItems] = useState<MediaBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const isInitial = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildParams = useCallback((p = 1): SearchParams => ({
    q: query || undefined,
    type: (type || undefined) as SearchParams["type"],
    genre: genre || undefined,
    format: (format || undefined) as SearchParams["format"],
    status: (status || undefined) as SearchParams["status"],
    year: year || undefined,
    min_score: minScore ? Number(minScore) : undefined,
    country: country || undefined,
    page: p,
    per_page: 24,
  }), [query, type, genre, format, status, year, minScore, country]);

  const doSearch = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const p = reset ? 1 : page + 1;
      const data = await mediaApi.search(buildParams(p));
      if (reset) {
        setItems(data.items);
        setPage(1);
      } else {
        setItems((prev) => [...prev, ...data.items]);
        setPage(p);
      }
      setHasMore(data.has_next_page);
      setTotal(data.total);
    } catch {
      setError("No se pudo conectar con el servidor. ¿Está el backend corriendo?");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildParams, page]);

  // Infinite scroll — observa el sentinel al final de la lista
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          doSearch(false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, doSearch]);

  // Carga inicial
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      doSearch(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(true);
  };

  const clearAll = () => {
    setQuery(""); setType(""); setGenre(""); setFormat(""); setStatus("");
    setYear(""); setMinScore(""); setCountry("");
    router.push("/search");
  };

  const activeFilters = [
    type && { label: type === "ANIME" ? "Anime" : "Manga", clear: () => setType("") },
    genre && { label: genre, clear: () => setGenre("") },
    format && { label: FORMATS.find(f => f.value === format)?.label || format, clear: () => setFormat("") },
    status && { label: STATUSES.find(s => s.value === status)?.label || status, clear: () => setStatus("") },
    year && { label: String(year), clear: () => setYear("") },
    minScore && { label: `+${minScore} score`, clear: () => setMinScore("") },
    country && { label: COUNTRIES.find(c => c.value === country)?.label || country, clear: () => setCountry("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="min-h-screen bg-dark">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 bg-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="px-6 pt-3"><Navbar /></div>
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-6 pb-3 mt-2">

          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar anime, manga, manhwa..."
                className="search-input pl-10 py-2.5 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-5 text-sm">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm transition-all ${
                showFilters || activeFilters.length
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {activeFilters.length > 0 && (
                <span className="bg-primary text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 p-4 rounded-xl bg-dark-100 border border-white/5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Tipo */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Tipo</p>
                <div className="flex gap-2">
                  {[{ v: "", l: "Todos" }, { v: "ANIME", l: "Anime" }, { v: "MANGA", l: "Manga" }].map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setType(v as typeof type)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        type === v ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setStatus(status === value ? "" : value)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        status === value ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formato */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Formato</p>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFormat(format === value ? "" : value)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        format === value ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Año / Score / País */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 pt-4 border-t border-white/5">

              {/* Año */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{"Año"}</p>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                    className="w-full appearance-none rounded-xl bg-dark border border-white/10 text-white/80 text-sm px-3 py-2 pr-8 focus:outline-none focus:border-primary/40"
                  >
                    <option value="">Cualquier año</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Score mínimo */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Score mínimo</p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 60, 70, 80, 90].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMinScore(v === 0 ? "" : v)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        (v === 0 && minScore === "") || minScore === v
                          ? "bg-primary text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {v === 0 ? "Todos" : `${v}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* País de origen */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{"País de origen"}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCountry("")}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                      country === "" ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    Todos
                  </button>
                  {COUNTRIES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setCountry(country === value ? "" : value)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        country === value ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Géneros */}
            <div className="mt-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{"Género"}</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(genre === g ? "" : g)}
                    className={`rounded-full px-3 py-1 text-sm transition-all ${
                      genre === g ? "bg-primary text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4 pt-3 border-t border-white/5">
              <button onClick={clearAll} className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                <X size={14} /> Limpiar filtros
              </button>
              <button
                onClick={() => { doSearch(true); setShowFilters(false); }}
                className="btn-primary text-sm py-1.5 px-4"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Filtros activos */}
        {activeFilters.length > 0 && !showFilters && (
          <div className="max-w-7xl mx-auto flex items-center gap-2 mt-2 pb-3 flex-wrap">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={() => { f.clear(); doSearch(true); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1 hover:bg-primary/20 transition-colors"
              >
                {f.label} <X size={11} />
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {!loading && (
          <p className="text-sm text-white/40 mb-5">
            {query || activeFilters.length
              ? `${total.toLocaleString()} resultados${query ? ` para "${query}"` : ""}`
              : "Tendencias — anime en emisión y manga popular"}
          </p>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {items.map((item) => (
            <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
          {loading && Array.from({ length: 24 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>

        {!loading && items.length === 0 && !error && (
          <div className="text-center py-24 text-white/30">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Sin resultados</p>
            <p className="text-sm mt-1">Prueba con otro término o cambia los filtros</p>
          </div>
        )}

        {/* Sentinel para infinite scroll */}
        <div ref={sentinelRef} className="h-10" />
        {loadingMore && (
          <div className="flex justify-center py-8">
            <span className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full" />
          </div>
        )}
      </main>
    </div>
  );
}
