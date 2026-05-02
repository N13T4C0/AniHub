"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listApi, WatchStatus, STATUS_LABELS } from "@/lib/list";

interface Props {
  mediaId: number;
  mediaType: string;
  title: string;
  coverImage?: string;
  totalEpisodes?: number;
  initialEntry?: { status: WatchStatus; progress: number; score?: number } | null;
}

const STATUSES: WatchStatus[] = ["watching", "completed", "plan_to_watch", "dropped"];

export default function AddToListButton({
  mediaId, mediaType, title, coverImage, totalEpisodes, initialEntry
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [entry, setEntry] = useState(initialEntry ?? null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si no está logueado, redirigir al login
  if (!user) {
    return (
      <button
        onClick={() => router.push("/auth/login")}
        className="inline-flex items-center gap-2 btn-primary"
      >
        <Plus size={15} />
        Añadir a mi lista
      </button>
    );
  }

  const handleAdd = async (status: WatchStatus) => {
    setLoading(true);
    try {
      const newEntry = await listApi.add({
        media_id: mediaId,
        media_type: mediaType,
        title,
        cover_image: coverImage,
        status,
        total: totalEpisodes,
      });
      setEntry({ status: newEntry.status as WatchStatus, progress: newEntry.progress, score: newEntry.score ?? undefined });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleUpdate = async (status: WatchStatus) => {
    setLoading(true);
    try {
      const updated = await listApi.update(mediaId, mediaType, { status });
      setEntry({ status: updated.status as WatchStatus, progress: updated.progress, score: updated.score ?? undefined });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await listApi.remove(mediaId, mediaType);
      setEntry(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  // Si no está en la lista: mostrar dropdown para agregar
  if (!entry) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          disabled={loading}
          className="inline-flex items-center gap-2 btn-primary disabled:opacity-50"
        >
          <Plus size={15} />
          Añadir a mi lista
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-dark-100 border border-white/10 shadow-xl z-20 overflow-hidden animate-fade-in">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleAdd(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Si ya está en la lista: mostrar estado actual con opciones para cambiar
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/30 text-primary px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/20 transition-all"
      >
        <Check size={15} />
        {STATUS_LABELS[entry.status]}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-dark-100 border border-white/10 shadow-xl z-20 overflow-hidden animate-fade-in">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleUpdate(s)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                entry.status === s
                  ? "text-primary bg-primary/10"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          <hr className="border-white/5 my-1" />
          <button
            onClick={handleRemove}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <Trash2 size={13} /> Quitar de mi lista
          </button>
        </div>
      )}
    </div>
  );
}
