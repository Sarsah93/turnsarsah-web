// utils/buildTarget.ts
// Build target separation: steam vs web-internal
// Controlled by Vite environment variables (see .env.steam / .env.internal)

// --- Build Target Constants ---
export const BUILD_TARGET = import.meta.env.VITE_BUILD_TARGET || 'web-internal';
export const IS_STEAM = BUILD_TARGET === 'steam';
export const IS_INTERNAL = BUILD_TARGET === 'web-internal';

// --- Feature Flags ---
export const ENABLE_PWA = import.meta.env.VITE_ENABLE_PWA === 'true';
export const INTERNAL_FEATURES = import.meta.env.VITE_INTERNAL_FEATURES === 'true';

// --- Storage Namespace ---
// Prevents data collision between steam and internal builds
// Steam:    turnsarsah_steam_
// Internal: turnsarsah_internal_
const TARGET_SUFFIX = IS_STEAM ? 'steam' : 'internal';
export const STORAGE_PREFIX = `turnsarsah_${TARGET_SUFFIX}_`;

// --- Helper: build a target-scoped localStorage key ---
export function storageKey(base: string): string {
  return `${STORAGE_PREFIX}${base}`;
}
