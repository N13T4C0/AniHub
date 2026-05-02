"use client";

import { useEffect, useRef, useState } from "react";

/* Elige aleatoriamente entre lluvia y sakura en cada carga */
type Mode = "rain" | "sakura";

function makeSprite(type: Mode): HTMLCanvasElement {
  const c = document.createElement("canvas");
  if (type === "sakura") {
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.translate(64, 64);

    // Glow base (muy sutil para suavizar bordes).
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 42);
    aura.addColorStop(0, "rgba(255,195,214,0.16)");
    aura.addColorStop(1, "rgba(255,195,214,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    // Flor de cerezo "real": 5 petalos redondeados y un pequeño corte.
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      ctx.save();
      ctx.rotate(a);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(8, -8, 16, -18, 0, -30);
      ctx.bezierCurveTo(-16, -18, -8, -8, 0, 0);

      const petal = ctx.createLinearGradient(0, -2, 0, -30);
      petal.addColorStop(0, "rgba(255,208,224,0.98)");
      petal.addColorStop(0.65, "rgba(255,187,209,0.96)");
      petal.addColorStop(1, "rgba(255,168,198,0.95)");
      ctx.fillStyle = petal;
      ctx.fill();

      // Corte central del petalo para evitar forma de rombo/estrella.
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.ellipse(0, -23, 3.2, 2.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // Borde blanco muy suave para dar volumen.
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // Centro amarillo de la flor.
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,238,173,0.95)";
    ctx.fill();

    // Puntitos del centro.
    ctx.fillStyle = "rgba(255,180,110,0.9)";
    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * 2 * i) / 7;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return c;
}

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>(() => (Math.random() < 0.5 ? "rain" : "sakura"));
  const [showSwitchHint, setShowSwitchHint] = useState(() => Math.random() < 0.65);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let renderer: import("three").WebGLRenderer;
    let animId: number;
    let isDisposed = false;

    async function init() {
      const THREE = await import("three");
      if (isDisposed || !el) return;

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      el!.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        70, window.innerWidth / window.innerHeight, 1, 2000
      );
      camera.position.z = 500;

      const W = 1600, H = 1000, D = 200;

      /* ── RAIN ─────────────────────────────────────────── */
      if (mode === "rain") {
        const COUNT = 140;
        const seg = new Float32Array(COUNT * 2 * 3);
        const spds  = new Float32Array(COUNT);
        const drifts = new Float32Array(COUNT);
        const lengths = new Float32Array(COUNT);

        for (let i = 0; i < COUNT; i++) {
          const x = (Math.random() - 0.5) * W;
          const y = (Math.random() - 0.5) * H;
          const z = (Math.random() - 0.5) * D;
          const len = 10 + Math.random() * 12;
          const o = i * 6;
          seg[o] = x;
          seg[o + 1] = y;
          seg[o + 2] = z;
          seg[o + 3] = x;
          seg[o + 4] = y - len;
          seg[o + 5] = z;
          lengths[i] = len;
          spds[i] = 0.8 + Math.random() * 1.1;
          drifts[i] = (Math.random() - 0.5) * 0.08;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(seg, 3));

        const mat = new THREE.LineBasicMaterial({
          color: new THREE.Color("#c9deef"),
          transparent: true,
          opacity: 0.14,
          depthWrite: false,
        });

        const lines = new THREE.LineSegments(geo, mat);
        lines.rotation.z = -0.2;
        scene.add(lines);

        const buf = geo.attributes.position as import("three").BufferAttribute;

        function animate() {
          animId = requestAnimationFrame(animate);
          for (let i = 0; i < COUNT; i++) {
            const o = i * 6;
            const nextX = (buf.array[o] as number) + drifts[i];
            const nextY = (buf.array[o + 1] as number) - spds[i];

            buf.array[o] = nextX;
            buf.array[o + 1] = nextY;
            buf.array[o + 3] = nextX;
            buf.array[o + 4] = nextY - lengths[i];

            if ((buf.array[o + 4] as number) < -H / 2) {
              const x = (Math.random() - 0.5) * W;
              const y = H / 2 + Math.random() * 80;
              buf.array[o] = x;
              buf.array[o + 1] = y;
              buf.array[o + 3] = x;
              buf.array[o + 4] = y - lengths[i];
            }
          }
          buf.needsUpdate = true;
          renderer.render(scene, camera);
        }
        animate();

      /* ── SAKURA ───────────────────────────────────────── */
      } else {
        const COUNT = 52;
        const posX = new Float32Array(COUNT);
        const posY = new Float32Array(COUNT);
        const posZ = new Float32Array(COUNT);
        const spds = new Float32Array(COUNT);
        const phases = new Float32Array(COUNT);
        const amps = new Float32Array(COUNT);
        const rot = new Float32Array(COUNT);
        const rotSpd = new Float32Array(COUNT);
        const scale = new Float32Array(COUNT);

        for (let i = 0; i < COUNT; i++) {
          posX[i] = (Math.random() - 0.5) * W;
          posY[i] = (Math.random() - 0.5) * H;
          posZ[i] = (Math.random() - 0.5) * D;
          spds[i] = 0.11 + Math.random() * 0.16;
          phases[i] = Math.random() * Math.PI * 2;
          amps[i] = 0.06 + Math.random() * 0.14;
          rot[i] = Math.random() * Math.PI * 2;
          rotSpd[i] = (Math.random() - 0.5) * 0.004;
          scale[i] = 0.75 + Math.random() * 0.45;
        }

        const tex = await new Promise<import("three").Texture>((resolve) => {
          const loader = new THREE.TextureLoader();
          // Si agregas una imagen real en /public/sakura-blossom.png, se usa automaticamente.
          loader.load(
            "/sakura-blossom.png",
            (loaded) => resolve(loaded),
            undefined,
            () => {
              const fallback = new THREE.CanvasTexture(makeSprite("sakura"));
              fallback.needsUpdate = true;
              resolve(fallback);
            }
          );
        });
        const geo = new THREE.PlaneGeometry(22, 22);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
          side: THREE.DoubleSide,
        });

        const flowers = new THREE.InstancedMesh(geo, mat, COUNT);
        scene.add(flowers);

        const dummy = new THREE.Object3D();
        let t = 0;

        function animate() {
          animId = requestAnimationFrame(animate);
          t += 0.007;
          for (let i = 0; i < COUNT; i++) {
            posX[i] += Math.sin(t + phases[i]) * amps[i] * 0.1;
            posY[i] -= spds[i];
            rot[i] += rotSpd[i];

            if (posY[i] < -H / 2) {
              posX[i] = (Math.random() - 0.5) * W;
              posY[i] = H / 2 + Math.random() * 80;
              posZ[i] = (Math.random() - 0.5) * D;
            }

            dummy.position.set(posX[i], posY[i], posZ[i]);
            dummy.rotation.set(0, 0, rot[i]);
            dummy.scale.setScalar(scale[i]);
            dummy.updateMatrix();
            flowers.setMatrixAt(i, dummy.matrix);
          }
          flowers.instanceMatrix.needsUpdate = true;
          renderer.render(scene, camera);
        }
        animate();
      }

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      cleanup?.();
      if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
    };
  }, [mode]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-700"
        style={{
          background:
            mode === "sakura"
              ? "radial-gradient(circle at 20% 15%, rgba(255,182,193,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,105,180,0.03) 0%, transparent 45%), linear-gradient(180deg, rgba(20,12,18,0.95) 0%, rgba(12,9,14,0.99) 100%)"
              : "radial-gradient(circle at 15% 20%, rgba(100,180,255,0.03) 0%, transparent 35%), radial-gradient(circle at 85% 20%, rgba(110,120,255,0.025) 0%, transparent 40%), linear-gradient(180deg, rgba(9,11,18,0.95) 0%, rgba(8,9,14,0.99) 100%)",
        }}
      />
      <div
        ref={mountRef}
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
      />
      {showSwitchHint && (
        <button
          onClick={() => setMode((prev) => (prev === "rain" ? "sakura" : "rain"))}
          className="fixed right-4 bottom-4 z-30 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white/55 backdrop-blur-md transition hover:border-white/25 hover:text-white/85"
        >
          Fondo: {mode === "rain" ? "Lluvia" : "Sakura"}
        </button>
      )}
    </>
  );
}
