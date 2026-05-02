"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forumApi, type ThreadDetail, type PostOut } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Quote, Trash2, Edit2, Send, Lock, ChevronLeft, ChevronRight,
} from "lucide-react";

const EMOJIS = ["❤️", "🔥", "😂", "👏", "😮", "💯", "😭", "⭐"];

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

// ── Avatar ─────────────────────────────────────────────────────

function Avatar({ username, size = 9 }: { username: string; size?: number }) {
  const colors = [
    "bg-violet-500/30 text-violet-300 border-violet-500/20",
    "bg-pink-500/30 text-pink-300 border-pink-500/20",
    "bg-blue-500/30 text-blue-300 border-blue-500/20",
    "bg-emerald-500/30 text-emerald-300 border-emerald-500/20",
    "bg-orange-500/30 text-orange-300 border-orange-500/20",
    "bg-primary/30 text-primary border-primary/20",
  ];
  const idx = username.charCodeAt(0) % colors.length;
  return (
    <div className={`w-${size} h-${size} rounded-full border flex items-center justify-center font-bold text-sm flex-shrink-0 ${colors[idx]}`}>
      {username[0].toUpperCase()}
    </div>
  );
}

// ── PostCard ───────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onQuote,
  onDelete,
  onReact,
  onEdit,
}: {
  post: PostOut;
  currentUserId: number | null;
  onQuote: (p: PostOut) => void;
  onDelete: (id: number) => void;
  onReact: (postId: number, emoji: string) => void;
  onEdit: (p: PostOut) => void;
}) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const { token } = useAuth();

  async function submitEdit() {
    if (!token || !editBody.trim()) return;
    await forumApi.editPost(post.id, editBody.trim(), token);
    setEditing(false);
    onEdit({ ...post, body: editBody.trim() });
  }

  const isOwn = currentUserId === post.user_id;
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  return (
    <div id={`post-${post.id}`} className="flex gap-3 group">
      <Avatar username={post.username} />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-white/85">{post.username}</span>
          <span className="text-xs text-white/25">{timeAgo(post.created_at)}</span>
          {post.updated_at !== post.created_at && (
            <span className="text-[10px] text-white/20 italic">(editado)</span>
          )}
        </div>

        {/* Quote */}
        {post.quote_id && post.quote_body && (
          <div className="border-l-2 border-primary/40 pl-3 py-1 mb-3 bg-primary/5 rounded-r-lg">
            <p className="text-[11px] text-white/40 mb-0.5">
              <span className="font-medium text-primary/60">{post.quote_username}</span> escribió:
            </p>
            <p className="text-xs text-white/50 italic line-clamp-3">{post.quote_body}</p>
          </div>
        )}

        {/* Body */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full bg-dark border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={submitEdit} className="btn-primary text-xs py-1.5 px-4">Guardar</button>
              <button onClick={() => setEditing(false)} className="text-xs text-white/40 hover:text-white border border-white/10 rounded-xl px-4 py-1.5 transition-all">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap break-words">
            {post.body}
          </div>
        )}

        {/* Reactions row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {Object.entries(post.reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(post.id, emoji)}
              className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-1 border transition-all ${
                post.my_reactions.includes(emoji)
                  ? "bg-primary/15 border-primary/30 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/25"
              }`}
            >
              {emoji} <span className="font-medium">{count}</span>
            </button>
          ))}

          {/* Add reaction */}
          <div className="relative">
            <button
              onClick={() => setShowEmojis((v) => !v)}
              className="text-xs text-white/30 hover:text-white/60 border border-dashed border-white/15 hover:border-white/30 rounded-full px-2.5 py-1 transition-all"
            >
              + emoji
            </button>
            {showEmojis && (
              <div className="absolute bottom-full left-0 mb-1 bg-dark-100 border border-white/10 rounded-xl p-2 flex gap-1.5 shadow-xl z-10">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { onReact(post.id, e); setShowEmojis(false); }}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onQuote(post)} className="text-xs text-white/30 hover:text-primary transition-colors flex items-center gap-1">
              <Quote size={11} /> Citar
            </button>
            {isOwn && !post.is_deleted && (
              <>
                <button onClick={() => setEditing(true)} className="text-xs text-white/30 hover:text-blue-400 transition-colors flex items-center gap-1">
                  <Edit2 size={11} />
                </button>
                <button onClick={() => onDelete(post.id)} className="text-xs text-white/30 hover:text-red-400 transition-colors flex items-center gap-1">
                  <Trash2 size={11} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ThreadView ────────────────────────────────────────────

export default function ThreadView({
  thread: initialThread,
  page,
  threadId,
}: {
  thread: ThreadDetail;
  page: number;
  threadId: number;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostOut[]>(initialThread.posts);
  const [replyBody, setReplyBody] = useState("");
  const [quotePost, setQuotePost] = useState<PostOut | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const totalPages = Math.ceil(initialThread.total_posts / 30);

  async function handleReply() {
    if (!token || !replyBody.trim()) return;
    setSending(true);
    setError(null);
    try {
      await forumApi.createPost(threadId, replyBody.trim(), quotePost?.id ?? null, token);
      setReplyBody("");
      setQuotePost(null);
      // Refresh to last page
      router.push(`/forum/thread/${threadId}?page=${totalPages || 1}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(postId: number) {
    if (!token) return;
    await forumApi.deletePost(postId, token);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, body: "[eliminado]", is_deleted: true } : p));
  }

  async function handleReact(postId: number, emoji: string) {
    if (!token) return;
    const res = await forumApi.react(postId, emoji, token);
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const reactions = { ...p.reactions };
      const myReactions = [...p.my_reactions];
      if (res.action === "added") {
        reactions[emoji] = (reactions[emoji] ?? 0) + 1;
        myReactions.push(emoji);
      } else {
        reactions[emoji] = Math.max(0, (reactions[emoji] ?? 1) - 1);
        if (reactions[emoji] === 0) delete reactions[emoji];
        const idx = myReactions.indexOf(emoji);
        if (idx !== -1) myReactions.splice(idx, 1);
      }
      return { ...p, reactions, my_reactions: myReactions };
    }));
  }

  function handleQuote(p: PostOut) {
    setQuotePost(p);
    replyRef.current?.focus();
    replyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleEditLocal(updated: PostOut) {
    setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  const uid = user ? parseInt(String(user.id ?? 0)) : null;

  return (
    <>
      {/* Op body */}
      <div className="bg-dark-100 border border-white/8 rounded-2xl p-6 mb-4">
        <div className="flex gap-3">
          <Avatar username={initialThread.username} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-white/85">{initialThread.username}</span>
              <span className="text-xs text-white/25">{timeAgo(initialThread.created_at)}</span>
              <span className="ml-auto text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">OP</span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{initialThread.body}</p>
          </div>
        </div>
      </div>

      {/* Replies */}
      {posts.length > 0 && (
        <div className="space-y-1 mb-6">
          <p className="text-xs text-white/25 uppercase tracking-widest mb-3">
            {initialThread.total_posts} {initialThread.total_posts === 1 ? "respuesta" : "respuestas"}
          </p>
          {posts.map((post, i) => (
            <div
              key={post.id}
              className={`rounded-2xl px-5 py-4 border transition-colors ${
                i % 2 === 0 ? "bg-dark-100/60 border-white/5" : "bg-dark/40 border-transparent"
              }`}
            >
              <PostCard
                post={post}
                currentUserId={uid}
                onQuote={handleQuote}
                onDelete={handleDelete}
                onReact={handleReact}
                onEdit={handleEditLocal}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mb-8">
          {page > 1 && (
            <Link href={`/forum/thread/${threadId}?page=${page - 1}`} className="flex items-center gap-1 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all">
              <ChevronLeft size={14} /> Anterior
            </Link>
          )}
          <span className="text-sm text-white/30 flex items-center px-4">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/forum/thread/${threadId}?page=${page + 1}`} className="flex items-center gap-1 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all">
              Siguiente <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}

      {/* Reply box */}
      {initialThread.is_locked ? (
        <div className="flex items-center justify-center gap-2 bg-dark-100 border border-white/5 rounded-2xl py-6 text-white/30 text-sm">
          <Lock size={14} /> Este hilo está cerrado
        </div>
      ) : user && token ? (
        <div className="bg-dark-100 border border-white/8 rounded-2xl p-5">
          <div className="flex gap-3">
            <Avatar username={user.username} />
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-white/60">Responder como <span className="text-white">{user.username}</span></p>

              {quotePost && (
                <div className="border-l-2 border-primary/40 pl-3 bg-primary/5 rounded-r-xl py-2 relative">
                  <p className="text-[11px] text-white/40">
                    Citando a <span className="text-primary/70">{quotePost.username}</span>:
                  </p>
                  <p className="text-xs text-white/50 italic mt-0.5 line-clamp-2">{quotePost.body}</p>
                  <button
                    onClick={() => setQuotePost(null)}
                    className="absolute top-1.5 right-2 text-white/20 hover:text-white/50 text-xs"
                  >✕</button>
                </div>
              )}

              <textarea
                ref={replyRef}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Escribe tu respuesta... (markdown básico soportado)"
                rows={4}
                className="w-full bg-dark border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition-colors placeholder:text-white/20"
              />

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-white/25">{replyBody.length} caracteres</p>
                <button
                  onClick={handleReply}
                  disabled={sending || !replyBody.trim()}
                  className="btn-primary text-sm py-2 px-6 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? "Enviando..." : <><Send size={13} /> Responder</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center bg-dark-100 border border-white/5 rounded-2xl py-8">
          <p className="text-white/40 text-sm mb-3">Inicia sesión para participar en el debate</p>
          <Link href="/auth/login" className="btn-primary text-sm px-6 py-2">Entrar</Link>
        </div>
      )}
    </>
  );
}
