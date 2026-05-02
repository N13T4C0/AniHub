"use client";

import { useState } from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import type { Character } from "@/types/media";

function CharacterCard({ char }: { char: Character }) {
  const [showVA, setShowVA] = useState(false);
  const name = char.name?.user_preferred || char.name?.full || "Desconocido";
  const image = char.image?.large || char.image?.medium;
  const isMain = char.role === "MAIN";
  const va = char.voice_actors?.[0];

  return (
    <div className="group relative flex-shrink-0 w-28">
      {/* Card */}
      <div className="relative rounded-xl overflow-hidden bg-dark-100 border border-white/5 hover:border-primary/30 transition-all duration-200 cursor-pointer"
           onClick={() => va && setShowVA((v) => !v)}>
        {/* Character image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-dark-200 flex items-center justify-center">
              <Users size={20} className="text-white/20" />
            </div>
          )}
          {/* Role badge */}
          {isMain && (
            <div className="absolute top-1.5 left-1.5 bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              MAIN
            </div>
          )}
          {/* VA overlay */}
          {va && (
            <div className={`absolute bottom-0 left-0 right-0 transition-all duration-200 ${showVA ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <div className="bg-dark/90 backdrop-blur-sm px-2 py-1.5 flex items-center gap-1.5">
                {va.image && (
                  <img src={va.image} alt={va.name || ""} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                )}
                <span className="text-[9px] text-white/70 truncate leading-tight">{va.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="px-2 py-2">
          <p className="text-[11px] font-medium text-white/80 leading-tight line-clamp-2">{name}</p>
          {char.name?.native && (
            <p className="text-[10px] text-white/30 mt-0.5 truncate">{char.name.native}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CharactersSection({ characters }: { characters: Character[] }) {
  const [showAll, setShowAll] = useState(false);

  if (!characters || characters.length === 0) return null;

  const mains = characters.filter((c) => c.role === "MAIN");
  const supporting = characters.filter((c) => c.role !== "MAIN");
  const displayed = showAll ? characters : characters.slice(0, 14);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold text-white">
            Personajes
          </h2>
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            {mains.length} principales · {supporting.length} secundarios
          </span>
        </div>
        {characters.length > 14 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-primary transition-colors"
          >
            {showAll ? (
              <><ChevronUp size={12} /> Mostrar menos</>
            ) : (
              <><ChevronDown size={12} /> Ver los {characters.length}</>
            )}
          </button>
        )}
      </div>

      {/* Main characters row */}
      {mains.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Principales</p>
          <div className="flex gap-3 flex-wrap">
            {mains.map((c) => (
              <CharacterCard key={c.id} char={c} />
            ))}
          </div>
        </div>
      )}

      {/* Supporting — horizontal scroll */}
      {supporting.length > 0 && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Secundarios</p>
          <div className={`${showAll ? "flex flex-wrap gap-3" : "flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10"}`}>
            {(showAll ? supporting : supporting.slice(0, 10)).map((c) => (
              <CharacterCard key={c.id} char={c} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
