"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 21000, label: "Títulos de anime",  suffix: "+", color: "text-primary" },
  { value: 95000, label: "Manga y manhwa",    suffix: "+", color: "text-pink-400" },
  { value: 12,    label: "Temporadas activas",suffix: "",  color: "text-green-400" },
  { value: 100,   label: "Géneros",           suffix: "+", color: "text-yellow-400" },
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
        const duration = 1800;
        const start = performance.now();
        function tick(now: number) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
          setVal(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const display = val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 0)}K` : String(val);

  return (
    <span ref={ref} className={`text-3xl font-black font-display ${color}`}>
      {display}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <div className="border-y border-white/5 bg-dark-100/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <Counter target={s.value} suffix={s.suffix} color={s.color} />
            <p className="text-white/40 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
