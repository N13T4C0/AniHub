"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { profileApi } from "@/lib/api";
import { User, Lock, Trash2, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

// ── Small helpers ──────────────────────────────────────────────

function Alert({ type, msg }: { type: "ok" | "err"; msg: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
        type === "ok"
          ? "bg-green-500/10 border border-green-500/20 text-green-400"
          : "bg-red-500/10 border border-red-500/20 text-red-400"
      }`}
    >
      {type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-dark-100 border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{title}</p>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── UsernameForm ───────────────────────────────────────────────

function UsernameForm({ currentUsername, token, onSuccess }: {
  currentUsername: string;
  token: string;
  onSuccess: (u: string) => void;
}) {
  const [value, setValue] = useState(currentUsername);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === currentUsername) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await profileApi.changeUsername(value.trim(), token);
      setFeedback({ type: "ok", msg: `Username cambiado a "${res.username}"` });
      onSuccess(res.username);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setFeedback({ type: "err", msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-white/50 mb-1.5">Nuevo username</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          minLength={3}
          maxLength={30}
          required
          className="w-full bg-dark border border-white/10 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20"
          placeholder="Tu nuevo username"
        />
        <p className="text-xs text-white/30 mt-1">{value.length}/30 caracteres</p>
      </div>
      {feedback && <Alert type={feedback.type} msg={feedback.msg} />}
      <button
        type="submit"
        disabled={loading || value.trim() === currentUsername}
        className="btn-primary py-2 px-6 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? "Guardando..." : "Guardar username"}
        {!loading && <ChevronRight size={14} />}
      </button>
    </form>
  );
}

// ── PasswordForm ───────────────────────────────────────────────

function PasswordForm({ token }: { token: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setFeedback({ type: "err", msg: "Las contraseñas nuevas no coinciden" });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await profileApi.changePassword(current, next, token);
      setFeedback({ type: "ok", msg: res.detail });
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setFeedback({ type: "err", msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-white/50 mb-1.5">Contraseña actual</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className="w-full bg-dark border border-white/10 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1.5">Nueva contraseña</label>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          minLength={6}
          required
          className="w-full bg-dark border border-white/10 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1.5">Confirmar nueva contraseña</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full bg-dark border border-white/10 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/20"
          placeholder="Repite la nueva contraseña"
        />
      </div>
      {feedback && <Alert type={feedback.type} msg={feedback.msg} />}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary py-2 px-6 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? "Guardando..." : "Cambiar contraseña"}
        {!loading && <ChevronRight size={14} />}
      </button>
    </form>
  );
}

// ── DangerZone ─────────────────────────────────────────────────

function DangerZone({ token, onDeleted }: { token: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  async function handleDelete() {
    setLoading(true);
    setFeedback(null);
    try {
      await profileApi.deleteAccount(token);
      onDeleted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setFeedback({ type: "err", msg });
      setLoading(false);
    }
  }

  return (
    <div className="bg-red-950/20 border border-red-500/20 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/10">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
          <Trash2 size={15} />
        </div>
        <div>
          <p className="font-semibold text-red-300 text-sm">Zona de peligro</p>
          <p className="text-xs text-red-400/60">Acciones irreversibles</p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        <p className="text-sm text-white/50">
          Eliminar tu cuenta borrará permanentemente tu lista, reseñas y toda tu actividad en AniHub.
          Esta acción <strong className="text-red-400">no se puede deshacer</strong>.
        </p>

        {feedback && <Alert type={feedback.type} msg={feedback.msg} />}

        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-xl px-5 py-2 transition-all"
          >
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-300">¿Estás completamente seguro?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl px-5 py-2 transition-all disabled:opacity-50"
              >
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-5 py-2 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  // Redirect if not logged in
  if (!user || !token) {
    if (typeof window !== "undefined") router.replace("/auth/login");
    return null;
  }

  function handleUsernameSuccess(_newUsername: string) {
    // The AuthContext doesn't expose a setUser — just nudge a page refresh so
    // Navbar and profile pick up the new name.  Alternatively: router.refresh()
    router.refresh();
  }

  function handleAccountDeleted() {
    logout();
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Configuración</h1>
          <p className="text-white/40 text-sm">Gestiona tu cuenta y preferencias</p>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-4 bg-dark-100 border border-white/8 rounded-2xl px-6 py-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user.username}</p>
            <p className="text-sm text-white/40">{user.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Username */}
          <SectionCard
            icon={<User size={15} />}
            title="Cambiar username"
            subtitle="Se refleja en tu perfil y reseñas"
          >
            <UsernameForm
              currentUsername={user.username}
              token={token}
              onSuccess={handleUsernameSuccess}
            />
          </SectionCard>

          {/* Password */}
          <SectionCard
            icon={<Lock size={15} />}
            title="Cambiar contraseña"
            subtitle="Usa una contraseña segura"
          >
            <PasswordForm token={token} />
          </SectionCard>

          {/* Danger */}
          <DangerZone token={token} onDeleted={handleAccountDeleted} />
        </div>
      </div>
    </div>
  );
}
