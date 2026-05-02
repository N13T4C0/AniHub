export type MediaType = "ANIME" | "MANGA";
export type MediaStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
export type MediaFormat =
  | "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC"
  | "MANGA" | "NOVEL" | "ONE_SHOT";

export interface MediaTitle {
  romaji?: string;
  english?: string;
  native?: string;
  user_preferred?: string;
}

export interface CoverImage {
  extra_large?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface StreamingLink {
  platform: string;
  url: string;
  is_legal: boolean;
  region?: string;
}

export interface MediaBase {
  id: number;
  media_type: MediaType;
  title: MediaTitle;
  cover_image?: CoverImage;
  banner_image?: string;
  average_score?: number;       // 0–100
  status?: MediaStatus;
  format?: MediaFormat;
  genres: string[];
  season?: string;
  season_year?: number;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  is_adult: boolean;
  country_of_origin?: string;
}

export interface VoiceActor {
  id: number;
  name?: string;
  image?: string;
}

export interface CharacterName {
  full?: string;
  native?: string;
  user_preferred?: string;
}

export interface Character {
  id: number;
  name?: CharacterName;
  image?: { large?: string; medium?: string };
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
  gender?: string;
  description?: string;
  voice_actors: VoiceActor[];
}

export interface MediaDetail extends MediaBase {
  description?: string;
  duration?: number;
  source?: string;
  synonyms: string[];
  studios: string[];
  staff: string[];
  trailer_url?: string;
  site_url?: string;
  popularity?: number;
  favourites?: number;
  streaming_links: StreamingLink[];
  related_media: MediaBase[];
  external_links: { platform: string; url: string; type?: string; language?: string }[];
  characters: Character[];
}

export interface SearchResult {
  page: number;
  per_page: number;
  total: number;
  has_next_page: boolean;
  items: MediaBase[];
}

/** Devuelve el título más adecuado para mostrar */
export function getTitle(title: MediaTitle, lang = "en"): string {
  if (lang === "es" || lang === "en") {
    return title.english || title.romaji || title.native || "Sin título";
  }
  return title.user_preferred || title.romaji || title.english || "Sin título";
}

/** Devuelve la URL de cover más grande disponible */
export function getCover(cover?: CoverImage): string | null {
  return cover?.extra_large || cover?.large || cover?.medium || null;
}

/** Etiqueta legible del tipo de contenido */
export function getTypeLabel(item: MediaBase): string {
  if (item.media_type === "ANIME") return item.format === "MOVIE" ? "Película" : "Anime";
  if (item.country_of_origin === "KR") return "Manhwa";
  if (item.country_of_origin === "CN") return "Manhua";
  return "Manga";
}

/** Etiqueta legible de estado */
export function getStatusLabel(status?: MediaStatus): string {
  const map: Record<MediaStatus, string> = {
    RELEASING: "En emisión",
    FINISHED: "Finalizado",
    NOT_YET_RELEASED: "Próximamente",
    CANCELLED: "Cancelado",
    HIATUS: "En pausa",
  };
  return status ? map[status] : "—";
}
