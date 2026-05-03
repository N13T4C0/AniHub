"use client";

import Link from "next/link";

interface GenreCardProps {
  genre: string;
  label: string;
  accent: string;
  cover: string;
}

export default function GenreCard({ genre, label, accent, cover }: GenreCardProps) {
  return (
    <Link
      href={`/search?genre=${genre}`}
      className="group relative rounded-2xl overflow-hidden border border-white/8"
      style={{ aspectRatio: "1 / 1.15" }}
    >
      {/* Cover image */}
      <img
        src={cover}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
        style={{ filter: "saturate(1.2) brightness(0.8)" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 55%), linear-gradient(135deg, ${accent}55 0%, transparent 60%)`,
        }}
      />

      {/* Name */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <p className="font-display text-[17px] font-bold text-white leading-tight">
          {label}
        </p>
      </div>
    </Link>
  );
}
