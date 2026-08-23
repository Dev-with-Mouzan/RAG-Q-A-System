import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ragflow_settings";

export const DEFAULT_SETTINGS = {
  model: "gpt-4o",
  embeddingModel: "text-embedding-3-small",
  apiKey: "",
};

let listeners = new Set();
let cached = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // provider is fixed to OpenAI; ignore any legacy stored provider value
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_SETTINGS,
      apiKey: parsed.apiKey || "",
      model: parsed.model || DEFAULT_SETTINGS.model,
      embeddingModel: parsed.embeddingModel || DEFAULT_SETTINGS.embeddingModel,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return cached;
}

export function saveSettings(next) {
  cached = { ...DEFAULT_SETTINGS, ...next };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  emit();
  return cached;
}

export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  cached = { ...DEFAULT_SETTINGS };
  emit();
  return cached;
}

export function isConfigured(s) {
  return Boolean((s || cached).apiKey?.trim());
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot);
  return { settings, configured: isConfigured(settings) };
}
