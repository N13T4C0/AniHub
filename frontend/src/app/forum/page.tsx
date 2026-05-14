import Link from "next/link";
import { forumApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import {
  Clapperboard, BookMarked, Rss, Lightbulb, Gamepad2,
  MessageCircle, MessageSquare, Eye, Pin,
  ArrowUpRight, PenSquare, TrendingUp, Hash,
} from "lucide-react";

// Iconos más específicos mapeados a las claves que vienen del backend
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Tv:           Clapperboard,   // Anime → claqueta de cine
  BookOpen:     BookMarked,     // Manga → libro marcado
  Newspaper:    Rss,            // Noticias → RSS feed
  Sparkles:     Lightbulb,      // Recomendaciones → bombilla
  FlaskConical: Gamepad2,       // Off-topic → mando de videojuego
  Coffee:       MessageCircle,  // Charla → burbuja de chat
  MessageSquare: MessageSquare, // fallback
};

// Colores como borde izquierdo + icono, sin gradientes genéricos
const COLOR_MAP: Record<string, { border: string; icon: string; dot: string }> = {
  violet:  { border: "border-l-violet-500",  icon: "text-violet-400",  dot: "bg-violet-500" },
  pink:    { border: "border-l-pink-500",    icon: "text-pink-400",    dot: "bg-pink-500" },
  blue:    { border: "border-l-sky-500",     icon: "text-sky-400",     dot: "bg-sky-500" },
  yellow:  { border: "border-l-amber-500",   icon: "text-amber-400",   dot: "bg-amber-500" },
  emerald: { border: "border-l-emerald-500", icon: "text-emerald-400", dot: "bg-emerald-500" },
  orange:  { border: "border-l-orange-500",  icon: "text-orange-400",  dot: "bg-orange-500" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "justo ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// Inicial del usuario para el avatar
function getInitial(name: string) {
  return (name ?? "?")[0].toUpperCase();
}

// Color determinista para el avatar según el nombre
const AVATAR_COLORS = [
  "bg-violet-600", "bg-pink-600", "bg-sky-600",
  "bg-emerald-600", "bg-amber-600", "bg-orange-600",
];
function avatarColor(name: string) {
  let hash = 0;
  for (const c of name ?? "") hash = (hash * 31 + c.charCodeAt(0)) & 0xff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
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

      {/* ── Cabecera ── */}
      <div className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-7 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hash size={14} className="text-primary/60" />
              <span className="text-xs text-white/30 tracking-widest uppercase font-medium">AniHub</span>
            </div>
            <h1 className="font-display text-4xl font-black text-white leading-none">Comunidad</h1>
            <p className="text-white/35 text-sm mt-2 max-w-md">
              Debates, recomendaciones y charla sobre anime, manga y más.
            </p>
          </div>

          <Link
            href="/forum/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <PenSquare size={14} />
            Nuevo hilo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Categorías — 2/3 izquierda ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={14} className="text-white/30" />
            <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Secciones</span>
          </div>

          <div className="space-y-1">
            {cats.map((cat, idx) => {
              const Icon = ICON_MAP[cat.icon ?? "MessageSquare"] ?? MessageSquare;
              const colors = COLOR_MAP[cat.color ?? "violet"] ?? COLOR_MAP.violet;

              return (
                <Link
                  key={cat.slug}
                  href={`/forum/${cat.slug}`}
                  className={`group flex items-center gap-4 bg-dark-100 hover:bg-dark-200 border-l-2 ${colors.border} border-t border-r border-b border-white/0 hover:border-white/6 rounded-r-xl px-5 py-4 transition-all duration-150`}
                >
                  {/* Número de sección */}
                  <span className="text-[11px] text-white/15 font-mono w-4 flex-shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Icono */}
                  <div className={`flex-shrink-0 ${colors.icon}`}>
                    <Icon size={20} />
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white/85 group-hover:text-white text-sm transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-xs text-white/30 truncate mt-0.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 flex items-center gap-3 text-right">
                    <div className="hidden sm:block">
                      <p className="text-sm font-bold text-white/60 tabular-nums">{cat.thread_count ?? 0}</p>
                      <p className="text-[10px] text-white/20">hilos</p>
                    </div>
                    <ArrowUpRight
                      size={15}
                      className="text-white/10 group-hover:text-white/40 transition-colors"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {cats.length === 0 && (
            <p className="text-white/25 text-sm py-8 text-center">Cargando secciones…</p>
          )}
        </div>

        {/* ── Actividad reciente — 1/3 derecha ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Últimos hilos</span>
          </div>

          {recent.length === 0 && (
            <p className="text-white/25 text-sm py-4">
              Aún no hay hilos. ¡Abre el primero!
            </p>
          )}

          <div className="space-y-px">
            {recent.map((t) => (
              <Link
                key={t.id}
                href={`/forum/thread/${t.id}`}
                className="group flex items-start gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                {/* Avatar de usuario */}
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white/90 mt-0.5 ${avatarColor(t.username ?? "")}`}
                >
                  {getInitial(t.username ?? "?")}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Categoría + tiempo */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-primary/60 font-medium truncate">{t.category_name}</span>
                    <span className="text-white/15">·</span>
                    <span className="text-[10px] text-white/25 flex-shrink-0">{timeAgo(t.updated_at)}</span>
                  </div>

                  {/* Título */}
                  <p className="text-sm text-white/70 group-hover:text-white/90 line-clamp-2 leading-snug transition-colors">
                    {t.is_pinned && (
                      <Pin size={9} className="inline text-primary/50 mr-1 mb-0.5" />
                    )}
                    {t.title}
                  </p>

                  {/* Autor + stats */}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/20">
                    <span>{t.username}</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare size={9} />
                      {t.reply_count}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye size={9} />
                      {t.views}
                    </span>
                  </div>
                </div>

                {/* Cover del media si existe */}
                {t.media_cover && (
                  <img
                    src={t.media_cover}
                    alt={t.media_title ?? ""}
                    className="w-8 h-11 rounded object-cover flex-shrink-0 opacity-60 group-hover:opacity-90 transition-opacity mt-0.5"
                  />
                )}
              </Link>
            ))}
          </div>

          {recent.length > 0 && (
            <Link
              href="/forum"
              className="flex items-center gap-1.5 mt-4 text-xs text-white/20 hover:text-white/50 transition-colors px-3"
            >
              Ver todos los hilos
              <ArrowUpRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
