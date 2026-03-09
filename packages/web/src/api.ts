import type { ScoutConfig } from "@miami-listing-scout/shared";
import { DEFAULT_CONFIG } from "@miami-listing-scout/shared";

const API_URL = import.meta.env.VITE_WORKER_API_URL ?? "";
const API_KEY = import.meta.env.VITE_CONFIG_API_KEY ?? "";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

function fallbackConfig(): ScoutConfig {
  const now = new Date().toISOString();
  return {
    id: "default",
    email: "",
    name: "",
    ...DEFAULT_CONFIG,
    createdAt: now,
    updatedAt: now,
  };
}

export interface HealthStatus {
  status: string;
  lastRun: string;
  mockMode?: boolean;
}

function friendlyError(err: unknown): string {
  if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"))) {
    return "Cannot reach the worker API. Is it running?";
  }
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message.replace(/^[^{]*/, ""));
      if (parsed.error) return parsed.error;
    } catch { /* not JSON */ }
    return err.message;
  }
  return "An unexpected error occurred";
}

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchConfig(): Promise<ScoutConfig> {
  try {
    const res = await fetch(`${API_URL}/api/config`, { headers: headers() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, string>;
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    return await res.json();
  } catch {
    console.warn("Failed to fetch config from API, using defaults");
    return fallbackConfig();
  }
}

export async function saveConfig(config: ScoutConfig): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/config`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(config),
    });
  } catch (err) {
    throw new Error(friendlyError(err));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(body.error ?? `Save failed (HTTP ${res.status})`);
  }
}

export async function triggerTestRun(): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/test-run`, {
      method: "POST",
      headers: headers(),
    });
  } catch (err) {
    throw new Error(friendlyError(err));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(body.error ?? `Test run failed (HTTP ${res.status})`);
  }
}
