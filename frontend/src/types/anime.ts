export type AnimeStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type AnimeFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export interface StreamingLink {
  platform: string;
  url: string;
  is_legal: boolean;
  region?: string;
}

export interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
}

export interface AnimeCoverImage {
  large?: string;
  medium?: string;
  color?: string;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  cover_image?: AnimeCoverImage;
  banner_image?: string;
  average_score?: number;
  episodes?: number;
  status?: AnimeStatus;
  format?: AnimeFormat;
  genres: string[];
  season?: string;
  season_year?: number;
}

export interface AnimeDetail extends Anime {
  description?: string;
  duration?: number;
  source?: string;
  studios: string[];
  trailer_url?: string;
  site_url?: string;
  popularity?: number;
  favourites?: number;
  streaming_links: StreamingLink[];
  related_anime: Anime[];
}

export interface AnimeSearchResult {
  page: number;
  per_page: number;
  total: number;
  has_next_page: boolean;
  items: Anime[];
}

// Para la lista personal del usuario (localStorage)
export type WatchStatus = "watching" | "completed" | "plan_to_watch" | "dropped";

export interface UserListEntry {
  anime_id: number;
  title: string;
  cover_image?: string;
  status: WatchStatus;
  progress: number;        // episodios vistos
  total_episodes?: number;
  score?: number;          // 1-10
  added_at: string;        // ISO date
  updated_at: string;
}
