// src/utils/TitleManager.ts

import { storageKey } from './buildTarget';

const ONE_PAIR_COUNT_KEY = storageKey('ach_one_pair_count');
const ONE_PAIR_DANCE_KEY = storageKey('title_one_pair_dance');
const ONE_PAIR_TARGET = 1000;

const readNumber = (key: string, fallback = 0): number => {
  try {
    const raw = localStorage.getItem(key);
    const val = raw ? Number(raw) : fallback;
    return Number.isFinite(val) ? val : fallback;
  } catch {
    return fallback;
  }
};

const writeNumber = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
};

const readBool = (key: string, fallback = false): boolean => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch {
    return fallback;
  }
};

const writeBool = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, value ? 'true' : 'false');
  } catch {
    // ignore
  }
};

export const TitleManager = {
  getOnePairCount(): number {
    return readNumber(ONE_PAIR_COUNT_KEY, 0);
  },
  isOnePairDanceUnlocked(): boolean {
    return readBool(ONE_PAIR_DANCE_KEY, false);
  },
  incrementOnePairCount(): { count: number; unlocked: boolean } {
    const next = this.getOnePairCount() + 1;
    writeNumber(ONE_PAIR_COUNT_KEY, next);
    if (next >= ONE_PAIR_TARGET) {
      writeBool(ONE_PAIR_DANCE_KEY, true);
      return { count: next, unlocked: true };
    }
    return { count: next, unlocked: this.isOnePairDanceUnlocked() };
  },
  ensureOnePairDanceUnlocked(): boolean {
    const unlocked = this.getOnePairCount() >= ONE_PAIR_TARGET;
    if (unlocked) writeBool(ONE_PAIR_DANCE_KEY, true);
    return this.isOnePairDanceUnlocked();
  }
};
