import Link from "next/link";
import {
  Calendar, TrendingUp, BookOpen, Sparkles, MessageSquare, Play,
  Zap, Heart, Wand2, Cpu, Skull, Laugh, Trophy, Eye,
  ChevronRight,
} from "lucide-react";
import { mediaApi, seasonApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import ParticleBackgroundLoader from "@/components/layout/ParticleBackgroundLoader";
import CinematicHero from "@/components/home/CinematicHero";
import StatsBar from "@/components/home/StatsBar";
import HScrollRow from "@/components/home/HScrollRow";
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

const GENRES = [
  { genre: "Action",   label: "Acción",    Icon: Zap,    accent: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"  },
  { genre: "Romance",  label: "Romance",   Icon: Heart,  accent: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)"},
  { genre: "Fantasy",  label: "Fantasía",  Icon: Wand2,  accent: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)"},
  { genre: "Sci-Fi",   label: "Ciencia F.", Icon: Cpu,   accent: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)" },
  { genre: "Horror",   label: "Terror",    Icon: Skull,  accent: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.2)"},
  { genre: "Comedy",   label: "Comedia",   Icon: Laugh,  accent: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)" },
  { genre: "Sports",   label: "Deportes",  Icon: Trophy, accent: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)" },
  { genre: "Mystery",  label: "Misterio",  Icon: Eye,    accent: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.2)"},
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

  // Items with banner for the cinematic hero
  const heroItems = anime.filter((a) => a.banner_image).slice(0, 6);

  return (
    <div className="min-h-screen bg-dark">
      <ParticleBackgroundLoader />

      {/* Navbar overlaid on hero */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Cinematic hero with Three.js particles */}
      <CinematicHero bannerItems={heroItems} />

      {/* Animated stats */}
      <StatsBar />

      {/* ── Cards section with ambient background ── */}
      <div className="relative">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div style={{
            position: "absolute", top: "5%", left: "10%",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(40px)",
          }} />
          <div style={{
            position: "absolute", top: "35%", right: "5%",
            width: 500, height: 500,
            background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(40px)",
          }} />
          <div style={{
            position: "absolute", top: "65%", left: "30%",
            width: 700, height: 400,
            background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(50px)",
          }} />
          {/* Dot grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
        </div>

      {/* Seasonal anime */}
      {seasonal.length > 0 && (
        <HScrollRow
          title={`${seasonLabel} ${seasonYear}`}
          subtitle="Temporada actual en emisión"
          icon={<Calendar size={16} className="text-green-400" />}
          items={seasonal}
          viewAllHref="/season"
          accentColor="text-green-400"
        />
      )}

      {/* Trending anime */}
      {anime.length > 0 && (
        <HScrollRow
          title="Anime en tendencia"
          subtitle="Las series más vistas ahora mismo"
          icon={<TrendingUp size={16} className="text-primary" />}
          items={anime}
          viewAllHref="/search?type=ANIME&status=RELEASING"
          accentColor="text-primary"
        />
      )}

      {/* Popular manga */}
      {manga.length > 0 && (
        <HScrollRow
          title="Manga popular"
          subtitle="Incluye manhwa y manhua"
          icon={<BookOpen size={16} className="text-pink-400" />}
          items={manga}
          viewAllHref="/search?type=MANGA"
          accentColor="text-pink-400"
        />
      )}

      {/* Genre grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Explorar por género</h2>
            <p className="text-white/35 text-sm mt-1">Encuentra exactamente lo que buscas</p>
          </div>
          <Link href="/search" className="hidden sm:flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GENRES.map(({ genre, label, Icon, accent, bg, border }) => (
            <Link
              key={genre}
              href={`/search?genre=${genre}`}
              className="group relative rounded-2xl p-5 transition-all duration-300 overflow-hidden"
              style={{
                background: bg,
                border: `1px solid ${border}`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 20% 50%, ${bg.replace("0.08", "0.18")}, transparent 70%)` }}
              />
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>
              {/* Label */}
              <p className="font-bold text-white/80 group-hover:text-white transition-colors text-sm">{label}</p>
              {/* Arrow */}
              <div
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0"
                style={{ color: accent }}
              >
                <ChevronRight size={16} />
              </div>
              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(to right, transparent, ${accent}60, transparent)` }}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Personalized recommendations */}
      <RecommendationsSection />

      {/* Quick links strip */}
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

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="relative rounded-3xl overflow-hidden border border-white/8 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-violet-500/8 to-pink-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <p className="text-primary text-sm font-medium mb-3 tracking-widest uppercase">Únete gratis</p>
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

      </div>{/* end cards section */}

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
