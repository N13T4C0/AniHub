import Link from "next/link";
import { forumApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import {
  Tv, BookOpen, Newspaper, Sparkles, FlaskConical, Coffee,
  MessageSquare, Eye, Pin, ChevronRight, Users, Flame,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Tv, BookOpen, Newspaper, Sparkles, FlaskConical, Coffee, MessageSquare,
};

const COLOR_MAP: Record<string, string> = {
  violet:  "from-violet-500/20  to-violet-500/5  border-violet-500/20  text-violet-400",
  pink:    "from-pink-500/20    to-pink-500/5    border-pink-500/20    text-pink-400",
  blue:    "from-blue-500/20    to-blue-500/5    border-blue-500/20    text-blue-400",
  yellow:  "from-yellow-500/20  to-yellow-500/5  border-yellow-500/20  text-yellow-400",
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
  orange:  "from-orange-500/20  to-orange-500/5  border-orange-500/20  text-orange-400",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default async function ForumPage() {
  const [categories, recentThreads] = await Promise.allSettled([
    forumApi.getCategories(),
    forumApi.getThreads(undefined, 1, 10),
  ]);

  const cats = categories.status === "fulfilled" ? categories.value : [];
  const recent = recentThreads.status === "fulfilled" ? recentThreads.value : [];

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Foro de AniHub</h1>
              <p className="text-white/40 text-sm">Debate, recomienda y conecta con la comunidad otaku</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-white/30">
              <Users size={13} /> <span>Comunidad activa</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/30">
              <Flame size={13} className="text-orange-400" /> <span>Debates en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Categories — left 2/3 */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Categorías</h2>
          {cats.map((cat) => {
            const Icon = ICON_MAP[cat.icon ?? "MessageSquare"] ?? MessageSquare;
            const colorCls = COLOR_MAP[cat.color ?? "violet"] ?? COLOR_MAP.violet;
            const [fromCls, , borderCls, textCls] = colorCls.split("  ");
            return (
              <Link
                key={cat.slug}
                href={`/forum/${cat.slug}`}
                className={`flex items-center gap-4 bg-gradient-to-r ${fromCls} border ${borderCls} rounded-2xl px-5 py-4 hover:brightness-110 transition-all group`}
              >
                <div className={`w-10 h-10 rounded-xl bg-dark/40 flex items-center justify-center flex-shrink-0 ${textCls}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-white/90">{cat.name}</p>
                  <p className="text-xs text-white/40 truncate mt-0.5">{cat.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-bold text-white/70">{cat.thread_count}</p>
                    <p className="text-[10px] text-white/30">hilos</p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </Link>
            );
          })}

          {/* Create thread CTA */}
          <Link
            href="/forum/new"
            className="flex items-center justify-center gap-2 w-full border border-dashed border-primary/30 hover:border-primary/60 rounded-2xl py-4 text-primary/60 hover:text-primary transition-all text-sm font-medium mt-2"
          >
            + Crear nuevo hilo
          </Link>
        </div>

        {/* Recent activity — right 1/3 */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-white">Actividad reciente</h2>
          {recent.length === 0 && (
            <p className="text-white/30 text-sm">Sin actividad aún. ¡Sé el primero!</p>
          )}
          {recent.map((t) => (
            <Link
              key={t.id}
              href={`/forum/thread/${t.id}`}
              className="block bg-dark-100 border border-white/5 hover:border-white/15 rounded-xl p-4 transition-all group"
            >
              {t.media_cover && (
                <div className="flex items-center gap-2 mb-2">
                  <img src={t.media_cover} alt={t.media_title ?? ""} className="w-6 h-8 rounded object-cover" />
                  <span className="text-[10px] text-white/30 truncate">{t.media_title}</span>
                </div>
              )}
              <p className="text-sm font-medium text-white/80 group-hover:text-white line-clamp-2 leading-snug">
                {t.is_pinned && <Pin size={10} className="inline text-primary mr-1" />}
                {t.title}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
                <span className="text-primary/70">{t.category_name}</span>
                <span>·</span>
                <span>{t.username}</span>
                <span>·</span>
                <span>{timeAgo(t.updated_at)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/20">
                <span className="flex items-center gap-1"><MessageSquare size={10} />{t.reply_count}</span>
                <span className="flex items-center gap-1"><Eye size={10} />{t.views}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
