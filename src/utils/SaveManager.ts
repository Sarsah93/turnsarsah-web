// utils/SaveManager.ts

import { Character } from '../types/Character';
import { Card } from '../types/Card';

interface SaveData {
  stageNum: number;
  currentTurn: number;
  player: Character;
  bot: Character;
  playerHand: Card[];
  timestamp: number;
}

const SAVE_KEY_PREFIX = 'turnsarsah_save_';

export class SaveManager {
  /**
   * 게임 저장
   */
  static saveGame(data: Omit<SaveData, 'timestamp'>, slot: number = 0): void {
    const saveData: SaveData = {
      ...data,
      timestamp: Date.now(),
    };

    const key = `${SAVE_KEY_PREFIX}${slot}`;
    try {
      localStorage.setItem(key, JSON.stringify(saveData));
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

      const saveData = JSON.parse(data) as SaveData;
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
  static getSaveInfo(slot: number): { stage: number; date: string } | null {
    const key = `${SAVE_KEY_PREFIX}${slot}`;
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const saveData = JSON.parse(data) as SaveData;
      return {
        stage: saveData.stageNum,
        date: new Date(saveData.timestamp).toLocaleString(),
      };
    } catch (error) {
      console.error('정보 조회 실패:', error);
      return null;
    }
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
