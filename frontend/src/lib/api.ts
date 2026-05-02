import type { MediaDetail, SearchResult, MediaType, MediaStatus, MediaFormat } from "@/types/media";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function authFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Review types ───────────────────────────────────────
export interface ReviewPublic {
  id: number;
  user_id: number;
  username: string;
  media_id: number;
  media_type: string;
  score: number | null;
  body: string | null;
  episode: number | null;
  created_at: string;
}

export interface ReviewList {
  items: ReviewPublic[];
  total: number;
  avg_score: number | null;
}

export interface ReviewCreate {
  score?: number | null;
  body?: string | null;
  episode?: number | null;
}

export interface SearchParams {
  q?: string;
  type?: MediaType;
  genre?: string;
  year?: number;
  status?: MediaStatus;
  format?: MediaFormat;
  min_score?: number;
  country?: string;
  page?: number;
  per_page?: number;
}

export const mediaApi = {
  search: (params: SearchParams) =>
    get<SearchResult>("/api/v1/media/search", params as Record<string, unknown>),

  getById: (id: number, type?: MediaType) =>
    get<MediaDetail>(`/api/v1/media/${id}`, type ? { type } : undefined),

  getTrendingAnime: (page = 1, perPage = 12) =>
    get<SearchResult>("/api/v1/media/trending", { page, per_page: perPage }),

  getPopularManga: (page = 1, perPage = 12) =>
    get<SearchResult>("/api/v1/media/popular-manga", { page, per_page: perPage }),
};

export const reviewApi = {
  getReviews: (mediaType: string, mediaId: number, episode?: number | null) => {
    const params: Record<string, unknown> = {};
    if (episode != null) params.episode = episode;
    return get<ReviewList>(`/api/v1/reviews/${mediaType}/${mediaId}`, params);
  },

  createReview: (
    mediaType: string,
    mediaId: number,
    data: ReviewCreate,
    token: string
  ) =>
    authFetch<ReviewPublic>(
      `/api/v1/reviews/${mediaType}/${mediaId}`,
      token,
      { method: "POST", body: JSON.stringify(data) }
    ),

  deleteReview: (reviewId: number, token: string) =>
    authFetch<void>(`/api/v1/reviews/${reviewId}`, token, { method: "DELETE" }),
};

// ── Profile types ──────────────────────────────────────
export interface StatusCounts {
  watching: number;
  completed: number;
  plan_to_watch: number;
  dropped: number;
  on_hold: number;
}

export interface ListStats {
  total_anime: number;
  total_manga: number;
  by_status: StatusCounts;
  avg_score: number | null;
  scored_entries: number;
}

export interface ProfileStats {
  user_id: number;
  username: string;
  email: string;
  list_stats: ListStats;
  review_count: number;
}

export interface ListEntryResponse {
  id: number;
  media_id: number;
  media_type: string;
  title: string;
  cover_image: string | null;
  status: string;
  progress: number;
  total: number | null;
  score: number | null;
  updated_at: string;
}

export interface MyReview {
  id: number;
  media_id: number;
  media_type: string;
  score: number | null;
  body: string | null;
  created_at: string;
}

export const seasonApi = {
  getSeason: (season: string, year: number, page = 1, perPage = 30) =>
    get<SearchResult>("/api/v1/media/season", { season, year, page, per_page: perPage }),
};

export const profileApi = {
  getStats: (token: string) =>
    authFetch<ProfileStats>("/api/v1/profile/stats", token),

  getMyReviews: (token: string) =>
    authFetch<MyReview[]>("/api/v1/profile/reviews", token),

  getMyList: (token: string) =>
    authFetch<ListEntryResponse[]>("/api/v1/list", token),

  changeUsername: (newUsername: string, token: string) =>
    authFetch<{ username: string }>("/api/v1/profile/settings/username", token, {
      method: "PATCH",
      body: JSON.stringify({ new_username: newUsername }),
    }),

  changePassword: (currentPassword: string, newPassword: string, token: string) =>
    authFetch<{ detail: string }>("/api/v1/profile/settings/password", token, {
      method: "PATCH",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  deleteAccount: (token: string) =>
    authFetch<{ detail: string }>("/api/v1/profile/account", token, { method: "DELETE" }),
};

export const recommendationsApi = {
  getByGenre: (genre: string, type: "ANIME" | "MANGA" = "ANIME", page = 1, perPage = 12) =>
    get<SearchResult>("/api/v1/media/recommendations", { genre, type, page, per_page: perPage }),
};

// ── Forum types ────────────────────────────────────────
export interface ForumCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  thread_count: number;
}

export interface ThreadSummary {
  id: number;
  title: string;
  category_slug: string;
  category_name: string;
  username: string;
  user_id: number;
  views: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  media_id?: number;
  media_type?: string;
  media_title?: string;
  media_cover?: string;
  created_at: string;
  updated_at: string;
  preview: string;
}

export interface PostOut {
  id: number;
  thread_id: number;
  user_id: number;
  username: string;
  body: string;
  is_deleted: boolean;
  quote_id?: number;
  quote_body?: string;
  quote_username?: string;
  reactions: Record<string, number>;
  my_reactions: string[];
  created_at: string;
  updated_at: string;
}

export interface ThreadDetail {
  id: number;
  title: string;
  body: string;
  category_slug: string;
  category_name: string;
  username: string;
  user_id: number;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  media_id?: number;
  media_type?: string;
  media_title?: string;
  media_cover?: string;
  created_at: string;
  posts: PostOut[];
  total_posts: number;
}

export const forumApi = {
  getCategories: () => get<ForumCategory[]>("/api/v1/forum/categories"),

  getThreads: (category?: string, page = 1, perPage = 20) =>
    get<ThreadSummary[]>("/api/v1/forum/threads", { category, page, per_page: perPage }),

  getThread: (id: number, page = 1) =>
    get<ThreadDetail>(`/api/v1/forum/threads/${id}`, { page }),

  createThread: (data: {
    category_slug: string; title: string; body: string;
    media_id?: number; media_type?: string; media_title?: string; media_cover?: string;
  }, token: string) =>
    authFetch<{ id: number }>("/api/v1/forum/threads", token, {
      method: "POST", body: JSON.stringify(data),
    }),

  deleteThread: (id: number, token: string) =>
    authFetch<void>(`/api/v1/forum/threads/${id}`, token, { method: "DELETE" }),

  createPost: (threadId: number, body: string, quoteId: number | null, token: string) =>
    authFetch<{ id: number }>(`/api/v1/forum/threads/${threadId}/posts`, token, {
      method: "POST", body: JSON.stringify({ body, quote_id: quoteId }),
    }),

  editPost: (postId: number, body: string, token: string) =>
    authFetch<void>(`/api/v1/forum/posts/${postId}`, token, {
      method: "PUT", body: JSON.stringify({ body }),
    }),

  deletePost: (postId: number, token: string) =>
    authFetch<void>(`/api/v1/forum/posts/${postId}`, token, { method: "DELETE" }),

  react: (postId: number, emoji: string, token: string) =>
    authFetch<{ action: string }>(`/api/v1/forum/posts/${postId}/react`, token, {
      method: "POST", body: JSON.stringify({ emoji }),
    }),
};
