// src/utils/TitleManager.ts

import { storageKey } from './buildTarget';

// ─── One Pair Dance ───────────────────────────────────────────
const ONE_PAIR_COUNT_KEY    = storageKey('ach_one_pair_count');
const ONE_PAIR_DANCE_KEY    = storageKey('title_one_pair_dance');
const ONE_PAIR_TARGET       = 1000;

// ─── Two Pair Taeguek ─────────────────────────────────────────
const TWO_PAIR_COUNT_KEY    = storageKey('ach_two_pair_count');
const TWO_PAIR_TAEGUEK_KEY  = storageKey('title_two_pair_taeguek');
const TWO_PAIR_TARGET       = 2000;

// ─── 컬렉션 적용 상태 (별도 키) ───────────────────────────────
// 언락 여부와 적용 여부를 분리: 언락돼 있어도 적용 안 할 수 있음
const ONE_PAIR_DANCE_ACTIVE_KEY    = storageKey('col_one_pair_dance_active');
const TWO_PAIR_TAEGUEK_ACTIVE_KEY  = storageKey('col_two_pair_taeguek_active');

// ─── 공통 유틸 ───────────────────────────────────────────────
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
  // ─── One Pair Dance ─────────────────────────────────────
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
  },
  getOnePairTarget(): number {
    return ONE_PAIR_TARGET;
  },

  // ─── Two Pair Taeguek ────────────────────────────────────
  getTwoPairCount(): number {
    return readNumber(TWO_PAIR_COUNT_KEY, 0);
  },
  isTwoPairTaeguekUnlocked(): boolean {
    return readBool(TWO_PAIR_TAEGUEK_KEY, false);
  },
  incrementTwoPairCount(): { count: number; unlocked: boolean } {
    const next = this.getTwoPairCount() + 1;
    writeNumber(TWO_PAIR_COUNT_KEY, next);
    if (next >= TWO_PAIR_TARGET) {
      writeBool(TWO_PAIR_TAEGUEK_KEY, true);
      return { count: next, unlocked: true };
    }
    return { count: next, unlocked: this.isTwoPairTaeguekUnlocked() };
  },
  ensureTwoPairTaeguekUnlocked(): boolean {
    const unlocked = this.getTwoPairCount() >= TWO_PAIR_TARGET;
    if (unlocked) writeBool(TWO_PAIR_TAEGUEK_KEY, true);
    return this.isTwoPairTaeguekUnlocked();
  },
  getTwoPairTarget(): number {
    return TWO_PAIR_TARGET;
  },

  // ─── 컬렉션 적용 상태 ────────────────────────────────────
  isOnePairDanceActive(): boolean {
    return readBool(ONE_PAIR_DANCE_ACTIVE_KEY, false);
  },
  setOnePairDanceActive(val: boolean): void {
    writeBool(ONE_PAIR_DANCE_ACTIVE_KEY, val);
  },

  isTwoPairTaeguekActive(): boolean {
    return readBool(TWO_PAIR_TAEGUEK_ACTIVE_KEY, false);
  },
  setTwoPairTaeguekActive(val: boolean): void {
    writeBool(TWO_PAIR_TAEGUEK_ACTIVE_KEY, val);
  },
};
