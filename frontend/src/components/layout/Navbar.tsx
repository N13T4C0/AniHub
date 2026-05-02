"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { List, LogOut, User, Settings } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 relative z-50">
      {/* Gradient backdrop so navbar is readable on any background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

      <Link href="/" className="font-display font-bold text-2xl relative z-10 drop-shadow-lg">
        Ani<span className="text-primary">Hub</span>
      </Link>

      <div className="flex items-center gap-1 relative z-10">
        {[
          { href: "/search",   label: "Explorar" },
          { href: "/season",   label: "Temporada" },
          { href: "/forum",    label: "Foro" },
          { href: "/playlist", label: "Playlist" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8 backdrop-blur-sm"
          >
            {label}
          </Link>
        ))}

        <div className="w-px h-4 bg-white/15 mx-1" />

        {user ? (
          <>
            <Link href="/mi-lista" className="text-sm text-white/70 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8">
              <List size={14} />
              Mi lista
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8"
            >
              <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary">
                {user.username[0].toUpperCase()}
              </div>
              {user.username}
            </Link>
            <Link href="/settings" className="text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/8" title="Configuración">
              <Settings size={15} />
            </Link>
            <button onClick={logout} className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/8" title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8">
              Entrar
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-1.5 px-4 ml-1">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
