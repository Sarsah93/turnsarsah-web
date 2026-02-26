// utils/SaveManager.ts

import { Character } from '../types/Character';
import { Card } from '../types/Card';
import { Difficulty } from '../constants/gameConfig';

export const SAVE_VERSION = 'v2.4.0';
const VERSION_KEY = 'turnsarsah_save_version';

interface SaveData {
  chapterNum: string;
  stageNum: number;
  difficulty: Difficulty;
  currentTurn: number;
  player: Character;
  bot: Character;
  playerHand: (Card | null)[];
  deckState?: {
    cards: Card[];
    jokerProbability: number;
    consecutiveJokers: number;
    consecutiveRoyals: number;
  };
  equippedAltarSkills?: string[];
  pendingTrophies?: string[];
  puzzleTarget?: number;
  // Hidden Scenario
  ch1PerfectCount?: number;
  specialQualify?: boolean;
  ch2PerfectCount?: number;
  ch2SpecialQualify?: boolean;
  timestamp: number;
}

const SAVE_KEY_PREFIX = 'turnsarsah_save_';
const ALTAR_STORAGE_KEY = 'turnsarsah_altar_data';

export class SaveManager {
  /**
   * 버전 체크 및 마이그레이션
   * 저장된 버전이 현재 버전과 다르면 모든 세이브+제단 데이터를 삭제.
   * @returns true if data was wiped (so App can show notification)
   */
  static checkAndMigrateVersion(): boolean {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion === SAVE_VERSION) return false;

      // Version mismatch — wipe all save data and altar data
      this.deleteAllSaves();
      localStorage.removeItem(ALTAR_STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, SAVE_VERSION);
      console.log(`[SaveManager] Version mismatch (${storedVersion} → ${SAVE_VERSION}). All data cleared.`);
      return true;
    } catch (e) {
      console.error('[SaveManager] Version check failed:', e);
      return false;
    }
  }

  /**
   * 게임 저장
   */
  static saveGame(slot: number, data: Omit<SaveData, 'timestamp'>): void {
    // Convert Map to Array for serialization
    const serializedData = {
      ...data,
      player: {
        ...data.player,
        conditions: Array.from(data.player.conditions.entries()),
      },
      bot: {
        ...data.bot,
        conditions: Array.from(data.bot.conditions.entries()),
      },
      equippedAltarSkills: data.equippedAltarSkills || [],
      pendingTrophies: data.pendingTrophies || [],
      deckState: data.deckState,
      timestamp: Date.now(),
    };

    const key = `${SAVE_KEY_PREFIX}${slot}`;
    try {
      localStorage.setItem(key, JSON.stringify(serializedData));
      console.log(`게임이 슬롯 ${slot}에 저장되었습니다.`);
    } catch (error) {
      console.error('저장 실패:', error);
    }
  }

  /**
   * 게임 로드
   */
  static loadGame(slot: number): SaveData | null {
    const key = `${SAVE_KEY_PREFIX}${slot}`;
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsedData = JSON.parse(data);

      // Restore Map from serialized data
      const restoreConditions = (cond: any) => {
        if (Array.isArray(cond)) {
          return new Map(cond);
        } else if (typeof cond === 'object' && cond !== null) {
          return new Map(Object.entries(cond));
        }
        return new Map();
      };

      const saveData: SaveData = {
        ...parsedData,
        player: {
          ...parsedData.player,
          conditions: restoreConditions(parsedData.player.conditions),
        },
        bot: {
          ...parsedData.bot,
          conditions: restoreConditions(parsedData.bot.conditions),
        },
        equippedAltarSkills: parsedData.equippedAltarSkills || [],
        pendingTrophies: parsedData.pendingTrophies || [],
      };

      console.log(`게임이 슬롯 ${slot}에서 로드되었습니다.`);
      return saveData;
    } catch (error) {
      console.error('로드 실패:', error);
      return null;
    }
  }

  /**
   * 저장 데이터 정보 조회
   */
  static getSaveInfo(slot: number): { chapter: string; stage: number; difficulty: Difficulty; date: string } | null {
    const data = this.loadGame(slot);
    if (!data) return null;
    return {
      chapter: data.chapterNum || '1',
      stage: data.stageNum,
      difficulty: data.difficulty,
      date: new Date(data.timestamp).toLocaleString(),
    };
  }

  /**
   * 저장 데이터 삭제
   */
  static deleteSave(slot: number): void {
    const key = `${SAVE_KEY_PREFIX}${slot}`;
    try {
      localStorage.removeItem(key);
      console.log(`슬롯 ${slot}이 삭제되었습니다.`);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  }

  /**
   * 모든 저장 데이터 삭제
   */
  static deleteAllSaves(): void {
    try {
      for (let i = 0; i < 10; i++) {
        const key = `${SAVE_KEY_PREFIX}${i}`;
        localStorage.removeItem(key);
      }
      console.log('모든 저장 데이터가 삭제되었습니다.');
    } catch (error) {
      console.error('전체 삭제 실패:', error);
    }
  }
}
