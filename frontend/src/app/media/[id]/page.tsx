import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, Tv, BookOpen, Clock, ExternalLink,
  Globe, Heart, TrendingUp,
} from "lucide-react";
import { mediaApi } from "@/lib/api";
import { getTitle, getCover, getTypeLabel, getStatusLabel } from "@/types/media";
import type { MediaDetail, StreamingLink } from "@/types/media";
import MediaCard from "@/components/media/MediaCard";
import AddToListButton from "@/components/media/AddToListButton";
import TrailerButton from "@/components/media/TrailerButton";
import ReviewSection from "@/components/media/ReviewSection";
import CharactersSection from "@/components/media/CharactersSection";

// ── Data fetching ──────────────────────────────────────

async function getData(id: string, type?: string): Promise<MediaDetail | null> {
  try {
    return await mediaApi.getById(
      Number(id),
      type === "ANIME" || type === "MANGA" ? type : undefined
    );
  } catch {
    return null;
  }
}

// ── Metadata SEO ───────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const media = await getData(id, type);
  if (!media) return { title: "No encontrado | AniHub" };

  const title = getTitle(media.title);
  const desc = media.description?.replace(/<[^>]*>/g, "").slice(0, 160) ?? "";
  const cover = getCover(media.cover_image);

  return {
    title: `${title} | AniHub`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: cover ? [{ url: cover }] : [],
    },
  };
}

// ── Subcomponentes ─────────────────────────────────────

