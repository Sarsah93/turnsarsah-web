// types/GameData.ts

import { Card } from './Card';
import { Character } from './Character';
import { Difficulty } from '../constants/gameConfig';

export interface GameData {
  stageNum: number;
  difficulty: Difficulty;
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
  difficulty: Difficulty;
  date: string;
}
