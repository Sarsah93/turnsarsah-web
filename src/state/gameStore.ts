// state/gameStore.ts

import { create } from 'zustand';
import { Card } from '../types/Card';
import { Character, Condition } from '../types/Character';
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
  setPlayerAnimState: (state: 'NONE' | 'ATTACK' | 'HIT') => void;
  setBotAnimState: (state: 'NONE' | 'ATTACK' | 'HIT') => void;
  syncPlayer: (player: any) => void;
  syncBot: (bot: any) => void;

  // Restrictions
  bannedRanks: string[];
  bannedSuit: string | null;
  bannedHand: string | null;
  blindIndices: number[];
  setBannedRanks: (ranks: string[]) => void;
  setBannedSuit: (suit: string | null) => void;
  setBannedHand: (hand: string | null) => void;
  setBlindIndices: (indices: number[]) => void;

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
  playerHand: (Card | null)[];
  deck: Deck;
  setPlayerHand: (hand: (Card | null)[]) => void;
  removePlayerCards: (indices: number[]) => void;
  drawCards: (count: number) => void;
  refillHand: () => void;
  swapCards: (indices: number[]) => void;
  setDeck: (deck: Deck) => void;

  // UI
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  message: string;
  setMessage: (message: string) => void;

  // Game initialization
  initGame: (stageId: number) => void;
  applyStageRules: (stageId: number, turn: number) => void;
  resetGame: () => void;

  // Save/Load
  saveGame: () => void;
  loadGame: (slot: number) => void;

  // New: Stage 6 Restoration
  stage6EntryHp: number;
  setStage6EntryHp: (hp: number) => void;

  // v2.0.0.15: Animation Flow
  gamePhase: string;
  setGamePhase: (phase: string) => void;

  // v2.0.0.5 Phase 3: Transitions
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
  triggerTransition: (action: () => void) => void;

  // v2.0.0.7 Save/Load Handle
  isGameLoaded: boolean;
  setIsGameLoaded: (loaded: boolean) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Game Flow
  gameState: GameState.MENU,
  setGameState: (gameState) => set({ gameState }),
  gamePhase: 'IDLE',
  setGamePhase: (gamePhase) => set({ gamePhase }),

  // Stage
  stageNum: 1,
  setStageNum: (stageNum) => set({ stageNum }),
  currentTurn: 0,
  setCurrentTurn: (currentTurn) => set({ currentTurn }),

  // Entities
  player: {
    name: 'Player',
    maxHp: 200,
    hp: 200,
    atk: 10,
    level: 1,
    conditions: new Map<string, Condition>(),
    drawsRemaining: 2,
    baseMaxHp: 200,
  },
  bot: {
    name: 'Bot',
    maxHp: 150,
    hp: 150,
    atk: 10,
    level: 1,
    conditions: new Map<string, Condition>(),
    activeRules: [],
  },
  setPlayer: (player) => set({ player }),
  setBot: (bot) => set({ bot }),

  // Restrictions
  bannedRanks: [],
  bannedSuit: null,
  bannedHand: null,
  blindIndices: [],
  setBannedRanks: (bannedRanks) => set({ bannedRanks }),
  setBannedSuit: (bannedSuit) => set({ bannedSuit }),
  setBannedHand: (bannedHand) => set({ bannedHand }),
  setBlindIndices: (blindIndices) => set({ blindIndices }),

  // Setters
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
  setPlayerAnimState: (animState: any) =>
    set((state) => ({ player: { ...state.player, animState } })),
  setBotAnimState: (animState: any) =>
    set((state) => ({ bot: { ...state.bot, animState } })),
  syncPlayer: (playerData: any) =>
    set((state) => ({ player: { ...state.player, ...playerData, conditions: new Map(playerData.conditions) } })),
  syncBot: (botData: any) =>
    set((state) => ({ bot: { ...state.bot, ...botData, conditions: new Map(botData.conditions) } })),

  // Player Conditions
  addPlayerCondition: (name, duration, desc, data) =>
    set((state) => {
      const newConditions = new Map<string, Condition>(state.player.conditions);
      applyCondition(newConditions, name, duration, desc, data);

      let newMaxHp = state.player.maxHp;
      if (name === 'Debilitating') {
        newMaxHp = Math.floor((state.player.baseMaxHp || 200) * 0.8);
      }

      return {
        player: {
          ...state.player,
          conditions: newConditions,
          maxHp: newMaxHp,
          hp: Math.min(state.player.hp, newMaxHp)
        },
      };
    }),
  removePlayerCondition: (name) =>
    set((state) => {
      const newConditions = new Map<string, Condition>(state.player.conditions);
      newConditions.delete(name);

      let newMaxHp = state.player.maxHp;
      if (name === 'Debilitating') {
        newMaxHp = state.player.baseMaxHp || 200;
      }

      return {
        player: { ...state.player, conditions: newConditions, maxHp: newMaxHp },
      };
    }),
  clearPlayerConditions: () =>
    set((state) => {
      const newConditions = new Map<string, Condition>(state.player.conditions);
      clearConditions(newConditions);
      return {
        player: {
          ...state.player,
          conditions: newConditions,
          maxHp: state.player.baseMaxHp || 200
        },
      };
    }),

  // Bot Conditions
  addBotCondition: (name, duration, desc, data) =>
    set((state) => {
      const newConditions = new Map<string, Condition>(state.bot.conditions);
      applyCondition(newConditions, name, duration, desc, data);
      return {
        bot: { ...state.bot, conditions: newConditions },
      };
    }),
  removeBotCondition: (name) =>
    set((state) => {
      const newConditions = new Map<string, Condition>(state.bot.conditions);
      newConditions.delete(name);
      return {
        bot: { ...state.bot, conditions: newConditions },
      };
    }),
  clearBotConditions: () =>
    set((state) => {
      const newConditions = new Map<string, Condition>(state.bot.conditions);
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
    set((state) => {
      const newHand = [...state.playerHand];
      indices.forEach(idx => {
        if (idx >= 0 && idx < newHand.length) {
          newHand[idx] = null;
        }
      });
      return { playerHand: newHand };
    }),
  drawCards: (count) => set((state) => {
    const newHand = [...state.playerHand];
    const newCards = state.deck.draw(count);
    let cardIdx = 0;
    for (let i = 0; i < newHand.length && cardIdx < newCards.length; i++) {
      if (newHand[i] === null) {
        newHand[i] = newCards[cardIdx++];
      }
    }
    return { playerHand: newHand };
  }),
  refillHand: () => set((state) => {
    const newHand = [...state.playerHand];
    const emptyCount = newHand.filter(c => c === null).length;
    if (emptyCount === 0) return state;
    const newCards = state.deck.draw(emptyCount);
    let cardIdx = 0;
    for (let i = 0; i < newHand.length && cardIdx < newCards.length; i++) {
      if (newHand[i] === null) {
        newHand[i] = newCards[cardIdx++];
      }
    }
    return { playerHand: newHand };
  }),
  swapCards: (indices) => set((state) => {
    const newHand = [...state.playerHand];
    const newCards = state.deck.draw(indices.length);
    indices.forEach((idx, i) => {
      if (idx >= 0 && idx < 8) {
        newHand[idx] = newCards[i];
      }
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
      const initialHand = new Array(8).fill(null);

      let stage6Hp = state.stage6EntryHp;
      if (stageId === 6) {
        stage6Hp = state.player.hp;
      }

      return {
        stageNum: stageId,
        gameState: GameState.BATTLE,
        currentTurn: 0,
        playerHand: initialHand,
        stage6EntryHp: stage6Hp,
        bannedRanks: [],
        bannedSuit: null,
        bannedHand: null,
        blindIndices: [],
        player: {
          ...state.player,
          hp: stageId === 1 ? 200 : state.player.hp,
          maxHp: stageId === 1 ? 200 : state.player.maxHp,
          baseMaxHp: stageId === 1 ? 200 : (state.player.baseMaxHp || 200),
          atk: 10,
          level: 1,
          conditions: (stageId === 1 || !state.player.conditions.has('Avoiding'))
            ? new Map<string, Condition>([['Avoiding', { duration: 9999, elapsed: 0, desc: 'AVOIDING: 5% EVADE PROB.', type: 'AVOIDED' }]])
            : new Map<string, Condition>(state.player.conditions),
          drawsRemaining: 2,
        },
        bot: {
          name: stageConfig.bossName,
          hp: stageConfig.hp,
          maxHp: stageConfig.hp,
          atk: stageConfig.atk,
          level: stageConfig.level,
          conditions: new Map<string, Condition>(),
          activeRules: [],
        },
        deck: newDeck,
        isPaused: false,
      };
    }),

  applyStageRules: (stageId: number, turn: number) => {
    const state = get();
    let { bannedRanks, bannedSuit, bannedHand, blindIndices, bot } = state;

    bannedRanks = [];
    bannedSuit = null;
    bannedHand = null;
    blindIndices = [];

    const suits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    const hands = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair'];

    // Stage 10 Random Rule Logic
    let activeStageId = stageId;
    if (stageId === 10) {
      const rules = ['BLIND', 'BAN_SUIT', 'BAN_RANK', 'POISON', 'ATK_SPEED', 'ATK_POWER'];
      // Simple random picker
      const pick = rules[Math.floor(Math.random() * rules.length)];
      if (pick === 'BLIND') activeStageId = 2;
      else if (pick === 'BAN_RANK') activeStageId = 3;
      else if (pick === 'BAN_SUIT') activeStageId = 4;
      else if (pick === 'POISON') {
        state.addPlayerCondition('Poisoning', 4);
      }
    }

    if (activeStageId === 2) {
      const indices = [0, 1, 2, 3, 4, 5, 6, 7];
      for (let i = 0; i < 2; i++) {
        const randIdx = Math.floor(Math.random() * indices.length);
        blindIndices.push(indices.splice(randIdx, 1)[0]);
      }
    } else if (activeStageId === 3) {
      const r1 = ranks[Math.floor(Math.random() * ranks.length)];
      let r2 = ranks[Math.floor(Math.random() * ranks.length)];
      while (r1 === r2) r2 = ranks[Math.floor(Math.random() * ranks.length)];
      bannedRanks = [r1, r2];
    } else if (activeStageId === 4) {
      bannedSuit = suits[Math.floor(Math.random() * suits.length)];
    } else if (activeStageId === 6) {
      bannedHand = hands[Math.floor(Math.random() * hands.length)];
    } else if (activeStageId === 7 && turn > 0) {
      set({ bot: { ...bot, atk: bot.atk + 10 } });
    }

    set({ bannedRanks, bannedSuit, bannedHand, blindIndices });
  },

  resetGame: () =>
    set({
      gameState: GameState.MENU,
      stageNum: 1,
      currentTurn: 0,
      playerHand: new Array(8).fill(null),
      deck: new Deck(),
      isPaused: false,
      player: {
        name: 'Player',
        maxHp: 200,
        hp: 200,
        atk: 10,
        level: 1,
        conditions: new Map<string, Condition>(),
      },
      bot: {
        name: 'Bot',
        maxHp: 150,
        hp: 150,
        atk: 10,
        level: 1,
        conditions: new Map<string, Condition>(),
      },
    }),

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
        gameState: GameState.BATTLE,
        currentTurn: gameData.currentTurn,
        player: gameData.player,
        bot: gameData.bot,
        playerHand: gameData.playerHand as (Card | null)[],
        deck: new Deck(),
        isGameLoaded: true,
      });
    }
  },

  stage6EntryHp: 200,
  setStage6EntryHp: (hp) => set({ stage6EntryHp: hp }),

  isTransitioning: false,
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
  triggerTransition: async (action) => {
    set({ isTransitioning: true });
    await new Promise(r => setTimeout(r, 800));
    action();
    await new Promise(r => setTimeout(r, 200));
    set({ isTransitioning: false });
  },

  isGameLoaded: false,
  setIsGameLoaded: (isGameLoaded) => set({ isGameLoaded }),
}));
