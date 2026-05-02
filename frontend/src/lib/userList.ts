/**
 * Gestión de la lista personal del usuario usando localStorage.
 * En Fase 2 esto se migrará a una API con autenticación.
 */
import type { UserListEntry, WatchStatus } from "@/types/anime";

const STORAGE_KEY = "anihub_user_list";

function getList(): UserListEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveList(entries: UserListEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const userList = {
  getAll(): UserListEntry[] {
    return getList();
  },

  getEntry(animeId: number): UserListEntry | undefined {
    return getList().find((e) => e.anime_id === animeId);
  },

  addOrUpdate(entry: Omit<UserListEntry, "added_at" | "updated_at">): void {
    const list = getList();
    const index = list.findIndex((e) => e.anime_id === entry.anime_id);
    const now = new Date().toISOString();

    if (index >= 0) {
      list[index] = { ...list[index], ...entry, updated_at: now };
    } else {
      list.push({ ...entry, added_at: now, updated_at: now });
    }
    saveList(list);
  },

  updateProgress(animeId: number, episode: number): void {
    const list = getList();
    const index = list.findIndex((e) => e.anime_id === animeId);
    if (index >= 0) {
      list[index].progress = episode;
      list[index].updated_at = new Date().toISOString();
      saveList(list);
    }
  },

  remove(animeId: number): void {
    const list = getList().filter((e) => e.anime_id !== animeId);
    saveList(list);
  },

  getByStatus(status: WatchStatus): UserListEntry[] {
    return getList().filter((e) => e.status === status);
  },
};
