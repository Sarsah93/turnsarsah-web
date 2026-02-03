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
