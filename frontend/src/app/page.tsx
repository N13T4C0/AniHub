import Link from "next/link";
import {
  TrendingUp, BookOpen, Sparkles, MessageSquare, Play,
  ChevronRight,
} from "lucide-react";
import { mediaApi, seasonApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import ParticleBackgroundLoader from "@/components/layout/ParticleBackgroundLoader";
import CinematicHero from "@/components/home/CinematicHero";
import StatsBar from "@/components/home/StatsBar";
import GenreCard from "@/components/home/GenreCard";
import HScrollRow from "@/components/home/HScrollRow";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import Top10Row from "@/components/home/Top10Row";
import RecommendationsSection from "@/components/home/RecommendationsSection";

function getCurrentSeason(): { season: string; label: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year  = new Date().getFullYear();
  const [season, label] =
    month <= 3 ? ["WINTER", "Invierno"] :
    month <= 6 ? ["SPRING", "Primavera"] :
    month <= 9 ? ["SUMMER", "Verano"] :
    ["FALL", "Otoño"];
  return { season, label, year };
}

// Covers de AniList para los géneros (IDs conocidos)
const GENRES = [
  {
    genre: "Action", label: "Acción", accent: "#ef4444",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C2BI0HBKJVND.jpg",
  },
  {
    genre: "Romance", label: "Romance", accent: "#f472b6",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20665-lhFuSGFFiQGi.jpg",
  },
  {
    genre: "Fantasy", label: "Fantasía", accent: "#a78bfa",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97986-db5LTSp.jpg",
  },
  {
    genre: "Sci-Fi", label: "Sci-Fi", accent: "#38bdf8",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-rl7g.jpg",
  },
  {
    genre: "Mystery", label: "Misterio", accent: "#818cf8",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101291-RnWx2xb6ga.jpg",
  },
  {
    genre: "Comedy", label: "Comedia", accent: "#fbbf24",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YcayjAmj9bre.jpg",
  },
];

export default async function HomePage() {
  const { season, label: seasonLabel, year: seasonYear } = getCurrentSeason();

  const [trendingAnime, popularManga, seasonAnime] = await Promise.allSettled([
    mediaApi.getTrendingAnime(1, 18),
    mediaApi.getPopularManga(1, 18),
    seasonApi.getSeason(season, seasonYear, 1, 18),
  ]);

  const anime    = trendingAnime.status === "fulfilled" ? trendingAnime.value.items : [];
  const manga    = popularManga.status  === "fulfilled" ? popularManga.value.items  : [];
  const seasonal = seasonAnime.status   === "fulfilled" ? seasonAnime.value.items   : [];

  const heroItems = anime.filter((a) => a.banner_image).slice(0, 6);

  return (
    <div className="min-h-screen bg-dark">
      <ParticleBackgroundLoader />

      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* ── HERO (no tocar) ── */}
      <CinematicHero bannerItems={heroItems} />

      {/* Stats */}
      <StatsBar />

      {/* ── Contenido ── */}
      <div className="relative">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div style={{ position: "absolute", top: "5%", left: "8%", width: 700, height: 700,
            background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", top: "30%", right: "5%", width: 600, height: 600,
            background: "radial-gradient(circle, rgba(255,94,159,0.05) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", top: "65%", left: "25%", width: 800, height: 400,
            background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px" }} />
        </div>

        {/* 1 — Top 10 */}
        {anime.length >= 10 && <Top10Row items={anime} />}

        <div className="max-w-7xl mx-auto px-6">
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* 2 — Temporada: Featured layout */}
        {seasonal.length > 0 && (
          <FeaturedCarousel
            items={seasonal}
            title={`${seasonLabel} ${seasonYear}`}
            subtitle="Temporada actual en emisión"
            eyebrow="En antena"
            accentColor="#4ade80"
            viewAllHref="/season"
          />
        )}

        <div className="max-w-7xl mx-auto px-6">
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* 3 — Géneros: tiles con imagen */}
        <section className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}
              >
                <Sparkles size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1 text-violet-400">Explorar</p>
                <h2 className="font-display text-[28px] font-bold text-white leading-none">Por género</h2>
                <p className="text-white/35 text-[13px] mt-1.5">Encuentra exactamente lo que buscas</p>
              </div>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-violet-400 hover:opacity-70 transition-opacity">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {GENRES.map(({ genre, label, accent, cover }) => (
              <GenreCard
                key={genre}
                genre={genre}
                label={label}
                accent={accent}
                cover={cover}
              />
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6">
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* 4 — Trending anime */}
        {anime.length > 0 && (
          <HScrollRow
            title="Anime en tendencia"
            subtitle="Las series más vistas ahora mismo"
            eyebrow="Trending"
            icon={<TrendingUp size={16} className="text-primary" />}
            items={anime}
            viewAllHref="/search?type=ANIME&status=RELEASING"
            accentColor="text-primary"
          />
        )}

        <div className="max-w-7xl mx-auto px-6">
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* 5 — Manga popular */}
        {manga.length > 0 && (
          <HScrollRow
            title="Manga popular"
            subtitle="Incluye manhwa y manhua"
            eyebrow="Destacado"
            icon={<BookOpen size={16} className="text-pink-400" />}
            items={manga}
            viewAllHref="/search?type=MANGA"
            accentColor="text-pink-400"
          />
        )}

        <div className="max-w-7xl mx-auto px-6">
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* 6 — Recomendaciones */}
        <RecommendationsSection />

        {/* 7 — Quick links */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/playlist" className="flex items-center gap-4 bg-gradient-to-r from-violet-900/30 to-pink-900/20 border border-violet-500/15 hover:border-violet-500/35 rounded-2xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">Generador de Playlist</p>
                <p className="text-xs text-white/35 mt-0.5">Tu lista personalizada en segundos</p>
              </div>
            </Link>
            <Link href="/forum" className="flex items-center gap-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/15 hover:border-blue-500/35 rounded-2xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">Foro de la comunidad</p>
                <p className="text-xs text-white/35 mt-0.5">Debates, recomendaciones y más</p>
              </div>
            </Link>
            <Link href="/season" className="flex items-center gap-4 bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/15 hover:border-green-500/35 rounded-2xl p-5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Play size={18} className="text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-green-300 transition-colors">Calendario de temporada</p>
                <p className="text-xs text-white/35 mt-0.5">Toda la temporada actual</p>
              </div>
            </Link>
          </div>
        </section>

        {/* 8 — CTA */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="relative rounded-3xl overflow-hidden border border-white/8 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-violet-500/8 to-pink-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.18),transparent_70%)]" />
            <div className="relative z-10">
              <p className="text-primary text-sm font-bold mb-3 tracking-widest uppercase">Únete gratis</p>
              <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                Guarda tu progreso.<br />
                <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">Comparte tu pasión.</span>
              </h2>
              <p className="text-white/45 mb-8 max-w-md mx-auto">
                Crea listas, escribe reseñas y conecta con miles de otakus en un solo lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register" className="btn-primary px-8 py-3 text-sm font-semibold">
                  Crear cuenta gratis →
                </Link>
                <Link href="/search" className="px-8 py-3 text-sm font-semibold border border-white/15 hover:border-white/30 rounded-xl text-white/60 hover:text-white transition-all">
                  Explorar sin registrarse
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <div className="font-display font-bold text-lg text-white/40">
            Ani<span className="text-primary/60">Hub</span>
          </div>
          <p>Agregador de anime, manga y manhwa · No alojamos ni distribuimos contenido multimedia</p>
          <div className="flex gap-4">
            <Link href="/forum" className="hover:text-white/50 transition-colors">Foro</Link>
            <Link href="/playlist" className="hover:text-white/50 transition-colors">Playlist</Link>
            <Link href="/season" className="hover:text-white/50 transition-colors">Temporada</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
