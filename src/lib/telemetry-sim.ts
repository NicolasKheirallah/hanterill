/**
 * Deterministic drive-cycle signal generator for the live telemetry chart.
 * Given a channel and a time in seconds it returns a believable value: a base
 * level, a few sine components, a repeating drive-cycle envelope and bounded,
 * seeded noise. Same input always gives the same output, so replay is stable.
 */

export type ChannelId = "pack_v" | "pack_a" | "batt_t" | "inv_t" | "motor_nm" | "lv_v";

export type Channel = {
  id: ChannelId;
  label: string;
  unit: string;
  min: number;
  max: number;
  decimals: number;
};

export const channels: Channel[] = [
  { id: "pack_v", label: "Pack voltage", unit: "V", min: 360, max: 410, decimals: 1 },
  { id: "pack_a", label: "Pack current", unit: "A", min: -220, max: 260, decimals: 1 },
  { id: "batt_t", label: "Battery temperature", unit: "°C", min: 12, max: 44, decimals: 1 },
  { id: "inv_t", label: "Inverter temperature", unit: "°C", min: 14, max: 78, decimals: 1 },
  { id: "motor_nm", label: "Motor torque", unit: "N·m", min: -120, max: 330, decimals: 0 },
  { id: "lv_v", label: "12 V rail", unit: "V", min: 11.5, max: 14.8, decimals: 2 },
];

export const defaultChannels: ChannelId[] = ["pack_v", "batt_t"];

// A repeating 40 s drive cycle: cruise, accel, regen, hold.
function drivePhase(t: number): number {
  const x = t % 40;
  if (x < 10) return 0.15; // cruise
  if (x < 16) return 0.95; // acceleration
  if (x < 22) return -0.7; // regen / lift
  if (x < 30) return 0.35; // moderate load
  return -0.1; // coast
}

function noise(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 2;
}

export function sample(id: ChannelId, t: number): number {
  const d = drivePhase(t);
  switch (id) {
    case "pack_v":
      return 398.6 - d * 9 + Math.sin(t * 0.6) * 0.8 + noise(t * 7.1) * 0.4;
    case "pack_a":
      return d * 180 + Math.sin(t * 0.9) * 6 + noise(t * 5.3) * 4;
    case "batt_t":
      return 23 + Math.abs(d) * 3 + Math.sin(t * 0.05) * 1.5 + noise(t * 0.7) * 0.15;
    case "inv_t":
      return 34 + Math.abs(d) * 9 + Math.sin(t * 0.12) * 2 + noise(t * 0.9) * 0.3;
    case "motor_nm":
      return Math.max(-120, d * 300 + Math.sin(t * 1.4) * 8 + noise(t * 9.2) * 6);
    case "lv_v":
      return 14.2 - Math.abs(d) * 0.25 + Math.sin(t * 0.3) * 0.05 + noise(t * 3.1) * 0.03;
  }
}

export function channelById(id: ChannelId): Channel {
  return channels.find((c) => c.id === id)!;
}
