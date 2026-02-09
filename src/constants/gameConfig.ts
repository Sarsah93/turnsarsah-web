// constants/gameConfig.ts

export const SCREEN_WIDTH = 1280;
export const SCREEN_HEIGHT = 720;
export const FPS = 60;

export enum GameState {
  MENU = 'MENU',
  BATTLE = 'BATTLE',
  PAUSE = 'PAUSE',
  VICTORY = 'VICTORY',
  GAMEOVER = 'GAMEOVER',
  LOAD = 'LOAD',
}

export enum PauseSubstate {
  MAIN = 'MAIN',
  SAVE = 'SAVE',
  SETTINGS = 'SETTINGS',
  LOAD = 'LOAD',
  QUIT_CONFIRM = 'QUIT_CONFIRM',
  DELETE_CONFIRM = 'DELETE_CONFIRM',
}

// Difficulty System
export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  HELL = 'HELL',
}

// Difficulty-Specific Configurations
export interface DifficultyConfig {
  playerHp: number;
  swapCount: number;
  jokerProbability: number;
  criticalChancePerCard: number; // Per A or Joker
  criticalMultiplier: number;
  avoidChance: number;
  clearHpBonus: number;
  stage6MaxHpBonus: number; // Percentage (e.g., 0.2 = 20%)
  poisonDamageBase: number; // Base damage for poison (increases by 5 each turn)
  regenPercent: number; // Boss regen percent (e.g., 0.05 = 5%)
  // Status probabilities (per stage)
  bleedProbStage1to4: number;
  bleedProbStage7: number;
  poisonProbStage5: number;
  paralyzeProbStage7: number;
  // Boss stats overrides per stage (HP, ATK)
  bossOverrides: Record<number, { hp?: number; atk?: number; damageReduction?: number }>;
  // Stage-specific rules
  stage9HasRegen: boolean;
  stage10RuleCount: number; // 1 for most, 2 for HELL
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: {
    playerHp: 240,
    swapCount: 3,
    jokerProbability: 0.08,
    criticalChancePerCard: 0.15,
    criticalMultiplier: 1.5,
    avoidChance: 0.05,
    clearHpBonus: 50,
    stage6MaxHpBonus: 0.2,
    poisonDamageBase: 5,
    regenPercent: 0.05,
    bleedProbStage1to4: 0.2,
    bleedProbStage7: 0.3,
    poisonProbStage5: 0.3,
    paralyzeProbStage7: 0.2,
    bossOverrides: {
      8: { atk: 30 },
      10: { hp: 380 },
    },
    stage9HasRegen: false,
    stage10RuleCount: 1,
  },
  [Difficulty.NORMAL]: {
    playerHp: 200,
    swapCount: 2,
    jokerProbability: 0.05,
    criticalChancePerCard: 0.1,
    criticalMultiplier: 1.25,
    avoidChance: 0.05,
    clearHpBonus: 50,
    stage6MaxHpBonus: 0.2,
    poisonDamageBase: 5,
    regenPercent: 0.05,
    bleedProbStage1to4: 0.4,
    bleedProbStage7: 0.3,
    poisonProbStage5: 0.5,
    paralyzeProbStage7: 0.35,
    bossOverrides: {
      9: { /* stage9HasRegen handles this */ },
      10: { atk: 20, damageReduction: 20 },
    },
    stage9HasRegen: true,
    stage10RuleCount: 1,
  },
  [Difficulty.HARD]: {
    playerHp: 180,
    swapCount: 2,
    jokerProbability: 0.03,
    criticalChancePerCard: 0.08,
    criticalMultiplier: 1.2,
    avoidChance: 0.03,
    clearHpBonus: 35,
    stage6MaxHpBonus: 0.1,
    poisonDamageBase: 10,
    regenPercent: 0.08,
    bleedProbStage1to4: 0.4,
    bleedProbStage7: 0.3,
    poisonProbStage5: 0.5,
    paralyzeProbStage7: 0.2,
    bossOverrides: {
      1: { hp: 170, atk: 15 },
      2: { hp: 220, atk: 20 },
      3: { hp: 270, atk: 25 },
      4: { hp: 270, atk: 25 },
      5: { hp: 320, atk: 15 },
      6: { atk: 15 },
      7: { hp: 320, atk: 20 },
      8: { hp: 370, atk: 50 },
      9: { hp: 370, atk: 10 },
      10: { hp: 420, atk: 25, damageReduction: 20 },
    },
    stage9HasRegen: true,
    stage10RuleCount: 1,
  },
  [Difficulty.HELL]: {
    playerHp: 180,
    swapCount: 1,
    jokerProbability: 0.03,
    criticalChancePerCard: 0.05,
    criticalMultiplier: 1.2,
    avoidChance: 0, // No avoiding in HELL
    clearHpBonus: 35,
    stage6MaxHpBonus: 0.1,
    poisonDamageBase: 10,
    regenPercent: 0.08,
    bleedProbStage1to4: 0.4,
    bleedProbStage7: 0.3,
    poisonProbStage5: 0.5,
    paralyzeProbStage7: 0.2,
    bossOverrides: {
      1: { hp: 200, atk: 15 },
      2: { hp: 250, atk: 20 },
      3: { hp: 300, atk: 25 },
      4: { hp: 300, atk: 25 },
      5: { hp: 350, atk: 15 },
      6: { atk: 15 },
      7: { hp: 350, atk: 20 },
      8: { hp: 400, atk: 50, damageReduction: 15 },
      9: { hp: 400, atk: 10, damageReduction: 15 },
      10: { hp: 450, atk: 25, damageReduction: 30 },
    },
    stage9HasRegen: true,
    stage10RuleCount: 2,
  },
};

// Game Rules
export const INITIAL_PLAYER_HP = 200;
export const MAX_HAND_SIZE = 8;
export const MAX_SELECTION = 5;
export const SAVE_SLOTS = 3;

// Combat Constants
export const CRITICAL_DAMAGE_BONUS = 0.25; // 25% additional damage
export const BLEED_DAMAGE = 5;
export const BLEED_DURATION = 6; // User requested 6 turns
export const BLEED_INTERVAL = 1; // Usually every turn

// Condition Constants
export const CONDITION_REMOVAL_CHANCE = 0.20;
export const AVOID_CHANCE = 0.05;

export const HEAVY_BLEED_DAMAGE = 15;
export const HEAVY_BLEED_DURATION = 6; // Table says 6
export const POISON_DAMAGE = 10;
export const POISON_DURATION = 3; // User requested 3 turns
export const DEBILITATING_DURATION = 3;
export const DEBILITATING_HP_REDUCTION = 0.20;
export const PARALYSIS_DURATION = 2;
export const IMMUNE_DURATION = 3;
export const REGEN_DURATION = 5;

// Difficulty Unlock Persistence Key
export const UNLOCKED_DIFFICULTIES_KEY = 'turnsarsah_unlocked_difficulties';
