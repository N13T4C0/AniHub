import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Play, Star, Clock, Tv, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getAnime(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/anime/${id}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(id);
  if (!anime) return { title: "Anime no encontrado" };

  const title = anime.title.english || anime.title.romaji;
  return {
    title,
    description: anime.description?.replace(/<[^>]*>/g, "").slice(0, 160),
    openGraph: {
      images: [{ url: anime.cover_image?.large }],
    },
  };
}

const PLATFORM_COLORS: Record<string, string> = {
  Crunchyroll: "bg-orange-500 hover:bg-orange-600",
  Netflix: "bg-red-600 hover:bg-red-700",
  Funimation: "bg-purple-600 hover:bg-purple-700",
  "Amazon Prime": "bg-blue-500 hover:bg-blue-600",
  AniList: "bg-[#6C63FF] hover:bg-[#5a4de8]",
  default: "bg-white/10 hover:bg-white/20",
};

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await getAnime(id);
  if (!anime) notFound();

  const title = anime.title.english || anime.title.romaji;
  const cleanDesc = anime.description?.replace(/<[^>]*>/g, "") || "Sin descripción disponible.";

  return (
    <div className="min-h-screen bg-dark">
      {/* Banner */}
      {anime.banner_image && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={anime.banner_image}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/60 to-dark" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Volver */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a búsqueda
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="w-48 md:w-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {anime.cover_image?.large ? (
                <img
                  src={anime.cover_image.large}
                  alt={title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[2/3] bg-dark-200" />
              )}
            </div>
          </div>

          {/* Info principal */}
          <div className="flex-1">
            {/* Titulo nativo */}
            {anime.title.native && (
              <p className="text-white/40 text-sm mb-1">{anime.title.native}</p>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </h1>
            {anime.title.romaji && anime.title.english && (
              <p className="text-white/40 text-sm mb-4">{anime.title.romaji}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {anime.average_score && (
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span className="font-semibold">{(anime.average_score / 10).toFixed(1)}</span>
                  <span className="text-white/30 text-sm">/10</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Tv size={16} />
                  <span>{anime.episodes} episodios</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Clock size={16} />
                  <span>{anime.duration} min / ep</span>
                </div>
              )}
              <span
                className={`status-badge ${
                  anime.status === "RELEASING"
                    ? "bg-green-500/10 text-green-400"
                    : anime.status === "FINISHED"
                    ? "bg-white/5 text-white/50"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {anime.status === "RELEASING" ? "En emisión" :
                 anime.status === "FINISHED" ? "Finalizado" :
                 anime.status === "NOT_YET_RELEASED" ? "Próximamente" : anime.status}
              </span>
            </div>

            {/* Géneros */}
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((genre: string) => (
                <Link
                  key={genre}
                  href={`/search?genre=${genre}`}
                  className="rounded-full bg-primary/10 border border-primary/20 text-primary text-sm px-3 py-1 hover:bg-primary/20 transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>

            {/* Trailer */}
            {anime.trailer_url && (
              <a
                href={anime.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-primary mb-6 mr-3"
              >
                <Play size={16} fill="currentColor" />
                Ver trailer
              </a>
            )}

            {/* Estudios */}
            {anime.studios?.length > 0 && (
              <p className="text-white/40 text-sm mb-1">
                Studio: <span className="text-white/70">{anime.studios.join(", ")}</span>
              </p>
            )}

            {/* Temporada */}
            {anime.season_year && (
              <p className="text-white/40 text-sm">
                Temporada:{" "}
                <span className="text-white/70">
                  {anime.season} {anime.season_year}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Sinopsis */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold mb-3">Sinopsis</h2>
          <p className="text-white/60 leading-relaxed max-w-3xl">{cleanDesc}</p>
        </div>

        {/* Dónde ver */}
        {anime.streaming_links?.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold mb-4">Dónde ver</h2>
            <div className="flex flex-wrap gap-3">
              {anime.streaming_links.map((link: { platform: string; url: string; is_legal: boolean }) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition-all duration-200 ${
                    PLATFORM_COLORS[link.platform] || PLATFORM_COLORS.default
                  }`}
                >
                  <ExternalLink size={15} />
                  {link.platform}
                  {link.is_legal && (
                    <span className="bg-white/20 rounded px-1 text-xs">LEGAL</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Anime relacionado */}
        {anime.related_anime?.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-semibold mb-4">Relacionado</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {anime.related_anime.map((related: { id: number; title: { english?: string; romaji?: string }; cover_image?: { large?: string }; format?: string }) => (
                <Link key={related.id} href={`/anime/${related.id}`} className="anime-card">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden">
                    {related.cover_image?.large ? (
                      <img src={related.cover_image.large} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-dark-200" />
                    )}
                  </div>
                  <p className="text-xs text-white/60 mt-2 line-clamp-2">
                    {related.title.english || related.title.romaji}
                  </p>
                  <p className="text-xs text-white/30">{related.format}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-16 text-xs text-white/20 text-center">
          AniHub es un agregador de información. No aloja ni distribuye contenido multimedia.
          Todos los derechos sobre las obras pertenecen a sus respectivos propietarios.
        </p>
      </div>
    </div>
  );
}
