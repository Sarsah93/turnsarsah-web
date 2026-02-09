// storage/SaveManager.ts

import { GameData, SlotInfo } from '../types/GameData';

const SAVE_KEY_PREFIX = 'turnsarsah_slot_';

export class SaveManager {
  static save(slot: number, data: GameData): void {
    const key = `${SAVE_KEY_PREFIX}${slot}`;
    localStorage.setItem(key, JSON.stringify({
      ...data,
      date: new Date().toISOString(),
    }));
  }

  static load(slot: number): GameData | null {
    const key = `${SAVE_KEY_PREFIX}${slot}`;
    const json = localStorage.getItem(key);
    if (!json) return null;
    try {
      return JSON.parse(json) as GameData;
    } catch (error) {
      console.error(`Failed to load slot ${slot}:`, error);
      return null;
    }
  }

  static delete(slot: number): void {
    const key = `${SAVE_KEY_PREFIX}${slot}`;
    localStorage.removeItem(key);
  }

  static getSlotInfo(): Record<number, SlotInfo | null> {
    const info: Record<number, SlotInfo | null> = {};
    for (let i = 1; i <= 3; i++) {
      const data = this.load(i);
      if (data) {
        info[i] = {
          stageNum: data.stageNum,
          difficulty: data.difficulty,
          date: data.date,
        };
      } else {
        info[i] = null;
      }
    }
    return info;
  }

  static clearAll(): void {
    for (let i = 1; i <= 3; i++) {
      this.delete(i);
    }
  }
}
