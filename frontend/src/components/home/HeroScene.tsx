"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────
    const W = mount.clientWidth;
    const H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.z = 60;

    // ── Particle geometry ─────────────────────────────────
    const COUNT = 900;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);

    // Palette: primary violet, pink, cyan, white
    const palette = [
      new THREE.Color("#a855f7"), // violet
      new THREE.Color("#ec4899"), // pink
      new THREE.Color("#6366f1"), // indigo
      new THREE.Color("#22d3ee"), // cyan
      new THREE.Color("#ffffff"), // white
    ];

    for (let i = 0; i < COUNT; i++) {
      // Spread across a wide box
      positions[i * 3]     = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));

    // Circular sprite texture (drawn on canvas)
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
    grad.addColorStop(1,   "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(spriteCanvas);

    const mat = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      vertexColors: true,
      map: spriteTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ── Connecting lines (constellation effect) ───────────
    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const CONNECT_DIST = 22;
    const posArr = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = posArr[i*3]   - posArr[j*3];
        const dy = posArr[i*3+1] - posArr[j*3+1];
        const dz = posArr[i*3+2] - posArr[j*3+2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < CONNECT_DIST) {
          linePositions.push(
            posArr[i*3], posArr[i*3+1], posArr[i*3+2],
            posArr[j*3], posArr[j*3+1], posArr[j*3+2],
          );
          const alpha = 1 - dist / CONNECT_DIST;
          lineColors.push(alpha*0.3, alpha*0.1, alpha*0.5);
          lineColors.push(alpha*0.3, alpha*0.1, alpha*0.5);
        }
      }
    }

    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    lineGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(lineColors), 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.4,
    });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Mouse parallax ────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function onMouseMove(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────
    function onResize() {
      const nw = mount!.clientWidth;
      const nh = mount!.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────
    let animId: number;
    let t = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.003;

      // Gentle rotation + mouse parallax
      target.x += (mouse.x * 4 - target.x) * 0.04;
      target.y += (mouse.y * 3 - target.y) * 0.04;

      particles.rotation.y = t * 0.12 + target.x * 0.05;
      particles.rotation.x = Math.sin(t * 0.4) * 0.08 + target.y * 0.03;
      particles.rotation.z = t * 0.04;

      // Subtle breathing scale
      const s = 1 + Math.sin(t * 0.7) * 0.015;
      particles.scale.set(s, s, s);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}
