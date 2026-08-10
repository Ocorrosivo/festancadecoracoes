const STORAGE_KEY = "festanca_tracking";

export interface TrackingConfig {
  facebookPixelId: string;
  googleTagId: string;
}

export function getTrackingConfig(): TrackingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore parse errors - return defaults */ }
  return { facebookPixelId: "", googleTagId: "" };
}

export function saveTrackingConfig(config: TrackingConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
