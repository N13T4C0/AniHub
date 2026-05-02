import Link from "next/link";
import type { MediaBase } from "@/types/media";
import { getTitle, getCover, getTypeLabel, getStatusLabel } from "@/types/media";

interface Props {
  item: MediaBase;
}

export default function MediaCard({ item }: Props) {
  const title = getTitle(item.title);
  const cover = getCover(item.cover_image);
  const typeLabel = getTypeLabel(item);
  const score = item.average_score ? (item.average_score / 10).toFixed(1) : null;

  const accentColor = item.cover_image?.color || "#6C63FF";

  return (
    <Link href={`/media/${item.id}?type=${item.media_type}`} className="group block">
      <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-xl"
           style={{ boxShadow: "0 0 0 0 transparent" }}>

        {/* Cover */}
        <div className="aspect-[2/3] relative overflow-hidden rounded-xl bg-white/5">
          {cover ? (
            <img
              src={cover}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
              Sin imagen
            </div>
          )}

          {/* Gradiente inferior para legibilidad */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Score badge */}
          {score && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs font-bold text-yellow-400 flex items-center gap-0.5">
              ★ {score}
            </div>
          )}

          {/* Status badge — solo si está en emisión */}
          {item.status === "RELEASING" && (
            <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
              Activo
            </div>
          )}

          {/* Tipo en la esquina inferior */}
          <div
            className="absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: `${accentColor}cc` }}
          >
            {typeLabel}
          </div>
        </div>

        {/* Info debajo del cover */}
        <div className="pt-2 pb-1 px-0.5">
          <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-snug group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {item.season_year || "—"}
            {item.episodes && ` · ${item.episodes} eps`}
            {item.chapters && ` · ${item.chapters} caps`}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Skeleton para estado de carga */
export function MediaCardSkeleton() {
  return (
    <div>
      <div className="aspect-[2/3] rounded-xl skeleton" />
      <div className="pt-2 space-y-1.5">
        <div className="h-3.5 rounded skeleton w-4/5" />
        <div className="h-3 rounded skeleton w-2/5" />
      </div>
    </div>
  );
}
