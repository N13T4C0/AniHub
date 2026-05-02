import { authHeaders } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type WatchStatus = "watching" | "completed" | "plan_to_watch" | "dropped";

export interface ListEntry {
  id: number;
  media_id: number;
  media_type: string;
  title: string;
  cover_image?: string;
  status: WatchStatus;
  progress: number;
  total?: number;
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface AddToListPayload {
  media_id: number;
  media_type: string;
  title: string;
  cover_image?: string;
  status?: WatchStatus;
  progress?: number;
  total?: number;
}

export const listApi = {
  async getAll(): Promise<ListEntry[]> {
    const res = await fetch(`${BASE}/api/v1/list`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener la lista");
    return res.json();
  },

  async add(payload: AddToListPayload): Promise<ListEntry> {
    const res = await fetch(`${BASE}/api/v1/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al agregar a la lista");
    }
    return res.json();
  },

  async update(mediaId: number, mediaType: string, data: { status?: WatchStatus; progress?: number; score?: number }): Promise<ListEntry> {
    const res = await fetch(`${BASE}/api/v1/list/${mediaId}?media_type=${mediaType}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar");
    return res.json();
  },

  async remove(mediaId: number, mediaType: string): Promise<void> {
    await fetch(`${BASE}/api/v1/list/${mediaId}?media_type=${mediaType}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },
};

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Viendo",
  completed: "Completado",
  plan_to_watch: "Pendiente",
  dropped: "Abandonado",
};

export const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: "text-green-400 bg-green-500/10",
  completed: "text-blue-400 bg-blue-500/10",
  plan_to_watch: "text-yellow-400 bg-yellow-500/10",
  dropped: "text-red-400 bg-red-500/10",
};
