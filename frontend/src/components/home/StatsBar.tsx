"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 21000, label: "Títulos de anime",   suffix: "+", color: "#6C63FF", glow: "rgba(108,99,255,0.25)" },
  { value: 95000, label: "Manga y manhwa",      suffix: "+", color: "#FF5E9F", glow: "rgba(255,94,159,0.25)" },
  { value: 12,    label: "Temporadas activas",  suffix: "",  color: "#4ade80", glow: "rgba(74,222,128,0.25)" },
  { value: 100,   label: "Géneros disponibles", suffix: "+", color: "#facc15", glow: "rgba(250,204,21,0.25)"  },
];

function Counter({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Threshold bajo para que dispare aunque el elemento sea delgado
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        function tick(now: number) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const display = val >= 1000 ? `${Math.round(val / 1000)}K` : String(val);

  return (
    <span
      ref={ref}
      className="font-display font-black leading-none tabular-nums"
      style={{ color, fontSize: 38, textShadow: `0 0 24px ${color}60` }}
    >
      {display}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <div style={{
      background: "linear-gradient(to bottom, rgba(14,14,24,0.95), rgba(10,10,18,0.98))",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-2 py-2"
            style={{
              borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <Counter target={s.value} suffix={s.suffix} color={s.color} />
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
