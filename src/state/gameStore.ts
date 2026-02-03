// state/gameStore.ts

import { create } from 'zustand';
import { Card } from '../types/Card';
import { Character } from '../types/Character';
import { GameState } from '../constants/gameConfig';
import { Deck } from '../logic/Deck';
import { STAGES } from '../constants/stages';
import { applyCondition, clearConditions } from '../logic/conditions';
import { SaveManager } from '../utils/SaveManager';

interface GameStoreState {
  // Game Flow
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Current Stage
  stageNum: number;
  setStageNum: (stage: number) => void;
  currentTurn: number;
  setCurrentTurn: (turn: number) => void;

  // Entities
  player: Character;
  bot: Character;
  setPlayer: (player: Character) => void;
  setBot: (bot: Character) => void;

  // Character health
  setPlayerHp: (hp: number) => void;
  setBotHp: (hp: number) => void;
  setPlayerMaxHp: (maxHp: number) => void;
  setBotMaxHp: (maxHp: number) => void;

  // Conditions
  addPlayerCondition: (name: string, duration: number, desc?: string, data?: unknown) => void;
  removePlayerCondition: (name: string) => void;
  clearPlayerConditions: () => void;

  // New actions
  setDrawsRemaining: (draws: number) => void;
  setBotActiveRules: (rules: [string, unknown][]) => void;

  addBotCondition: (name: string, duration: number, desc?: string, data?: unknown) => void;
  removeBotCondition: (name: string) => void;
  clearBotConditions: () => void;

  // Combat
  playerHand: Card[];
  deck: Deck;
  setPlayerHand: (hand: Card[]) => void;
  removePlayerCards: (indices: number[]) => void;
  drawCards: (count: number) => void;
  swapCards: (indices: number[]) => void;
  setDeck: (deck: Deck) => void;

  // UI
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  message: string;
  setMessage: (message: string) => void;

  // Game initialization
  initGame: (stageId: number) => void;
  resetGame: () => void;

  // Save/Load
  saveGame: () => void;
  loadGame: (slot: number) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Game Flow
  gameState: GameState.MENU,
  setGameState: (gameState) => set({ gameState }),

  // Stage
  stageNum: 1,
  setStageNum: (stageNum) => set({ stageNum }),
  currentTurn: 0,
  setCurrentTurn: (currentTurn) => set({ currentTurn }),

  // Entities
  // Entities
  player: {
    name: 'Player',
    maxHp: 200,
    hp: 200,
    atk: 10,
    level: 1,
    conditions: new Map(),
    drawsRemaining: 2,
    baseMaxHp: 200,
  },
  bot: {
    name: 'Bot',
    maxHp: 150,
    hp: 150,
    atk: 10,
    level: 1,
    conditions: new Map(),
    activeRules: [],
  },
  setPlayer: (player) => set({ player }),
  setBot: (bot) => set({ bot }),

  // Specific Setters for new fields
  setDrawsRemaining: (draws: number) =>
    set((state) => ({ player: { ...state.player, drawsRemaining: draws } })),

  setBotActiveRules: (rules: [string, unknown][]) =>
    set((state) => ({ bot: { ...state.bot, activeRules: rules } })),

  // Health
  setPlayerHp: (hp) =>
    set((state) => ({
      player: { ...state.player, hp: Math.max(0, Math.min(hp, state.player.maxHp)) },
    })),
  setBotHp: (hp) =>
    set((state) => ({
      bot: { ...state.bot, hp: Math.max(0, Math.min(hp, state.bot.maxHp)) },
    })),
  setPlayerMaxHp: (maxHp) =>
    set((state) => ({
      player: {
        ...state.player,
        maxHp,
        hp: Math.min(state.player.hp, maxHp),
        baseMaxHp: state.player.baseMaxHp || maxHp
      },
    })),
  setBotMaxHp: (maxHp) =>
    set((state) => ({
      bot: { ...state.bot, maxHp, hp: Math.min(state.bot.hp, maxHp) },
    })),

  // Player Conditions
  addPlayerCondition: (name, duration, desc, data) =>
    set((state) => {
      const newConditions = new Map(state.player.conditions);
      applyCondition(newConditions, name, duration, desc, data);
      return {
        player: { ...state.player, conditions: newConditions },
      };
    }),
  removePlayerCondition: (name) =>
    set((state) => {
      const newConditions = new Map(state.player.conditions);
      newConditions.delete(name);
      return {
        player: { ...state.player, conditions: newConditions },
      };
    }),
  clearPlayerConditions: () =>
    set((state) => {
      const newConditions = new Map(state.player.conditions);
      clearConditions(newConditions);
      return {
        player: { ...state.player, conditions: newConditions },
      };
    }),

