// types/GameData.ts

import { Card } from './Card';
import { Character } from './Character';

export interface GameData {
  stageNum: number;
  playerHp: number;
  playerMaxHp: number;
  botHp: number;
  botMaxHp: number;
  playerHand: Card[];
  selectedCards: Card[];
  date: string;
  turn: number;
}

export interface SlotInfo {
  stageNum: number;
  date: string;
}
