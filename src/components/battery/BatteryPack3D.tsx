"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { batteryDemo, moduleStats } from "@/lib/demo-data";
import { useModuleSelection } from "./selection-context";

type Mode = "deviation" | "temperature";

const COLS = 9;
const ROWS = 3;
const GAP = 0.16;
const W = 0.9;
const D = 0.9;
const REST_H = 0.44;
const SEL_SCALE = 1.5; // selected module stands ~50% taller
const TRAY_TOP = 0.04;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Ink-and-bronze only. Cool graphite / steel at the calm end, one bronze at the
// hot end - the site's single accent, nothing olive or clay.
const GRAPHITE = new THREE.Color("#3b4048");
const STEEL = new THREE.Color("#586a77");
const BRONZE = new THREE.Color("#c9906f");
const _c = new THREE.Color();

function targetColor(mode: Mode, m: number): THREE.Color {
  const s = moduleStats(m);
  if (mode === "temperature") {
    const tn = clamp01(
      (s.temp - batteryDemo.tempMin) / (batteryDemo.tempMax - batteryDemo.tempMin || 1),
    );
    return _c.copy(STEEL).lerp(BRONZE, tn).clone();
  }
  return _c.copy(GRAPHITE).lerp(BRONZE, clamp01(s.delta / 12)).clone();
}

type Cell = { m: number; x: number; z: number; delay: number; color: THREE.Color };

function Modules({
  mode,
  active,
  selected,
  onSelect,
  onHover,
}: {
  mode: Mode;
  active: boolean;
  selected: number | null;
  onSelect: (m: number | null) => void;
  onHover: (m: number | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const reduce = useReducedMotion();
  const invalidate = useThree((s) => s.invalidate);
  const start = useRef<number | null>(null);

  // Kick the demand loop whenever something needs to be re-drawn: the section
  // comes back on screen, the colour mode changes, or the selection moves.
  useEffect(() => {
    if (active) invalidate();
  }, [active, mode, selected, invalidate]);

  // Bottom-origin box: scaling y raises the module off the tray, it never grows
  // down into it.
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(W, REST_H, D);
    g.translate(0, REST_H / 2, 0);
    return g;
  }, []);

  const cells = useMemo<Cell[]>(
    () =>
      Array.from({ length: batteryDemo.modules }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return {
          m: i + 1,
          x: (col - (COLS - 1) / 2) * (W + GAP),
          z: (row - (ROWS - 1) / 2) * (D + GAP),
          delay: col * 0.045 + row * 0.09,
          color: targetColor(mode, i + 1),
        };
      }),
    [mode],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    if (start.current == null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;
    const d = Math.min(dt, 0.05);
    let busy = false;

    // One-shot intro: the pack turns to rest from a slight angle. No perpetual
    // spin - once it settles the scene is still until the pointer moves it.
    if (!reduce) {
      const introTarget = 0;
      const from = -0.5;
      const p = clamp01(t / 0.9);
      const eased = 1 - Math.pow(1 - p, 3);
      const rot = from + (introTarget - from) * eased;
      if (Math.abs(g.rotation.y - rot) > 0.0002) {
        g.rotation.y = rot;
        busy = busy || p < 1;
      }
    } else {
      g.rotation.y = 0;
    }

    for (let i = 0; i < cells.length; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      const c = cells[i];
      const isSel = selected === c.m;

      // intro rise (staggered), then selection scale
      const introS = reduce ? 1 : clamp01((t - c.delay) / 0.5);
      const introEased = introS * introS * (3 - 2 * introS);
      const targetScale = introEased * (isSel ? SEL_SCALE : 1);
      mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, targetScale, 14, d);
      if (Math.abs(mesh.scale.y - targetScale) > 0.001) busy = true;

      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      const tint = isSel ? _c.copy(c.color).lerp(BRONZE, 0.35) : c.color;
      const cd =
        Math.abs(mat.color.r - tint.r) +
        Math.abs(mat.color.g - tint.g) +
        Math.abs(mat.color.b - tint.b);
      if (cd > 0.004) {
        mat.color.lerp(tint, 1 - Math.pow(0.0015, d));
        busy = true;
      } else {
        mat.color.copy(tint);
      }
      const emT = isSel ? 0.18 : 0;
      mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, emT, 12, d);
      if (Math.abs(mat.emissiveIntensity - emT) > 0.002) busy = true;
    }

    if (busy && active) invalidate();
  });

  return (
    <group ref={group}>
      {cells.map((c, i) => (
        <mesh
          key={c.m}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geo}
          position={[c.x, TRAY_TOP, c.z]}
          scale={[1, 0, 1]}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(c.m);
            invalidate();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            onHover(null);
            invalidate();
            document.body.style.cursor = "";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selected === c.m ? null : c.m);
            invalidate();
          }}
        >
          <meshPhysicalMaterial
            color={c.color}
            roughness={0.5}
            metalness={0.28}
            clearcoat={0.4}
            clearcoatRoughness={0.5}
            envMapIntensity={0.6}
            emissive={BRONZE}
            emissiveIntensity={0}
          />
        </mesh>
      ))}
      {/* Tray */}
      <mesh position={[0, TRAY_TOP - 0.08, 0]} receiveShadow>
        <boxGeometry args={[COLS * (W + GAP) + 0.3, 0.14, ROWS * (D + GAP) + 0.3]} />
        <meshStandardMaterial color="#1b1e24" roughness={0.92} metalness={0.1} envMapIntensity={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Studio lighting without an HDRI file: three soft area lights as scene
 * geometry - a key above and in front, a broad fill to the left, a low rim
 * behind. Each module gets a gradient across its faces and a specular edge,
 * which reads as "photographed" rather than "flat shaded". Rendered once.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={["#12151a"]} />
      <Lightformer intensity={2.4} position={[2.5, 5, 4]} scale={[8, 5, 1]} color="#fdfaf3" />
      <Lightformer intensity={1.1} position={[-6, 2.5, 1]} scale={[6, 8, 1]} color="#e8ecf2" />
      <Lightformer
        intensity={1.3}
        position={[0, 1.2, -6]}
        rotation={[0, Math.PI, 0]}
        scale={[10, 3, 1]}
        color="#cfd4da"
      />
    </Environment>
  );
}

