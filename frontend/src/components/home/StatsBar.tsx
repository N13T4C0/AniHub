"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 21000, label: "Títulos de anime",   suffix: "+", color: "#6C63FF" },
  { value: 95000, label: "Manga y manhwa",      suffix: "+", color: "#FF5E9F" },
  { value: 12,    label: "Temporadas activas",  suffix: "",  color: "#4ade80" },
  { value: 100,   label: "Géneros disponibles", suffix: "+", color: "#facc15" },
];

function Counter({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1600;
        const start = performance.now();
        function tick(now: number) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const display = val >= 1000 ? `${Math.round(val / 1000)}K` : String(val);

  return (
    <span ref={ref} className="font-display text-[32px] font-black leading-none" style={{ color }}>
      {display}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "linear-gradient(to right, transparent, rgba(108,99,255,0.03), transparent)",
    }}>
      <div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5">
            <Counter target={s.value} suffix={s.suffix} color={s.color} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
