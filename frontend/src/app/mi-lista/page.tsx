"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { listApi, ListEntry, WatchStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/list";
import { BookOpen, Tv, LogOut } from "lucide-react";

const TABS: { key: WatchStatus | "all"; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "watching", label: "Viendo" },
  { key: "completed", label: "Completado" },
  { key: "plan_to_watch", label: "Pendiente" },
  { key: "dropped", label: "Abandonado" },
];

export default function MiListaPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WatchStatus | "all">("all");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      listApi.getAll()
        .then(setEntries)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const filtered = activeTab === "all"
    ? entries
    : entries.filter((e) => e.status === activeTab);

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === "all"
      ? entries.length
      : entries.filter((e) => e.status === tab.key).length;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl">
          Ani<span className="text-primary">Hub</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40">{user?.username}</span>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Mi lista</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-100 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-white/70" : "text-white/30"}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No hay nada aquí todavía</p>
            <Link href="/search" className="text-primary text-sm mt-2 block hover:underline">
              Explorar anime y manga →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <Link
                key={entry.id}
                href={`/media/${entry.media_id}?type=${entry.media_type}`}
                className="flex items-center gap-4 bg-dark-100 hover:bg-white/5 border border-white/5 rounded-xl p-3 transition-colors group"
              >
                {/* Cover */}
                <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-dark-200">
                  {entry.cover_image && (
                    <img src={entry.cover_image} alt={entry.title} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                    {entry.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`status-badge text-xs ${STATUS_COLORS[entry.status as WatchStatus]}`}>
                      {STATUS_LABELS[entry.status as WatchStatus]}
                    </span>
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      {entry.media_type === "ANIME" ? <Tv size={10} /> : <BookOpen size={10} />}
                      {entry.media_type === "ANIME" ? "Anime" : "Manga"}
                    </span>
                  </div>
                </div>

                {/* Progreso */}
                <div className="text-right shrink-0">
                  <p className="text-sm text-white/60">
                    {entry.progress}
                    {entry.total ? `/${entry.total}` : ""}
                  </p>
                  {entry.score && (
                    <p className="text-xs text-yellow-400">★ {entry.score}/10</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
