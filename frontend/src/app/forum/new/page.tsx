"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { forumApi, type ForumCategory } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import { ChevronLeft, Send, AlertCircle } from "lucide-react";

function NewThreadPageContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCat = searchParams.get("category") ?? "";

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [categorySlug, setCategorySlug] = useState(defaultCat);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    forumApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <p className="text-white/50">Debes iniciar sesión para crear un hilo.</p>
        <Link href="/auth/login" className="btn-primary px-6 py-2 text-sm">Entrar</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categorySlug) { setError("Selecciona una categoría"); return; }
    if (title.trim().length < 5) { setError("El título debe tener al menos 5 caracteres"); return; }
    if (body.trim().length < 10) { setError("El cuerpo debe tener al menos 10 caracteres"); return; }
    setSending(true);
    setError(null);
    try {
      const res = await forumApi.createThread({ category_slug: categorySlug, title: title.trim(), body: body.trim() }, token!);
      router.push(`/forum/thread/${res.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear el hilo");
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/forum" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft size={14} /> Foro
          </Link>
          <span>/</span>
          <span className="text-white/60">Nuevo hilo</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-white mb-8">Crear nuevo hilo</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Categoría <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    categorySlug === cat.slug
                      ? "bg-primary/10 border-primary/40 text-white"
                      : "bg-dark-100 border-white/8 text-white/50 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-white/30 mt-0.5 truncate">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Título <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Un título descriptivo y conciso..."
              maxLength={200}
              className="w-full bg-dark-100 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20"
            />
            <p className="text-xs text-white/25 mt-1">{title.length}/200</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Contenido <span className="text-red-400">*</span></label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Comparte tu opinión, pregunta o debate... (markdown básico soportado)"
              rows={8}
              className="w-full bg-dark-100 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition-colors placeholder:text-white/20"
            />
            <p className="text-xs text-white/25 mt-1">{body.length} caracteres</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link href="/forum" className="text-sm text-white/40 hover:text-white transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? "Publicando..." : <><Send size={13} /> Publicar hilo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <NewThreadPageContent />
    </Suspense>
  );
}
