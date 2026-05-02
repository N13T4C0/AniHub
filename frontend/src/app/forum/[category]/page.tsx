import Link from "next/link";
import { notFound } from "next/navigation";
import { forumApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import { MessageSquare, Eye, Pin, Lock, ChevronLeft, Plus, Image as ImageIcon } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `hace ${days}d` : new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);

  const [categories, threads] = await Promise.allSettled([
    forumApi.getCategories(),
    forumApi.getThreads(category, page, 25),
  ]);

  if (categories.status === "rejected" || threads.status === "rejected") notFound();

  const cats = categories.value;
  const cat = cats.find((c) => c.slug === category);
  if (!cat) notFound();

  const threadList = threads.value;

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link href="/forum" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft size={14} /> Foro
          </Link>
          <span>/</span>
          <span className="text-white/70">{cat.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{cat.name}</h1>
            <p className="text-white/40 text-sm mt-1">{cat.description}</p>
          </div>
          <Link
            href={`/forum/new?category=${category}`}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
          >
            <Plus size={14} /> Nuevo hilo
          </Link>
        </div>

        {/* Thread list */}
        <div className="space-y-2">
          {threadList.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
              <p>No hay hilos en esta categoría aún.</p>
              <Link href={`/forum/new?category=${category}`} className="text-primary hover:text-primary/80 text-sm mt-2 inline-block">
                Crea el primero →
              </Link>
            </div>
          )}
          {threadList.map((t) => (
            <Link
              key={t.id}
              href={`/forum/thread/${t.id}`}
              className="flex gap-4 items-start bg-dark-100 hover:bg-dark-100/80 border border-white/5 hover:border-white/12 rounded-2xl px-5 py-4 transition-all group"
            >
              {/* Media thumbnail */}
              {t.media_cover ? (
                <img src={t.media_cover} alt="" className="w-10 h-14 rounded-lg object-cover flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-10 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ImageIcon size={14} className="text-white/20" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  {t.is_pinned && (
                    <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
                      <Pin size={9} /> Fijado
                    </span>
                  )}
                  {t.is_locked && (
                    <span className="flex items-center gap-1 text-[10px] bg-white/5 text-white/40 border border-white/10 rounded-full px-2 py-0.5">
                      <Lock size={9} /> Cerrado
                    </span>
                  )}
                  {t.media_title && (
                    <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5 truncate max-w-[120px]">
                      {t.media_title}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-white/85 group-hover:text-white text-sm mt-1.5 leading-snug line-clamp-2">
                  {t.title}
                </p>
                <p className="text-xs text-white/35 mt-1 line-clamp-1">{t.preview}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                  <span className="font-medium text-white/50">{t.username}</span>
                  <span>{timeAgo(t.updated_at)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0 text-xs text-white/30">
                <div className="flex items-center gap-1"><MessageSquare size={11} />{t.reply_count}</div>
                <div className="flex items-center gap-1"><Eye size={11} />{t.views}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {(threadList.length === 25 || page > 1) && (
          <div className="flex justify-center gap-3 mt-8">
            {page > 1 && (
              <Link href={`/forum/${category}?page=${page - 1}`} className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all">
                ← Anterior
              </Link>
            )}
            {threadList.length === 25 && (
              <Link href={`/forum/${category}?page=${page + 1}`} className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all">
                Siguiente →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