function StatBadge({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-xs text-white/40 leading-none">{label}</p>
        <p className="text-sm font-semibold text-white leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const LEGAL_COLOR: Record<string, string> = {
  Crunchyroll: "bg-orange-500 hover:bg-orange-400",
  Netflix: "bg-red-600 hover:bg-red-500",
  Funimation: "bg-purple-600 hover:bg-purple-500",
  "Amazon Prime": "bg-sky-600 hover:bg-sky-500",
  MangaPlus: "bg-pink-600 hover:bg-pink-500",
  "Viz Media": "bg-blue-600 hover:bg-blue-500",
  AniList: "bg-[#6C63FF] hover:bg-[#5a4de8]",
};

function StreamingSection({ links }: { links: StreamingLink[] }) {
  const legal = links.filter((l) => l.is_legal);
  const alt = links.filter((l) => !l.is_legal);

  return (
    <section>
      <h2 className="text-lg font-display font-semibold mb-3">{"Dónde ver"}</h2>

      {legal.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Plataformas oficiales</p>
          <div className="flex flex-wrap gap-2">
            {legal.map((l) => (
              <a
                key={l.platform}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 ${
                  LEGAL_COLOR[l.platform] ?? "bg-white/10 hover:bg-white/15"
                }`}
              >
                <ExternalLink size={13} />
                {l.platform}
              </a>
            ))}
          </div>
        </div>
      )}

      {alt.length > 0 && (
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Otras fuentes</p>
          <p className="text-xs text-white/25 mb-2">
            AniHub no aloja ni distribuye contenido. Estos links apuntan a sitios de terceros.
          </p>
          <div className="flex flex-wrap gap-2">
            {alt.map((l) => (
              <a
                key={l.platform}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <ExternalLink size={13} />
                {l.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Página principal ───────────────────────────────────

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;
  const media = await getData(id, type);
  if (!media) notFound();

  // After notFound() call TypeScript needs explicit assertion
  const m = media as MediaDetail;

  const title = getTitle(m.title);
  const cover = getCover(m.cover_image);
  const typeLabel = getTypeLabel(m);
  const statusLabel = getStatusLabel(m.status);
  const score = m.average_score ? (m.average_score / 10).toFixed(1) : null;
  const cleanDesc = m.description?.replace(/<[^>]*>/g, "") ?? "Sin descripción disponible.";

  return (
    <div className="min-h-screen bg-dark">
      {/* Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        {m.banner_image ? (
          <img
            src={m.banner_image}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${m.cover_image?.color ?? "#1A1A2E"} 0%, #0F0F1A 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-dark/50 to-dark" />

        {/* Volver */}
        <div className="absolute top-4 left-6">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 transition-colors"
          >
            <ArrowLeft size={15} />
            {"Búsqueda"}
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10 pb-16">
        <div className="flex gap-7">

          {/* Poster */}
          <div className="shrink-0 w-40 md:w-52">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
              {cover ? (
                <img src={cover} alt={title} className="w-full h-auto block" />
              ) : (
                <div className="aspect-[2/3] bg-dark-200 flex items-center justify-center text-white/20 text-xs">
                  {typeLabel}
                </div>
              )}
            </div>

            {/* Score */}
            {score && (
              <div className="mt-3 flex flex-col items-center bg-dark-100 rounded-xl py-3 border border-white/5">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span className="text-2xl font-bold text-white">{score}</span>
                  <span className="text-white/30 text-sm">/10</span>
                </div>
                <p className="text-xs text-white/30 mt-0.5">AniList score</p>
              </div>
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0 pt-20 md:pt-24">

            {/* Tipo + título nativo */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{
                  backgroundColor: `${m.cover_image?.color ?? "#6C63FF"}33`,
                  color: m.cover_image?.color ?? "#6C63FF",
                }}
              >
                {typeLabel}
              </span>
              {m.title.native && (
                <span className="text-white/30 text-sm truncate">{m.title.native}</span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-1">
              {title}
            </h1>
            {m.title.romaji && m.title.english && (
              <p className="text-white/40 text-sm mb-4">{m.title.romaji}</p>
            )}

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {m.status && (
                <span
                  className={`status-badge ${
                    m.status === "RELEASING"
                      ? "bg-green-500/10 text-green-400"
                      : m.status === "FINISHED"
                      ? "bg-white/5 text-white/50"
                      : m.status === "HIATUS"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  {statusLabel}
                </span>
              )}
              {m.format && (
                <span className="status-badge bg-white/5 text-white/50">
                  {m.format.replace("_", " ")}
                </span>
              )}
              {m.season_year && (
                <span className="status-badge bg-white/5 text-white/50">
                  {m.season} {m.season_year}
                </span>
              )}
            </div>

            {/* Stat cards */}
            <div className="flex flex-wrap gap-2 mb-6">
              {m.episodes && (
                <StatBadge icon={<Tv size={14} />} value={`${m.episodes} eps`} label="Episodios" />
              )}
              {m.chapters && (
                <StatBadge icon={<BookOpen size={14} />} value={`${m.chapters} caps`} label={"Capítulos"} />
              )}
              {m.volumes && (
                <StatBadge icon={<BookOpen size={14} />} value={`${m.volumes} vols`} label={"Volúmenes"} />
              )}
              {m.duration && (
                <StatBadge icon={<Clock size={14} />} value={`${m.duration} min`} label="Por episodio" />
              )}
              {m.popularity && (
                <StatBadge icon={<TrendingUp size={14} />} value={m.popularity.toLocaleString()} label="Popularidad" />
              )}
              {m.favourites && (
                <StatBadge icon={<Heart size={14} />} value={m.favourites.toLocaleString()} label="Favoritos" />
              )}
            </div>

            {/* Géneros */}
            <div className="flex flex-wrap gap-2 mb-5">
              {m.genres.map((g) => (
                <Link
                  key={g}
                  href={`/search?genre=${g}&type=${m.media_type}`}
                  className="rounded-full border border-primary/20 bg-primary/5 text-primary/80 text-sm px-3 py-1 hover:bg-primary/15 hover:text-primary transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Studios / Staff */}
            {m.studios.length > 0 && (
              <p className="text-sm text-white/40 mb-1">
                Estudio: <span className="text-white/70">{m.studios.join(", ")}</span>
              </p>
            )}
            {m.staff.length > 0 && (
              <p className="text-sm text-white/40 mb-1">
                Autores: <span className="text-white/70">{m.staff.slice(0, 3).join(" · ")}</span>
              </p>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <AddToListButton
                mediaId={m.id}
                mediaType={m.media_type}
                title={title}
                coverImage={getCover(m.cover_image) ?? undefined}
                totalEpisodes={m.episodes ?? m.chapters ?? undefined}
              />
              {m.trailer_url && (
                <TrailerButton trailerUrl={m.trailer_url} title={title} />
              )}
            </div>
          </div>
        </div>

        {/* Sinopsis */}
        <section className="mt-10">
          <h2 className="text-lg font-display font-semibold mb-3">Sinopsis</h2>
          <p className="text-white/60 leading-relaxed max-w-3xl text-[15px]">{cleanDesc}</p>
        </section>

        {/* Donde ver */}
        {m.streaming_links.length > 0 && (
          <div className="mt-10">
            <StreamingSection links={m.streaming_links} />
          </div>
        )}

        {/* Links externos */}
        {m.external_links.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-display font-semibold mb-3">Links oficiales</h2>
            <div className="flex flex-wrap gap-2">
              {m.external_links.slice(0, 8).map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm px-3 py-2 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Globe size={13} />
                  {l.platform}
                  {l.language && l.language !== "Japanese" && (
                    <span className="text-xs text-white/30">({l.language})</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Relacionados */}
        {m.related_media.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-display font-semibold mb-4">Relacionado</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {m.related_media.map((r) => (
                <MediaCard key={`${r.media_type}-${r.id}`} item={r} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <CharactersSection characters={m.characters ?? []} />

        <ReviewSection
          mediaId={m.id}
          mediaType={m.media_type}
          totalEpisodes={m.episodes ?? m.chapters ?? null}
        />

        {/* Disclaimer */}
        <p className="mt-16 text-xs text-white/20 text-center">
          AniHub es un agregador de informaci&oacute;n y enlaces. No aloja ni distribuye contenido multimedia.
          Todos los derechos pertenecen a sus respectivos propietarios.
        </p>
      </div>
    </div>
  );
}