export function BatteryPack3D({
  mode,
  active = true,
  hint,
}: {
  mode: Mode;
  active?: boolean;
  hint: string;
}) {
  const t = useTranslations("battery");
  // Shared with the 2D potential matrix on /features/battery-health.
  const { module: selected, setModule: setSelected } = useModuleSelection();
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? selected;
  const s = shown ? moduleStats(shown) : null;

  return (
    <div className="relative h-72 w-full sm:h-80">
      <Canvas
        camera={{ position: [6.5, 5.5, 7], fov: 42 }}
        dpr={[1, 1.6]}
        // Demand-only while on screen: the scene paints during the intro, on
        // hover/select, and while the user drags the camera. Otherwise it is
        // still - no perpetual repaint, no decorative spin - and fully halted
        // ("never") once the section scrolls away.
        frameloop={active ? "demand" : "never"}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onPointerMissed={() => setSelected(null)}
      >
        <ambientLight intensity={0.22} />
        <StudioEnvironment />
        <Modules
          mode={mode}
          active={active}
          selected={selected}
          onSelect={setSelected}
          onHover={setHover}
        />
        <ContactShadows
          position={[0, TRAY_TOP - 0.16, 0]}
          opacity={0.42}
          scale={15}
          blur={2.9}
          resolution={512}
          far={4}
          color="#0c0e12"
        />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>

      {s ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-sm border border-line-strong bg-surface/95 px-2.5 py-2 font-mono text-[11px]">
          <div className="uppercase tracking-wider text-text-muted">
            {t("moduleN", { module: s.module })}
          </div>
          <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-text-secondary">
            <span>{t("average")}</span>
            <span className="tnum text-right text-text-primary">{s.avg.toFixed(3)} V</span>
            <span>{t("delta")}</span>
            <span className="tnum text-right text-text-primary">{s.delta} mV</span>
            <span>{t("temperature")}</span>
            <span className="tnum text-right text-text-primary">{s.temp.toFixed(1)} °C</span>
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-text-muted">
        {hint}
      </div>
    </div>
  );
}
