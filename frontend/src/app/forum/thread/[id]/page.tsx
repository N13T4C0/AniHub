import { notFound } from "next/navigation";
import Link from "next/link";
import { forumApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import ThreadView from "@/components/forum/ThreadView";
import { Pin, Lock, Eye, ChevronLeft } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `hace ${days}d` : new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);
  const threadId = parseInt(id, 10);

  let thread;
  try {
    thread = await forumApi.getThread(threadId, page);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link href="/forum" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft size={14} /> Foro
          </Link>
          <span>/</span>
          <Link href={`/forum/${thread.category_slug}`} className="hover:text-white transition-colors">
            {thread.category_name}
          </Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-[200px]">{thread.title}</span>
        </div>

        {/* Thread header */}
        <div className="bg-dark-100 border border-white/8 rounded-2xl p-6 mb-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {thread.is_pinned && (
              <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
                <Pin size={10} /> Fijado
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 text-xs bg-white/5 text-white/40 border border-white/10 rounded-full px-2.5 py-1">
                <Lock size={10} /> Cerrado
              </span>
            )}
            <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2.5 py-1">
              {thread.category_name}
            </span>
          </div>

          {/* Media link */}
          {thread.media_id && (
            <Link
              href={`/media/${thread.media_id}?type=${thread.media_type}`}
              className="flex items-center gap-3 bg-dark/50 border border-white/5 rounded-xl p-3 mb-4 hover:border-primary/20 transition-all group w-fit"
            >
              {thread.media_cover && (
                <img src={thread.media_cover} alt="" className="w-8 h-11 rounded object-cover" />
              )}
              <div>
                <p className="text-xs text-white/40">Hilo sobre</p>
                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                  {thread.media_title}
                </p>
              </div>
            </Link>
          )}

          <h1 className="font-display text-xl font-bold text-white mb-2">{thread.title}</h1>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Por <span className="text-white/60 font-medium">{thread.username}</span></span>
            <span>{timeAgo(thread.created_at)}</span>
            <span className="flex items-center gap-1"><Eye size={10} /> {thread.views} vistas</span>
            <span>{thread.total_posts} respuestas</span>
          </div>
        </div>

        {/* Interactive thread body (client component) */}
        <ThreadView thread={thread} page={page} threadId={threadId} />
      </div>
    </div>
  );
}
