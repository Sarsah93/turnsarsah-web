// utils/SaveManager.ts

import { Character } from '../types/Character';
import { Card } from '../types/Card';
import { Difficulty } from '../constants/gameConfig';

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
  puzzleTarget?: number;
  timestamp: number;
}

const SAVE_KEY_PREFIX = 'turnsarsah_save_';

export class SaveManager {
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
      // Handle legacy saves (where conditions might be {}) or new saves (Array)
      const restoreConditions = (cond: any) => {
        if (Array.isArray(cond)) {
          return new Map(cond);
        } else if (typeof cond === 'object' && cond !== null) {
          return new Map(Object.entries(cond)); // Initial simple object support
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
