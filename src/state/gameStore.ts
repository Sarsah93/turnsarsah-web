// state/gameStore.ts

import { create } from 'zustand';
import { Card, CardFactory } from '../types/Card';
import { Character, Condition } from '../types/Character';
import { GameState, Difficulty, DIFFICULTY_CONFIGS, UNLOCKED_DIFFICULTIES_KEY } from '../constants/gameConfig';
import { Deck } from '../logic/Deck';
import { CHAPTERS } from '../constants/stages';
import { applyCondition, clearConditions } from '../logic/conditions';
import { SaveManager } from '../utils/SaveManager';
import { Language } from '../constants/translations';

interface GameStoreState {
  // Game Flow
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Current Stage
  chapterNum: number;
  setChapterNum: (chapter: number) => void;
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

  // Tutorial System
  isTutorial: boolean;
  tutorialStep: number;
  tutorialHighlights: number[]; // v2.0.0.21: Highlighted card indices
  setTutorialStep: (step: number) => void;
  setTutorialHighlights: (indices: number[]) => void;
  initTutorial: () => void;

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
  activeMenu: string;
  setActiveMenu: (menu: string) => void;

  // Game initialization
  initGame: (chapterId: number, stageId: number) => void;
  applyStageRules: (chapterId: number, stageId: number, turn: number) => void;
  resetGame: () => void;

  // Save/Load
  saveGame: (slot: number) => void;
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

  // v2.0.0.16: Permanent Bonus
  hasStage6Bonus: boolean;
  setHasStage6Bonus: (val: boolean) => void;

  // v2.0.0.17: Stage 10 Dynamic Rule Text
  stage10RuleText: string;
  setStage10RuleText: (text: string) => void;

  // Difficulty System
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  unlockedDifficulties: Difficulty[];
  unlockDifficulty: (diff: Difficulty) => void;
  initGameWithDifficulty: (chapterId: number, stageId: number, difficulty: Difficulty) => void;

  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Game Flow
  gameState: GameState.MENU,
  setGameState: (gameState) => set({ gameState }),
  gamePhase: 'IDLE',
  setGamePhase: (gamePhase) => set({ gamePhase }),

  // Stage
  chapterNum: 1,
  setChapterNum: (chapterNum) => set({ chapterNum }),
  stageNum: 1,
  setStageNum: (stageNum) => set({ stageNum }),
  currentTurn: 0,
  hasStage6Bonus: false,
  setHasStage6Bonus: (hasStage6Bonus) => set({ hasStage6Bonus }),
  setCurrentTurn: (currentTurn) => set({ currentTurn }),
  stage10RuleText: '',
  setStage10RuleText: (stage10RuleText) => set({ stage10RuleText }),
  // Tutorial System
  isTutorial: false,
  tutorialStep: 0,
  tutorialHighlights: [],
  setTutorialStep: (tutorialStep) => set({ tutorialStep }),
  setTutorialHighlights: (tutorialHighlights) => set({ tutorialHighlights }),

