"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { batteryDemo, moduleStats } from "@/lib/demo-data";

type Mode = "deviation" | "temperature";

const COLS = 9;
const ROWS = 3;
const GAP = 0.16;
const W = 0.9;
const D = 0.9;

function colorFor(mode: Mode, m: number): THREE.Color {
  const s = moduleStats(m);
  if (mode === "temperature") {
    const tn = (s.temp - batteryDemo.tempMin) / (batteryDemo.tempMax - batteryDemo.tempMin || 1);
    return new THREE.Color().lerpColors(
      new THREE.Color("#6b6b66"),
      new THREE.Color("#b06a3a"),
      Math.max(0, Math.min(1, tn)),
    );
  }
  const dn = Math.min(1, s.delta / 12);
  return new THREE.Color().lerpColors(new THREE.Color("#7a7a74"), new THREE.Color("#8a6b28"), dn);
}

/**
 * Studio lighting without an HDRI file: three soft area lights as scene
 * geometry. A key above and in front, a broad fill to the left, a low rim
 * behind. This gives each module a gradient across its faces and a specular
 * edge, which is what reads as "photographed" rather than "flat shaded".
 * Rendered once (frames default) so it costs nothing per frame.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={["#111111"]} />
      <Lightformer intensity={2.6} position={[2.5, 5, 4]} scale={[8, 5, 1]} color="#fdfaf3" />
      <Lightformer intensity={1.1} position={[-6, 2.5, 1]} scale={[6, 8, 1]} color="#e8ecf2" />
      <Lightformer
        intensity={1.4}
        position={[0, 1.2, -6]}
        rotation={[0, Math.PI, 0]}
        scale={[10, 3, 1]}
        color="#cfd4da"
      />
    </Environment>
  );
}

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
  const reduce = useReducedMotion();

  useFrame((_, dt) => {
    if (!group.current || reduce || !active) return;
    group.current.rotation.y += dt * 0.12;
  });

  const cells = useMemo(
    () =>
      Array.from({ length: batteryDemo.modules }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = (col - (COLS - 1) / 2) * (W + GAP);
        const z = (row - (ROWS - 1) / 2) * (D + GAP);
        return { m: i + 1, x, z, color: colorFor(mode, i + 1) };
      }),
    [mode],
  );

  return (
    <group ref={group}>
      {cells.map((c) => {
        const isSel = selected === c.m;
        return (
          <mesh
            key={c.m}
            position={[c.x, isSel ? 0.5 : 0.28, c.z]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onHover(c.m);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              onHover(null);
              document.body.style.cursor = "";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(isSel ? null : c.m);
            }}
          >
            <boxGeometry args={[W, isSel ? 0.62 : 0.44, D]} />
            <meshPhysicalMaterial
              color={c.color}
              roughness={0.62}
              metalness={0.12}
              clearcoat={isSel ? 0.5 : 0.32}
              clearcoatRoughness={0.55}
              envMapIntensity={isSel ? 0.85 : 0.55}
              emissive={isSel ? "#3557e0" : "#000000"}
              emissiveIntensity={isSel ? 0.16 : 0}
            />
          </mesh>
        );
      })}
      {/* Tray */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[COLS * (W + GAP) + 0.3, 0.12, ROWS * (D + GAP) + 0.3]} />
        <meshStandardMaterial color="#302f2c" roughness={0.95} metalness={0.05} envMapIntensity={0.25} />
      </mesh>
    </group>
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
  const reduce = useReducedMotion();
  const t = useTranslations("battery");
  const [selected, setSelected] = useState<number | null>(14);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? selected;
  const s = shown ? moduleStats(shown) : null;

  return (
    <div className="relative h-72 w-full sm:h-80">
      <Canvas
        camera={{ position: [6.5, 5.5, 7], fov: 42 }}
        dpr={[1, 1.6]}
        frameloop={reduce || !active ? "demand" : "always"}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onPointerMissed={() => setSelected(null)}
      >
        <color attach="background" args={["#00000000"]} />
        <ambientLight intensity={0.25} />
        <StudioEnvironment />
        <Modules mode={mode} active={active} selected={selected} onSelect={setSelected} onHover={setHover} />
        <ContactShadows
          position={[0, -0.09, 0]}
          opacity={0.4}
          scale={15}
          blur={2.9}
          resolution={512}
          far={4}
          color="#181713"
        />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>

      {s ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-sm border border-line-strong bg-surface/95 px-2.5 py-1.5 font-mono text-[11px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <div className="text-text-primary">{t("moduleN", { module: s.module })}</div>
          <div className="text-text-secondary">
            {s.avg.toFixed(3)} V · Δ {s.delta} mV · {s.temp.toFixed(1)} °C
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-text-muted">
        {hint}
      </div>
    </div>
  );
}