  // Bot Conditions
  addBotCondition: (name, duration, desc, data) =>
    set((state) => {
      const newConditions = new Map(state.bot.conditions);
      applyCondition(newConditions, name, duration, desc, data);
      return {
        bot: { ...state.bot, conditions: newConditions },
      };
    }),
  removeBotCondition: (name) =>
    set((state) => {
      const newConditions = new Map(state.bot.conditions);
      newConditions.delete(name);
      return {
        bot: { ...state.bot, conditions: newConditions },
      };
    }),
  clearBotConditions: () =>
    set((state) => {
      const newConditions = new Map(state.bot.conditions);
      clearConditions(newConditions);
      return {
        bot: { ...state.bot, conditions: newConditions },
      };
    }),

  // Combat
  playerHand: [],
  deck: new Deck(),
  setPlayerHand: (playerHand) => set({ playerHand }),
  removePlayerCards: (indices) =>
    set((state) => ({
      playerHand: state.playerHand.filter((_, i) => !indices.includes(i)),
    })),
  drawCards: (count) => set((state) => {
    const newCards = state.deck.draw(count);
    return { playerHand: [...state.playerHand, ...newCards] };
  }),
  swapCards: (indices) => set((state) => {
    const newHand = [...state.playerHand];
    const newCards = state.deck.draw(indices.length);
    indices.forEach((idx, i) => {
      newHand[idx] = newCards[i];
    });
    return { playerHand: newHand };
  }),
  setDeck: (deck) => set({ deck }),

  // UI
  isPaused: false,
  setPaused: (isPaused) => set({ isPaused }),
  message: '',
  setMessage: (message) => set({ message }),

  // Initialization
  initGame: (stageId: number) =>
    set((state) => {
      const stageConfig = STAGES[stageId];
      if (!stageConfig) return state;

      const newDeck = new Deck();
      const initialHand = newDeck.draw(8);

      return {
        stageNum: stageId,
        gameState: GameState.BATTLE,
        currentTurn: 0,
        playerHand: initialHand,
        player: {
          ...state.player,
          hp: stageId === 1 ? 200 : state.player.hp, // Reset HP only on Stage 1
          maxHp: stageId === 1 ? 200 : state.player.maxHp,
          baseMaxHp: stageId === 1 ? 200 : (state.player.baseMaxHp || 200),
          atk: 10,
          level: 1,
          conditions: stageId === 1 ? new Map([['Avoiding', { duration: 9999, elapsed: 0, desc: 'Avoiding' }]]) : new Map(),
          drawsRemaining: 2,
        },
        bot: {
          name: stageConfig.bossName,
          hp: stageConfig.hp,
          maxHp: stageConfig.hp,
          atk: stageConfig.atk,
          level: stageConfig.level,
          conditions: new Map(),
          activeRules: [], // Rules will be initialized by GameEngine logic
        },
        deck: newDeck,
        isPaused: false,
      };
    }),

  resetGame: () =>
    set({
      gameState: GameState.MENU,
      stageNum: 1,
      currentTurn: 0,
      playerHand: [],
      deck: new Deck(),
      isPaused: false,
      player: {
        name: 'Player',
        maxHp: 200,
        hp: 200,
        atk: 10,
        level: 1,
        conditions: new Map(),
      },
      bot: {
        name: 'Bot',
        maxHp: 150,
        hp: 150,
        atk: 10,
        level: 1,
        conditions: new Map(),
      },
    }),

  // Save/Load
  saveGame: () => {
    const state = get();
    SaveManager.saveGame({
      stageNum: state.stageNum,
      currentTurn: state.currentTurn,
      player: state.player,
      bot: state.bot,
      playerHand: state.playerHand,
    });
  },

  loadGame: (slot: number) => {
    const gameData = SaveManager.loadGame(slot);
    if (gameData) {
      set({
        stageNum: gameData.stageNum,
        currentTurn: gameData.currentTurn,
        player: gameData.player,
        bot: gameData.bot,
        playerHand: gameData.playerHand,
      });
    }
  },
}));
