"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, BookOpen, Tv, Clock, List, MessageSquare,
  ChevronRight, TrendingUp, Award, Eye, Settings,
} from "lucide-react";
import { profileApi, type ProfileStats, type ListEntryResponse, type MyReview } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";

// ── Helpers ────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  watching: "Viendo",
  completed: "Completado",
  plan_to_watch: "Plan",
  dropped: "Abandonado",
  on_hold: "En pausa",
};

const STATUS_COLOR: Record<string, string> = {
  watching: "text-green-400 bg-green-400/10",
  completed: "text-blue-400 bg-blue-400/10",
  plan_to_watch: "text-white/50 bg-white/5",
  dropped: "text-red-400 bg-red-400/10",
  on_hold: "text-yellow-400 bg-yellow-400/10",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}

// ── Stat card ──────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
}) {
  return (
    <div className="bg-dark-100 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/50">{label}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── List entry row ─────────────────────────────────────

function ListRow({ entry }: { entry: ListEntryResponse }) {
  return (
    <Link
      href={`/media/${entry.media_id}?type=${entry.media_type}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-dark-200">
        {entry.cover_image ? (
          <img src={entry.cover_image} alt={entry.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
            {entry.media_type === "ANIME" ? <Tv size={14} /> : <BookOpen size={14} />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
          {entry.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${STATUS_COLOR[entry.status]}`}>
            {STATUS_LABEL[entry.status] ?? entry.status}
          </span>
          {entry.progress > 0 && (
            <span className="text-xs text-white/30">
              {entry.progress}{entry.total ? `/${entry.total}` : ""} eps
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1 shrink-0">
        {entry.score ? (
          <>
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            <span className="text-sm font-semibold text-yellow-400">{entry.score}</span>
          </>
        ) : (
          <span className="text-xs text-white/20">—</span>
        )}
        <ChevronRight size={14} className="text-white/20 ml-1" />
      </div>
    </Link>
  );
}

// ── Main page ──────────────────────────────────────────

type ListTab = "all" | "watching" | "completed" | "plan_to_watch" | "dropped";

export default function ProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [list, setList] = useState<ListEntryResponse[]>([]);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ListTab>("all");
  const [mediaFilter, setMediaFilter] = useState<"ALL" | "ANIME" | "MANGA">("ALL");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      profileApi.getStats(token),
      profileApi.getMyList(token),
      profileApi.getMyReviews(token),
    ]).then(([s, l, r]) => {
      setStats(s);
      setList(l);
      setReviews(r);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (isLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const initial = user.username.charAt(0).toUpperCase();

  // Filtrado de lista
  const filteredList = list.filter((e) => {
    const statusOk = tab === "all" || e.status === tab;
    const mediaOk = mediaFilter === "ALL" || e.media_type === mediaFilter;
    return statusOk && mediaOk;
  });

  const s = stats!;

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 z-10 bg-dark/90 backdrop-blur-md border-b border-white/5 px-6 py-3">
        <Navbar />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Header de perfil ── */}
        <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{user.username}</h1>
            <p className="text-white/40 text-sm">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-white/30 flex items-center gap-1">
                <List size={12} /> {list.length} títulos en lista
              </span>
              <span className="text-xs text-white/30 flex items-center gap-1">
                <MessageSquare size={12} /> {s.review_count} {"reseñas"}
              </span>
            </div>
          </div>
        </div>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all shrink-0"
          >
            <Settings size={14} />
            Configuración
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={<Tv size={20} />}
            value={s.list_stats.total_anime}
            label="Anime"
            sub={`${s.list_stats.by_status.completed} completados`}
          />
          <StatCard
            icon={<BookOpen size={20} />}
            value={s.list_stats.total_manga}
            label="Manga / Manhwa"
            sub={`${s.list_stats.by_status.completed} completados`}
          />
          <StatCard
            icon={<Eye size={20} />}
            value={s.list_stats.by_status.watching}
            label="En progreso"
            sub={`${s.list_stats.by_status.plan_to_watch} pendientes`}
          />
          <StatCard
            icon={<Star size={20} />}
            value={s.list_stats.avg_score ? s.list_stats.avg_score.toFixed(1) : "—"}
            label="Nota media"
            sub={`${s.list_stats.scored_entries} puntuados`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Lista personal ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold">Mi lista</h2>
              {/* Filtro de medio */}
              <div className="flex gap-1 bg-dark-100 rounded-xl p-1">
                {(["ALL", "ANIME", "MANGA"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMediaFilter(m)}
                    className={`rounded-lg px-3 py-1 text-xs transition-all ${
                      mediaFilter === m ? "bg-primary text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {m === "ALL" ? "Todo" : m === "ANIME" ? "Anime" : "Manga"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs de estado */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {(["all", "watching", "completed", "plan_to_watch", "dropped"] as const).map((t) => {
                const count = t === "all"
                  ? list.filter(e => mediaFilter === "ALL" || e.media_type === mediaFilter).length
                  : list.filter(e => e.status === t && (mediaFilter === "ALL" || e.media_type === mediaFilter)).length;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-all ${
                      tab === t
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-white/40 hover:text-white/70 border border-transparent"
                    }`}
                  >
                    {t === "all" ? "Todos" : STATUS_LABEL[t]}
                    <span className={`text-xs rounded-full px-1.5 ${
                      tab === t ? "bg-primary/20 text-primary" : "bg-white/5 text-white/30"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lista */}
            {filteredList.length > 0 ? (
              <div className="space-y-0.5">
                {filteredList.map((e) => <ListRow key={e.id} entry={e} />)}
              </div>
            ) : (
              <div className="text-center py-12 text-white/25">
                <List size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {tab === "all" ? "Tu lista está vacía" : `Sin títulos en "${STATUS_LABEL[tab]}"`}
                </p>
                <Link href="/search" className="text-primary text-sm hover:underline mt-2 inline-block">
                  Explorar
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar derecho ── */}
          <div className="space-y-6">

            {/* Distribución por estado */}
            <div className="bg-dark-100 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <TrendingUp size={14} />
                Distribución
              </h3>
              <div className="space-y-2.5">
                {(["watching", "completed", "plan_to_watch", "dropped", "on_hold"] as const).map((st) => {
                  const count = s.list_stats.by_status[st];
                  const total = list.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={st}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">{STATUS_LABEL[st]}</span>
                        <span className="text-white/30">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mis reseñas recientes */}
            {reviews.length > 0 && (
              <div className="bg-dark-100 border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Award size={14} />
                  {"Reseñas recientes"}
                </h3>
                <div className="space-y-3">
                  {reviews.slice(0, 5).map((r) => (
                    <Link
                      key={r.id}
                      href={`/media/${r.media_id}?type=${r.media_type}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">
                          {r.media_type} #{r.media_id}
                        </span>
                        {r.score && (
                          <div className="flex items-center gap-0.5">
                            <Star size={10} className="text-yellow-400" fill="currentColor" />
                            <span className="text-xs text-yellow-400">{r.score}</span>
                          </div>
                        )}
                      </div>
                      {r.body && (
                        <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{r.body}</p>
                      )}
                      <p className="text-xs text-white/20 mt-0.5">{timeAgo(r.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Acceso rápido */}
            <div className="bg-dark-100 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Clock size={14} />
                Acceso rápido
              </h3>
              <div className="space-y-2">
                <Link
                  href="/search?type=ANIME"
                  className="flex items-center justify-between text-sm text-white/50 hover:text-white transition-colors py-1"
                >
                  Explorar anime <ChevronRight size={14} />
                </Link>
                <Link
                  href="/search?type=MANGA"
                  className="flex items-center justify-between text-sm text-white/50 hover:text-white transition-colors py-1"
                >
                  Explorar manga <ChevronRight size={14} />
                </Link>
                <Link
                  href="/season"
                  className="flex items-center justify-between text-sm text-white/50 hover:text-white transition-colors py-1"
                >
                  Calendario <ChevronRight size={14} />
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center justify-between text-sm text-white/50 hover:text-white transition-colors py-1"
                >
                  Configuración <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
