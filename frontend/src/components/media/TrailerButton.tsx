"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import TrailerModal from "./TrailerModal";

interface Props {
  trailerUrl: string;
  title: string;
}

export default function TrailerButton({ trailerUrl, title }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 px-4 py-2 text-sm transition-all"
      >
        <Play size={15} fill="currentColor" />
        Ver trailer
      </button>

      {open && (
        <TrailerModal
          trailerUrl={trailerUrl}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
