"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Loader2, ChevronDown, Pencil } from "lucide-react";
import { reviewApi, type ReviewPublic, type ReviewList } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Helpers ─────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const active = readonly ? value : hovered || value;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => !readonly && setHovered(0)}>
      {Array.from({ length: 10 }).map((_, i) => {
        const v = i + 1;
        const filled = v <= active;
        return (
          <button
            key={v}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(v)}
            onMouseEnter={() => !readonly && setHovered(v)}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
          >
            <Star
              size={size}
              className={filled ? "text-yellow-400" : "text-white/15"}
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", { year: "numeric", month: "short" });
}

// ── WriteReviewForm ──────────────────────────────────────

interface WriteFormProps {
  mediaType: string;
  mediaId: number;
  episode?: number | null;
  existing?: ReviewPublic | null;
  onSaved: (r: ReviewPublic) => void;
  onCancel: () => void;
}

function WriteReviewForm({ mediaType, mediaId, episode, existing, onSaved, onCancel }: WriteFormProps) {
  const { token } = useAuth();
  const [score, setScore] = useState<number>(existing?.score ?? 0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!score && !body.trim()) {
      setErr("Incluye al menos una puntuación o un comentario.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const saved = await reviewApi.createReview(
        mediaType,
        mediaId,
        {
          score: score || null,
          body: body.trim() || null,
          episode: episode ?? null,
        },
        token
      );
      onSaved(saved);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-100 border border-white/10 rounded-2xl p-5">
      <p className="text-sm font-semibold text-white/80 mb-4">
        {existing ? "Editar reseña" : episode ? `Comentar episodio ${episode}` : "Escribir reseña"}
      </p>

      {/* Score — solo para reseñas generales (no por episodio) */}
      {!episode && (
        <div className="mb-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Puntuación</p>
          <div className="flex items-center gap-3">
            <StarRating value={score} onChange={setScore} size={22} />
            {score > 0 && (
              <span className="text-yellow-400 font-bold text-lg">{score}/10</span>
            )}
            {score > 0 && (
              <button
                type="button"
                onClick={() => setScore(0)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                quitar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Texto */}
      <div className="mb-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
          {episode ? "Comentario" : "Reseña (opcional)"}
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={4000}
          rows={4}
          placeholder={
            episode
              ? `¿Qué te pareció el episodio ${episode}?`
              : "Escribe tu reseña... (opcional si ya pusiste puntuación)"
          }
          className="w-full rounded-xl bg-dark border border-white/10 text-white/80 text-sm p-3 placeholder-white/20 focus:outline-none focus:border-primary/40 resize-none"
        />
        <p className="text-right text-xs text-white/20 mt-1">{body.length}/4000</p>
      </div>

      {err && <p className="text-sm text-red-400 mb-3">{err}</p>}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="text-sm text-white/40 hover:text-white/70 transition-colors px-4 py-2">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-50">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {existing ? "Actualizar" : "Publicar"}
        </button>
      </div>
    </form>
  );
}

// ── ReviewCard ───────────────────────────────────────────

function ReviewCard({
  review,
  currentUserId,
  onDelete,
}: {
  review: ReviewPublic;
  currentUserId: number | null;
  onDelete: (id: number) => void;
}) {
  const isOwn = currentUserId === review.user_id;
  const initial = review.username.charAt(0).toUpperCase();

  return (
    <div className="bg-dark-100 border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">{review.username}</p>
            <p className="text-xs text-white/30">{timeAgo(review.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.score != null && (
            <div className="flex items-center gap-1">
              <Star size={13} className="text-yellow-400" fill="currentColor" />
              <span className="text-sm font-bold text-yellow-400">{review.score}</span>
              <span className="text-xs text-white/30">/10</span>
            </div>
          )}
          {isOwn && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-white/20 hover:text-red-400 transition-colors p-1 rounded"
              title="Eliminar reseña"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {review.body && (
        <p className="mt-3 text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{review.body}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────

interface Props {
  mediaId: number;
  mediaType: string;
  totalEpisodes?: number | null;
}

export default function ReviewSection({ mediaId, mediaType, totalEpisodes }: Props) {
  const { user, token } = useAuth();

  // Tabs: "general" | "episodes"
  const [tab, setTab] = useState<"general" | "episodes">("general");
  const [selectedEp, setSelectedEp] = useState<number>(1);

  const [data, setData] = useState<ReviewList | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const episode = tab === "episodes" ? selectedEp : null;

  // Reseña propia del usuario en la vista actual
  const ownReview = user
    ? data?.items.find((r) => r.user_id === user.id) ?? null
    : null;

  const loadReviews = useCallback(async (reset = true) => {
    setLoading(true);
    try {
      const p = reset ? 1 : page + 1;
      const result = await reviewApi.getReviews(mediaType, mediaId, episode);
      setData(result);
      if (!reset) setPage(p);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType, mediaId, episode]);

  useEffect(() => {
    setPage(1);
    loadReviews(true);
    setShowForm(false);
  }, [loadReviews]);

  const handleSaved = (saved: ReviewPublic) => {
    setData((prev) => {
      if (!prev) return { items: [saved], total: 1, avg_score: saved.score };
      const filtered = prev.items.filter((r) => r.id !== saved.id);
      return { ...prev, items: [saved, ...filtered], total: filtered.length + 1 };
    });
    setShowForm(false);
  };

  const handleDelete = async (reviewId: number) => {
    if (!token) return;
    try {
      await reviewApi.deleteReview(reviewId, token);
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((r) => r.id !== reviewId), total: prev.total - 1 }
          : prev
      );
    } catch {
      // silently fail
    }
  };

  const canWrite = !!user && !ownReview && !showForm;

  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-display font-semibold">
          Reseñas
          {data && data.total > 0 && (
            <span className="ml-2 text-white/30 font-normal text-sm">({data.total})</span>
          )}
        </h2>

        {/* Score medio */}
        {data?.avg_score != null && tab === "general" && (
          <div className="flex items-center gap-1.5 bg-yellow-400/10 rounded-xl px-3 py-1.5">
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-yellow-400 font-bold text-sm">{data.avg_score.toFixed(1)}</span>
            <span className="text-white/30 text-xs">/ 10 (comunidad)</span>
          </div>
        )}
      </div>

      {/* Tabs — solo si hay episodios */}
      {totalEpisodes && totalEpisodes > 1 && (
        <div className="flex gap-1 mb-5 bg-dark-100 rounded-xl p-1 w-fit">
          {(["general", "episodes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm transition-all ${
                tab === t ? "bg-primary text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t === "general" ? "General" : "Por episodio"}
            </button>
          ))}
        </div>
      )}

      {/* Selector de episodio */}
      {tab === "episodes" && totalEpisodes && (
        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm text-white/50">Episodio</label>
          <div className="relative">
            <select
              value={selectedEp}
              onChange={(e) => setSelectedEp(Number(e.target.value))}
              className="appearance-none rounded-xl bg-dark-100 border border-white/10 text-white/80 text-sm px-4 py-2 pr-8 focus:outline-none focus:border-primary/40"
            >
              {Array.from({ length: totalEpisodes }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Ep {i + 1}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Botón escribir reseña */}
      {canWrite && token && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 py-2.5 mb-5 transition-all"
        >
          <Pencil size={14} />
          {tab === "episodes" ? `Comentar episodio ${selectedEp}` : "Escribir reseña"}
        </button>
      )}

      {!token && (
        <p className="text-sm text-white/30 mb-5">
          <a href="/login" className="text-primary hover:underline">Inicia sesión</a> para escribir una reseña.
        </p>
      )}

      {/* Formulario */}
      {showForm && token && (
        <div className="mb-5">
          <WriteReviewForm
            mediaType={mediaType}
            mediaId={mediaId}
            episode={episode}
            existing={ownReview}
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Reseña propia (con opción de editar) */}
      {ownReview && !showForm && (
        <div className="mb-5">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Tu reseña</p>
          <div className="relative">
            <ReviewCard
              review={ownReview}
              currentUserId={user?.id ?? null}
              onDelete={handleDelete}
            />
            <button
              onClick={() => setShowForm(true)}
              className="absolute top-3 right-10 text-white/20 hover:text-primary transition-colors p-1 rounded"
              title="Editar reseña"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-white/20" />
        </div>
      ) : (
        <>
          {data && data.items.filter((r) => r.id !== ownReview?.id).length > 0 ? (
            <div className="space-y-3">
              {data.items
                .filter((r) => r.id !== ownReview?.id)
                .map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    currentUserId={user?.id ?? null}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          ) : (
            !ownReview && (
              <p className="text-sm text-white/25 text-center py-8">
                Sin reseñas todavía. ¡Sé el primero!
              </p>
            )
          )}

          {/* Cargar más */}
          {data && data.items.length < data.total && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => loadReviews(false)}
                className="text-sm text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 rounded-xl px-5 py-2 transition-all flex items-center gap-2"
              >
                <ChevronDown size={14} />
                Cargar más reseñas
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