  // Localization
  language: (localStorage.getItem('turnsarsah_lang') as Language) || 'KR',
  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('turnsarsah_lang', language);
  },

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

  // UI
  isPaused: false,
  setPaused: (isPaused) => set({ isPaused }),
  message: '',
  setMessage: (message) => set({ message }),
  activeMenu: 'NONE',
  setActiveMenu: (activeMenu) => set({ activeMenu }),
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
        // v2.0.0.17: Force update baseMaxHp if it's the permanent bonus
        baseMaxHp: state.hasStage6Bonus ? maxHp : (state.player.baseMaxHp || maxHp)
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
    const newCards = state.deck.draw(count, state.playerHand);
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
    const newCards = state.deck.draw(emptyCount, state.playerHand);
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
    const newCards = state.deck.draw(indices.length, state.playerHand);
    indices.forEach((idx, i) => {
      if (idx >= 0 && idx < 8) {
        newHand[idx] = newCards[i];
      }
    });
    return { playerHand: newHand };
  }),
  // Deck
  setDeck: (deck) => set({ deck }),

  // Initialization
  initGame: (chapterId: number, stageId: number) => {
    set((state) => {
      const chapter = CHAPTERS[chapterId];
      const stageConfig = chapter?.stages[stageId];
      if (!stageConfig) return state;

      const config = DIFFICULTY_CONFIGS[state.difficulty];
      const newDeck = new Deck(config.jokerProbability);
      const initialHand = new Array(8).fill(null);

      let stage6Hp = state.stage6EntryHp;
      if (stageId === 6) {
        stage6Hp = state.player.hp;
      }

      // v2.0.0.17: Boss Damage Reduction as Condition
      const botConditions = new Map<string, Condition>();
      const baseReduction = stageId === 10 ? 15 : (stageId >= 8 ? 10 : 0);
      const bossOverride = config.bossOverrides[chapterId]?.[stageId] || {};
      const damageReduction = bossOverride.damageReduction ?? baseReduction;

      if (damageReduction > 0) {
        applyCondition(botConditions, 'Damage Reducing', 9999, `Reduces incoming damage by ${damageReduction}%.`, { percent: damageReduction });
      }

      // Boss stat overrides based on difficulty
      const bossHp = bossOverride.hp ?? stageConfig.hp;
      const bossAtk = bossOverride.atk ?? stageConfig.atk;

      // Player HP handling - preserve on stage transitions, reset on new game
      let playerHp: number;
      let playerMaxHp: number;
      let playerBaseMaxHp: number;
      let playerSwaps: number;

      if (stageId === 1) {
        // New game - use difficulty config
        playerHp = config.playerHp;
        playerMaxHp = config.playerHp;
        playerBaseMaxHp = config.playerHp;
        playerSwaps = config.swapCount;
      } else {
        // Stage transition - preserve current HP and max HP
        playerHp = state.player.hp;
        playerMaxHp = state.player.maxHp;
        playerBaseMaxHp = state.player.baseMaxHp || config.playerHp;
        playerSwaps = config.swapCount;
      }

      // Player conditions - Avoiding based on difficulty
      const playerConditions = new Map<string, Condition>();
      if (config.avoidChance > 0) {
        applyCondition(playerConditions, 'Avoiding', 9999, `AVOIDING: ${Math.floor(config.avoidChance * 100)}% EVADE PROB.`, { chance: config.avoidChance });
      }

      return {
        chapterNum: chapterId,
        stageNum: stageId,
        gameState: GameState.BATTLE,
        currentTurn: 0,
        playerHand: initialHand,
        stage6EntryHp: stage6Hp,
        bannedRanks: [],
        bannedSuit: null,
        bannedHand: null,
        blindIndices: [],
        hasStage6Bonus: (chapterId === 1 && stageId === 1) ? false : state.hasStage6Bonus,
        player: {
          name: 'Player',
          hp: playerHp,
          maxHp: playerMaxHp,
          baseMaxHp: playerBaseMaxHp,
          atk: 10,
          level: 1,
          conditions: playerConditions,
          drawsRemaining: playerSwaps,
        },
        bot: {
          name: stageConfig.bossName,
          hp: bossHp,
          maxHp: bossHp,
          atk: bossAtk,
          level: stageConfig.level,
          conditions: botConditions,
          activeRules: [],
        },
        deck: newDeck,
        isPaused: false,
        stage10RuleText: '',
        message: '',
      };
    });
    // Immediately apply rules for turn 0
    get().applyStageRules(chapterId, stageId, 0);
  },

  applyStageRules: (chapterId: number, stageId: number, turn: number) => {
    const state = get();
    const config = DIFFICULTY_CONFIGS[state.difficulty];
    let { bannedRanks, bannedSuit, bannedHand, blindIndices, bot } = state;

    bannedRanks = [];
    bannedSuit = null;
    bannedHand = null;
    blindIndices = [];

    const suits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    const hands = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair'];

    // v2.1.0: Only chapter 1 rules for now
    if (chapterId === 1) {
      // Stage 10 Random Rule Logic with HELL dual-rule support
      let activeStageIds: number[] = [];
      const ruleDescs: string[] = [];

      if (stageId === 10) {
        const rules = ['BLIND', 'BAN_SUIT', 'BAN_RANK', 'BAN_HAND', 'POISON', 'ATK_UP'];
        const ruleCount = config.stage10RuleCount;
        const pickedRules: string[] = [];

        for (let i = 0; i < ruleCount; i++) {
          let pick = rules[Math.floor(Math.random() * rules.length)];
          while (pickedRules.includes(pick)) {
            pick = rules[Math.floor(Math.random() * rules.length)];
          }
          pickedRules.push(pick);

          if (pick === 'BLIND') {
            activeStageIds.push(3); // BLIND is now Stage 3
            const indices = [0, 1, 2, 3, 4, 5, 6, 7].filter(idx => !blindIndices.includes(idx));
            for (let j = 0; j < 2 && indices.length > 0; j++) {
              const randIdx = Math.floor(Math.random() * indices.length);
              blindIndices.push(indices.splice(randIdx, 1)[0]);
            }
            ruleDescs.push('BLIND_2 CARDS');
          } else if (pick === 'BAN_RANK') {
            activeStageIds.push(2); // BAN_RANK is now Stage 2
            const r1 = ranks[Math.floor(Math.random() * ranks.length)];
            let r2 = ranks[Math.floor(Math.random() * ranks.length)];
            while (r1 === r2) r2 = ranks[Math.floor(Math.random() * ranks.length)];
            bannedRanks = [r1, r2];
            ruleDescs.push(`BANNED_${bannedRanks.join('/')}`);
          } else if (pick === 'BAN_SUIT') {
            activeStageIds.push(4);
            bannedSuit = suits[Math.floor(Math.random() * suits.length)];
            ruleDescs.push(`BANNED_${bannedSuit}`);
          } else if (pick === 'BAN_HAND') {
            activeStageIds.push(6);
            bannedHand = hands[Math.floor(Math.random() * hands.length)];
            ruleDescs.push(`BANNED_${bannedHand}`);
          } else if (pick === 'POISON') {
            state.addPlayerCondition('Poisoning', 4);
            ruleDescs.push('POISON');
          } else if (pick === 'ATK_UP') {
            activeStageIds.push(7);
            if (turn === 0) {
              set({ bot: { ...bot, atk: bot.atk + 10 } });
            }
            ruleDescs.push('ATK_UP');
          }
        }

        // Update Stage 10 Rule Text
        const bossOverride = config.bossOverrides[chapterId]?.[10] || {};
        const reductionPercent = bossOverride.damageReduction ?? 15;

        // v2.2.1: Dynamic Rule Text - Hide REGEN/REDUCE if Awakened
        const isAwakened = bot.conditions.has('Awakening');
        if (isAwakened) {
          set({ stage10RuleText: `RULE: ${ruleDescs.join('+')}` });
        } else {
          set({ stage10RuleText: `RULE: ${ruleDescs.join('+')}+REGEN+REDUCE ${reductionPercent}%` });
        }
      } else {
        // Normal stage rules - SWAPPED Stage 2 and 3
        // Stage 2 now has BAN_RANK (was BLIND), Stage 3 now has BLIND (was BAN_RANK)
        if (stageId === 2) {
          // BAN_RANK (swapped from Stage 3)
          const r1 = ranks[Math.floor(Math.random() * ranks.length)];
          let r2 = ranks[Math.floor(Math.random() * ranks.length)];
          while (r1 === r2) r2 = ranks[Math.floor(Math.random() * ranks.length)];
          bannedRanks = [r1, r2];
        } else if (stageId === 3) {
          // BLIND (swapped from Stage 2)
          const indices = [0, 1, 2, 3, 4, 5, 6, 7];
          for (let i = 0; i < 2; i++) {
            const randIdx = Math.floor(Math.random() * indices.length);
            blindIndices.push(indices.splice(randIdx, 1)[0]);
          }
        } else if (stageId === 4) {
          bannedSuit = suits[Math.floor(Math.random() * suits.length)];
        } else if (stageId === 5 && (state.difficulty === Difficulty.HARD || state.difficulty === Difficulty.HELL)) {
          // HARD/HELL: Stage 5 also has BAN_HAND
          bannedHand = hands[Math.floor(Math.random() * hands.length)];
        } else if (stageId === 6) {
          bannedHand = hands[Math.floor(Math.random() * hands.length)];
        } else if (stageId === 7 && turn > 0) {
          // Scaling moved to executeBotTurn (conditional on hit)
        } else if (stageId === 9 && turn > 0) {
          // Scaling moved to executeBotTurn (conditional on hit)
        }
      }
    }


    // v2.0.0.21: Tutorial Boss Rule Practice (BLIND)
    if (get().isTutorial) {
      if ([16, -16, 17, -17].includes(get().tutorialStep)) {
        const indices = [0, 1, 2, 3, 4, 5, 6, 7];
        blindIndices = [];
        for (let i = 0; i < 2; i++) {
          const randIdx = Math.floor(Math.random() * indices.length);
          blindIndices.push(indices.splice(randIdx, 1)[0]);
        }
      } else {
        blindIndices = []; // Clear for other steps
      }
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
        baseMaxHp: 200,
      },
      hasStage6Bonus: false,
      bot: {
        name: 'Bot',
        maxHp: 150,
        hp: 150,
        atk: 10,
        level: 1,
        conditions: new Map<string, Condition>(),
      },
      message: '',
    }),

  saveGame: (slot: number) => {
    const state = get();
    if (state.isTutorial) {
      console.log("Saving is blocked during tutorial.");
      return;
    }
    SaveManager.saveGame(slot, {
      chapterNum: state.chapterNum,
      stageNum: state.stageNum,
      difficulty: state.difficulty,
      currentTurn: state.currentTurn,
      player: state.player,
      bot: state.bot,
      playerHand: state.playerHand,
    });
  },

  initTutorial: () => {
    const tutorialHand = [
      CardFactory.create('HEARTS', '10'),
      CardFactory.create('HEARTS', 'J'),
      CardFactory.create('HEARTS', 'Q'),
      CardFactory.create('CLUBS', 'Q'),
      CardFactory.create('HEARTS', 'K'),
      CardFactory.create('HEARTS', 'A'),
      CardFactory.create('CLUBS', 'A'),
      CardFactory.create(null, null, true), // Joker
    ];

    set({
      gameState: GameState.TUTORIAL,
      isTutorial: true,
      tutorialStep: 0,
      tutorialHighlights: [],
      stageNum: 0,
      currentTurn: 0,
      player: {
        name: 'Player',
        hp: 1000,
        maxHp: 1000,
        baseMaxHp: 1000,
        atk: 10,
        level: 1,
        conditions: new Map<string, Condition>(),
        drawsRemaining: 2,
      },
      bot: {
        name: 'Tutorial Bot',
        hp: 1000,
        maxHp: 1000,
        atk: 1,
        level: 1,
        conditions: new Map<string, Condition>(),
        activeRules: [],
      },
      playerHand: tutorialHand,
      deck: new Deck(0),
      message: "TUTORIAL START",
    });
  },

  loadGame: (slot: number) => {
    const gameData = SaveManager.loadGame(slot);
    if (gameData) {
      set({
        chapterNum: gameData.chapterNum || 1,
        stageNum: gameData.stageNum,
        difficulty: gameData.difficulty,
        gameState: GameState.BATTLE,
        currentTurn: gameData.currentTurn,
        player: gameData.player,
        bot: gameData.bot,
        playerHand: gameData.playerHand as (Card | null)[],
        deck: new Deck(),
        isGameLoaded: true,
      });
      // Re-apply rules to populate UI states (especially for Stage 10 rule text)
      get().applyStageRules(gameData.chapterNum || 1, gameData.stageNum, gameData.currentTurn);
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

  // Difficulty System
  difficulty: Difficulty.NORMAL,
  setDifficulty: (difficulty) => set({ difficulty }),
  unlockedDifficulties: (() => {
    try {
      const saved = localStorage.getItem(UNLOCKED_DIFFICULTIES_KEY);
      if (saved) return JSON.parse(saved) as Difficulty[];
    } catch { }
    return [Difficulty.EASY, Difficulty.NORMAL];
  })(),
  unlockDifficulty: (diff) => {
    const current = get().unlockedDifficulties;
    if (!current.includes(diff)) {
      const updated = [...current, diff];
      set({ unlockedDifficulties: updated });
      try {
        localStorage.setItem(UNLOCKED_DIFFICULTIES_KEY, JSON.stringify(updated));
      } catch { }
    }
  },
  initGameWithDifficulty: (chapterId: number, stageId: number, difficulty: Difficulty) => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const chapter = CHAPTERS[chapterId];
    const stageConfig = chapter?.stages[stageId];
    if (!stageConfig) return;

    // Boss stat overrides
    const bossOverride = config.bossOverrides[chapterId]?.[stageId] || {};
    const bossHp = bossOverride.hp ?? stageConfig.hp;
    const bossAtk = bossOverride.atk ?? stageConfig.atk;
    const bossDamageReduction = bossOverride.damageReduction ?? (stageId === 10 ? 15 : (stageId >= 8 ? 10 : 0));

    const newDeck = new Deck(config.jokerProbability);
    const initialHand = new Array(8).fill(null);

    // Boss Damage Reduction as Condition
    const botConditions = new Map<string, Condition>();
    if (bossDamageReduction > 0) {
      applyCondition(botConditions, 'Damage Reducing', 9999, `Reduces incoming damage by ${bossDamageReduction}%.`, { percent: bossDamageReduction });
    }

    // Player conditions - Avoiding based on difficulty
    const playerConditions = new Map<string, Condition>();
    if (config.avoidChance > 0) {
      applyCondition(playerConditions, 'Avoiding', 9999, `AVOIDING: ${Math.floor(config.avoidChance * 100)}% EVADE PROB.`, { chance: config.avoidChance });
    }

    set({
      chapterNum: chapterId,
      stageNum: stageId,
      difficulty: difficulty,
      gameState: GameState.BATTLE,
      currentTurn: 0,
      playerHand: initialHand,
      stage6EntryHp: config.playerHp,
      bannedRanks: [],
      bannedSuit: null,
      bannedHand: null,
      blindIndices: [],
      hasStage6Bonus: false,
      player: {
        name: 'Player',
        hp: config.playerHp,
        maxHp: config.playerHp,
        baseMaxHp: config.playerHp,
        atk: 10,
        level: 1,
        conditions: playerConditions,
        drawsRemaining: config.swapCount,
      },
      bot: {
        name: stageConfig.bossName,
        hp: bossHp,
        maxHp: bossHp,
        atk: bossAtk,
        level: stageConfig.level,
        conditions: botConditions,
        activeRules: [],
      },
      deck: newDeck,
      isPaused: false,
      stage10RuleText: '',
      message: '',
    });
    // Immediately apply rules for turn 0
    get().applyStageRules(chapterId, stageId, 0);
  },
}));
