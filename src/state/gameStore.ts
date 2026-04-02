// state/gameStore.ts

import { create } from 'zustand';
import { Card, CardFactory } from '../types/Card';
import { Character, Condition } from '../types/Character';
import { GameState, Difficulty, DifficultyConfig, DIFFICULTY_CONFIGS } from '../constants/gameConfig';
import { RANK_VALUES } from '../constants/cards';
import { Deck } from '../logic/Deck';
import { CHAPTERS } from '../constants/stages';
import { applyCondition, clearConditions } from '../logic/conditions';
import { applyStageRulesImplementation } from '../logic/stageRules';
import { storageKey } from '../utils/buildTarget';
import { SaveManager } from '../utils/SaveManager';
import { Language, TRANSLATIONS } from '../constants/translations';
import { GuidePopupData } from '../constants/guideData';

const UNLOCKED_DIFFICULTIES_KEY = storageKey('unlocked_difficulties');
import { TROPHIES, ALTAR_SKILLS, TrophyDef } from '../constants/altarSystem';
import { AltarManager } from '../utils/AltarManager';
import { preloadManager } from '../utils/AssetPreloadManager';
import { getGameEntryAssets } from '../constants/assetManifest';

/**
 * v2.3.9: Shared helper to calculate player stats with Altar skill bonuses
 */
const calculateInitialPlayer = (
  config: DifficultyConfig,
  activeSkills: string[],
  chapterId: string,
  difficulty: Difficulty,
  haveStage6Bonus: boolean = false
): Character => {
  let initialHpBonus = 0;

  // 1A: Prepper (+25 Max HP)
  if (activeSkills.includes('1A')) {
    let bonus = 25;
    // 3A-1: Biorhythm Acceleration (+20% bonus to permanent HP increases)
    if (activeSkills.includes('3A-1')) {
      bonus = Math.floor(bonus * 1.2);
    }
    initialHpBonus += bonus;
  }

  // v2.0.0.14: Stage 6 Reward (Chapter 1 Only: 20% MAX HP bonus)
  // If moving to Chapter 2, we carry this over via haveStage6Bonus
  if (haveStage6Bonus) {
    let bonus = Math.floor(config.playerHp * 0.2); // config.stage6MaxHpBonus is typically 0.2
    if (activeSkills.includes('3A-1')) {
      bonus = Math.floor(bonus * 1.2);
    }
    initialHpBonus += bonus;
  }

  const totalMaxHp = config.playerHp + initialHpBonus;
  const playerConditions = new Map<string, Condition>();

  // Evasion (Avoiding) - 2B Oneness with Nature (+5% Evasion, ignore env)
  const isOnenessWithNature = activeSkills.includes('2B');
  const bonus = isOnenessWithNature ? 0.05 : 0;
  // 2B를 제외한 모든 챕터에서 회피 적용 (또는 2B에서 OnenessWithNature 스킬 있을 때)
  if ((chapterId !== '2B' || isOnenessWithNature) && (config.avoidChance + bonus) > 0) {
    applyCondition(playerConditions, 'Avoiding', 9999, '', { chance: config.avoidChance + bonus });
  }

  if (chapterId === '2A') {
    const dehydrationDmg = {
      [Difficulty.EASY]: 1,
      [Difficulty.NORMAL]: 2,
      [Difficulty.HARD]: 3,
      [Difficulty.HELL]: 4
    }[difficulty] || 2;
    applyCondition(playerConditions, 'Dehydration', 9999, '', { amount: dehydrationDmg });
  }

  return {
    name: 'Player',
    hp: totalMaxHp,
    maxHp: totalMaxHp,
    baseMaxHp: totalMaxHp,
    atk: 10,
    level: 1,
    conditions: playerConditions,
    drawsRemaining: config.swapCount,
  };
};

interface GameStoreState {
  // Game Flow
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Current Stage
  chapterNum: string;
  setChapterNum: (chapter: string) => void;
  stageNum: number;
  setStageNum: (stage: number) => void;
  currentTurn: number;
  setCurrentTurn: (turn: number) => void;

  // v3.0: Combat stabilization
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;

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
  bannedIndices: number[];
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

  // v3.0: MUDDED Status
  applyMudStatus: (count: number) => void;
  applyPetrifyStatus: (count: number) => void;

  // Combat
  playerHand: (Card | null)[];
  deck: Deck;
  setPlayerHand: (hand: (Card | null)[]) => void;
  removePlayerCards: (indices: number[]) => void;
  drawCards: (count: number) => void;
  refillHand: () => void;
  swapCards: (indices: number[], isFree?: boolean) => void;
  setDeck: (deck: Deck) => void;

  // UI
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;

  // Trophy Popup
  trophyPopup: TrophyDef | null;
  setTrophyPopup: (trophy: TrophyDef | null) => void;

  // Guide Popup
  guidePopup: GuidePopupData | null;
  setGuidePopup: (data: GuidePopupData | null) => void;
  clearGuidePopup: () => void;

  // Altar System
  equippedAltarSkills: string[];
  setEquippedAltarSkills: (skills: string[]) => void;
  altarSkillUses: Record<string, number>;
  setAltarSkillUse: (skillId: string, count: number) => void;
  consecutiveHandType: string | null;
  consecutiveHandStacks: number;
  setConsecutiveHand: (handType: string | null, stacks: number) => void;
  sessionSkillsTriggered: string[]; // for once-per-session skills like 3B-1
  setSessionSkillTriggered: (skillId: string) => void;
  stageSkillsTriggered: string[]; // for once-per-stage skills like 7
  setStageSkillTriggered: (skillId: string) => void;

  // v2.4.4: Skill specific states
  dyschromatopsiaUses: number; // 0/2
  isDyschromatopsiaActive: boolean;
  setDyschromatopsiaActive: (active: boolean) => void;
  incrementDyschromatopsiaUses: () => void;
  // v2.5.0: Game Speed
  gameSpeed: number;
  setGameSpeed: (speed: number) => void;

  // 3B-10 Boss States
  lizardKingStraightCount: number;
  setLizardKingStraightCount: (count: number) => void;
  lizardStemCellDestroyed: boolean;
  setLizardStemCellDestroyed: (destroyed: boolean) => void;

  // Game initialization
  initGame: (chapterId: string, stageId: number) => void;
  applyStageRules: (chapterId: string, stageId: number, turn: number) => void;
  resetGame: () => void;

  // Save/Load
  saveGame: (slot: number) => void;
  loadGame: (slot: number) => Promise<void>;
  forceSaveGame: (slot: number) => void;

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

  // Bug fix: prevent ATK_UP from stacking on load/reapply
  stageRulesApplied: boolean;

  // Difficulty System
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  unlockedDifficulties: Difficulty[];
  unlockDifficulty: (diff: Difficulty) => void;
  syncDifficulties: () => void; // v2.4.1: Method to refresh difficulty state after migration
  initGameWithDifficulty: (chapterId: string, stageId: number, difficulty: Difficulty) => Promise<void>;

  // Loading Phase
  loadingPhase: 'NONE' | 'INITIAL' | 'GAME_ENTRY' | 'CHAPTER_TRANSITION';
  loadingProgress: number;
  setLoadingPhase: (phase: 'NONE' | 'INITIAL' | 'GAME_ENTRY' | 'CHAPTER_TRANSITION') => void;
  setLoadingProgress: (progress: number) => void;

  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;

  // Font Size
  fontSize: 'LARGE' | 'NORMAL' | 'SMALL';
  setFontSize: (size: 'LARGE' | 'NORMAL' | 'SMALL') => void;

  // v2.3.2: Puzzle Gimmick (Chapter 2A-10)
  puzzleTarget: number;
  setPuzzleTarget: (target: number) => void;

  setBannedIndices: (indices: number[]) => void;

  // Hidden Scenario
  ch1PerfectCount: number;
  specialQualify: boolean;
  ch2PerfectCount: number;
  ch2SpecialQualify: boolean;
  setHiddenState: (update: Partial<{
    ch1PerfectCount: number,
    specialQualify: boolean,
    ch2PerfectCount: number,
    ch2SpecialQualify: boolean
  }>) => void;

  // New Clear Popup (v2.4.2)
  clearPopupDifficulty: Difficulty | null;
  setClearPopupDifficulty: (diff: Difficulty | null) => void;

  // v2.4.3: Dynamic HUD Positioning (Score Preview)
  scorePreviewHUDPos: { x: number; y: number };
  setScorePreviewHUDPos: (pos: { x: number; y: number }) => void;

  // v2.5.0: Victory Fanfare State (UI synchronization)
  isVictoryFanfareActive: boolean;
  setIsVictoryFanfareActive: (active: boolean) => void;

  // v3.0: Chapter Next Popup
  nextChapterId: string;          // 다음에 진입할 체터 ID
  setNextChapterId: (id: string) => void;

  // v3.0: Hydra Flush Counter (티폰전승)
  hydraFlushSuits: string[];      // 성공한 다른 문양 목록
  setHydraFlushSuits: (suits: string[]) => void;
  resetHydraFlushSuits: () => void;

  // v3.0: Hydra Revive Counter (HUD 표시용)
  hydraReviveRemaining: number;
  setHydraReviveRemaining: (count: number) => void;

  // Chapter 3B specific (v2.5.0)
  holdBreathCount3B: number;
  setHoldBreathCount3B: (count: number) => void;
  holdBreathTurn3B: number;
  setHoldBreathTurn3B: (turn: number) => void;
  holdBreathInvulnerable3B: boolean;
  setHoldBreathInvulnerable3B: (active: boolean) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Game Flow
  gameState: GameState.MENU,
  setGameState: (gameState) => set({ gameState }),
  gamePhase: 'IDLE',
  setGamePhase: (gamePhase) => set({ gamePhase }),

  // Combat stabilization
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  // Font Size
  fontSize: (localStorage.getItem(storageKey('font_size')) as 'LARGE' | 'NORMAL' | 'SMALL') || 'LARGE',
  setFontSize: (fontSize) => {
    set({ fontSize });
    localStorage.setItem(storageKey('font_size'), fontSize);
  },

  // Stage
  chapterNum: '1',
  setChapterNum: (chapterNum) => set({ chapterNum }),
  stageNum: 1,
  setStageNum: (stageNum) => set({ stageNum }),
  currentTurn: 0,
  hasStage6Bonus: false,
  setHasStage6Bonus: (hasStage6Bonus) => set({ hasStage6Bonus }),
  setCurrentTurn: (currentTurn) => set({ currentTurn }),
  stage10RuleText: '',
  setStage10RuleText: (stage10RuleText) => set({ stage10RuleText }),
  stageRulesApplied: false,
  // Hidden Scenario
  ch1PerfectCount: 0,
  specialQualify: false,
  ch2PerfectCount: 0,
  ch2SpecialQualify: false,
  setHiddenState: (update) => set((state) => ({ ...state, ...update })),
  stageSkillsTriggered: [],

  // v3.0: Chapter Next Popup
  nextChapterId: '',
  setNextChapterId: (nextChapterId) => set({ nextChapterId }),

  // v3.0: Hydra Flush Counter
  hydraFlushSuits: [],
  setHydraFlushSuits: (hydraFlushSuits) => set({ hydraFlushSuits }),
  resetHydraFlushSuits: () => set({ hydraFlushSuits: [] }),

  // v3.0: Hydra Revive Counter
  hydraReviveRemaining: 0,
  setHydraReviveRemaining: (hydraReviveRemaining) => set({ hydraReviveRemaining }),

  // Loading Phase
  loadingPhase: 'NONE',
  loadingProgress: 0,
  setLoadingPhase: (loadingPhase) => set({ loadingPhase }),
  setLoadingProgress: (loadingProgress) => set({ loadingProgress }),

  // Tutorial System
  isTutorial: false,
  tutorialStep: 0,
  tutorialHighlights: [],
  setTutorialStep: (tutorialStep) => set({ tutorialStep }),
  setTutorialHighlights: (tutorialHighlights) => set({ tutorialHighlights }),

  // Localization
  language: (localStorage.getItem(storageKey('lang')) as Language) || 'KR',
  setLanguage: (language) => {
    set({ language });
    localStorage.setItem(storageKey('lang'), language);
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
    isBossVisible: true,
  },
  setPlayer: (player) => set({ player }),
  setBot: (bot) => set({ bot }),

  // Restrictions
  bannedRanks: [],
  bannedSuit: null,
  bannedHand: null,
  blindIndices: [],
  bannedIndices: [],

  // UI
  isPaused: false,
  setPaused: (isPaused) => set({ isPaused }),
  message: '',
  setMessage: (message) => set({ message }),
  activeMenu: 'NONE',
  setActiveMenu: (activeMenu) => set({ activeMenu }),
  trophyPopup: null,
  setTrophyPopup: (trophyPopup) => set({ trophyPopup }),
  guidePopup: null,
  setGuidePopup: (guidePopup) => set({ guidePopup }),
  clearGuidePopup: () => set({ guidePopup: null }),
  equippedAltarSkills: AltarManager.getAltarData().normal?.equippedSkills || [],
  setEquippedAltarSkills: (equippedAltarSkills) => {
    set({ equippedAltarSkills });
    // v2.3.7: Persist equipped skills to localStorage
    AltarManager.saveEquippedSkills(equippedAltarSkills, get().difficulty);
  },

  altarSkillUses: {},
  setAltarSkillUse: (skillId, count) => set((state) => ({
    altarSkillUses: { ...state.altarSkillUses, [skillId]: count }
  })),

  consecutiveHandType: null,
  consecutiveHandStacks: 0,
  setConsecutiveHand: (handType, stacks) => set({ consecutiveHandType: handType, consecutiveHandStacks: stacks }),

  sessionSkillsTriggered: [],
  setSessionSkillTriggered: (skillId) => set((state) => ({
    sessionSkillsTriggered: [...state.sessionSkillsTriggered, skillId]
  })),

  setStageSkillTriggered: (skillId) => set((state) => ({
    stageSkillsTriggered: [...state.stageSkillsTriggered, skillId]
  })),

  dyschromatopsiaUses: 0,
  isDyschromatopsiaActive: false,
  setDyschromatopsiaActive: (isDyschromatopsiaActive) => set({ isDyschromatopsiaActive }),
  incrementDyschromatopsiaUses: () => set((state) => ({ dyschromatopsiaUses: Math.min(1, state.dyschromatopsiaUses + 1) })),

  // v2.5.0: Game Speed
  gameSpeed: Number(localStorage.getItem(storageKey('game_speed'))) || 1.0,
  setGameSpeed: (gameSpeed) => {
    set({ gameSpeed });
    localStorage.setItem(storageKey('game_speed'), gameSpeed.toString());
  },

  holdBreathCount3B: 0,
  setHoldBreathCount3B: (holdBreathCount3B) => set({ holdBreathCount3B }),
  holdBreathTurn3B: -1,
  setHoldBreathTurn3B: (holdBreathTurn3B) => set({ holdBreathTurn3B }),
  holdBreathInvulnerable3B: false,
  setHoldBreathInvulnerable3B: (holdBreathInvulnerable3B) => set({ holdBreathInvulnerable3B }),

  // 3B-10 Boss Initial States
  lizardKingStraightCount: 0,
  setLizardKingStraightCount: (count) => set({ lizardKingStraightCount: count }),
  lizardStemCellDestroyed: false,
  setLizardStemCellDestroyed: (destroyed) => set({ lizardStemCellDestroyed: destroyed }),

  setBannedRanks: (bannedRanks) => set({ bannedRanks }),
  setBannedSuit: (bannedSuit) => set({ bannedSuit }),
  setBannedHand: (bannedHand) => set({ bannedHand }),
  setBlindIndices: (blindIndices) => set({ blindIndices }),
  setBannedIndices: (bannedIndices) => set({ bannedIndices }),

  // Setters
  setDrawsRemaining: (draws: number) =>
    set((state) => ({ player: { ...state.player, drawsRemaining: draws } })),
  setBotActiveRules: (rules: [string, unknown][]) =>
    set((state) => ({ bot: { ...state.bot, activeRules: rules } })),

  // Health
  setPlayerHp: (hp) => set((state) => {
    // 4B-1: Phase Transition (Resurrection 1 time per stage)
    if (hp <= 0 && state.equippedAltarSkills.includes('4B-1') && !state.stageSkillsTriggered.includes('4B-1')) {
      const newHand = [...state.playerHand];
      // Convert random card to Joker
      const validIndices = newHand.map((c, i) => c !== null ? i : -1).filter(i => i !== -1);
      if (validIndices.length > 0) {
        const targetIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
        newHand[targetIdx] = CardFactory.create(null, null, true);
      }

      return {
        player: { ...state.player, hp: 1 },
        playerHand: newHand,
        stageSkillsTriggered: [...state.stageSkillsTriggered, '4B-1'],
        message: 'PHASE TRANSITION!'
      };
    }
    return { player: { ...state.player, hp: Math.max(0, Math.min(state.player.maxHp, hp)) } };
  }),
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
      // 3A-2: Hunter (Immune to accuracy debuffs and paralysis)
      if (state.equippedAltarSkills.includes('3A-2') && (name === 'Decreasing accuracy' || name === 'Paralyzing')) {
        return state;
      }

      // 6B: Entropy Control (Immune to BLIND/BANNED)
      if (state.equippedAltarSkills.includes('6B') && (name === 'Blind' || name === 'Banned')) {
        return state;
      }

      const newConditions = new Map<string, Condition>(state.player.conditions);
      applyCondition(newConditions, name, duration, desc, data);

      // 3B-2: Acclimatization (Regen on debuff damage / debuff application)
      const isDebuff = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating', 'Decreasing accuracy', 'Neurotoxicity', 'Dehydration'].includes(name);
      if (isDebuff && state.equippedAltarSkills.includes('3B-2')) {
        let healAmount = Math.floor(state.player.maxHp * 0.05); // 5% of Max HP
        applyCondition(newConditions, 'Regenerating', 3, '', { amount: healAmount });
      }

      let newMaxHp = state.player.maxHp;
      if (name === 'Debilitating') {
        newMaxHp = Math.floor((state.player.baseMaxHp || 200) * 0.8);
      }

      // v2.3.6: If applying Immune, remove all current debuffs
      if (name === 'Immune') {
        const debuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating', 'Neurotoxicity', 'Dehydration'];
        debuffs.forEach(d => newConditions.delete(d));
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

  // MUDDED Status implementation
  applyMudStatus: (count: number) => set((state) => {
    const hand = [...state.playerHand];
    const validIndices = hand
      .map((c, i) => (c && !c.isBlind && !c.isBanned && !c.isMudded) ? i : -1)
      .filter(i => i !== -1);

    const validCards = state.playerHand.filter(c => c !== null && !c.isBlind && !c.isBanned && !c.isMudded) as Card[];
    if (validCards.length === 0) return state;

    const indices = validCards.map(c => state.playerHand.indexOf(c));
    const targetIndices: number[] = [];
    for (let i = 0; i < count && indices.length > 0; i++) {
      const randIdx = Math.floor(Math.random() * indices.length);
      targetIndices.push(indices.splice(randIdx, 1)[0]);
    }

    const newHand = [...state.playerHand];
    targetIndices.forEach(idx => {
      const card = newHand[idx];
      if (card) {
        newHand[idx] = { ...card, isMudded: true, mudDuration: 2 };
      }
    });

    return { playerHand: newHand };
  }),

  applyPetrifyStatus: (count: number) => set((state) => {
    // Candidates: !isBlind && !isBanned && !isMudded && !isPetrified
    const validCards = state.playerHand.filter(c =>
      c !== null && !c.isBlind && !c.isBanned && !c.isMudded && !c.isPetrified
    ) as Card[];

    if (validCards.length === 0) return state;

    const indices = validCards.map(c => state.playerHand.indexOf(c));
    const targetIndices: number[] = [];
    for (let i = 0; i < count && indices.length > 0; i++) {
      const randIdx = Math.floor(Math.random() * indices.length);
      targetIndices.push(indices.splice(randIdx, 1)[0]);
    }

    const newHand = [...state.playerHand];
    targetIndices.forEach(idx => {
      const card = newHand[idx];
      if (card) {
        // Petrify duration: 2 turns (Turns into 2 here, then decrements at end of turn)
        newHand[idx] = { ...card, isPetrified: true, petrifyDuration: 2 };
      }
    });

    return { playerHand: newHand };
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
  // v2.3.2: Puzzle Gimmick
  puzzleTarget: 0,
  setPuzzleTarget: (target) => set({ puzzleTarget: target }),

  swapCards: (indices, isFree) => set((state) => {
    // 6A-2: Probability Alignment (Get majority suit)
    let majoritySuit: string | null = null;
    if (state.equippedAltarSkills.includes('6A-2')) {
      const suits: Record<string, number> = {};
      state.playerHand.forEach(c => {
        if (c && !c.isJoker && c.suit) {
          suits[c.suit] = (suits[c.suit] || 0) + 1;
        }
      });
      let maxCount = 0;
      for (const s in suits) {
        if (suits[s] > maxCount) {
          maxCount = suits[s];
          majoritySuit = s;
        }
      }
    }

    const newHand = [...state.playerHand];
    let drawsToConsume = isFree ? 0 : 1;

    // 4A-3: Probability Distortion (25% chance to not consume a swap chance)
    if (state.equippedAltarSkills.includes('4A-3') && Math.random() < 0.25) {
      drawsToConsume = 0;
      set({ message: 'PROBABILITY DISTORTION +1' });
    }

    const newCards = state.deck.draw(indices.length, state.playerHand, {
      majoritySuit,
      forceSameRank: state.equippedAltarSkills.includes('6B-2')
    });

    indices.forEach((idx, i) => {
      if (idx >= 0 && idx < 8) {
        newHand[idx] = newCards[i];
      }
    });

    return {
      playerHand: newHand,
      player: {
        ...state.player,
        drawsRemaining: (state.player.drawsRemaining ?? 0) - drawsToConsume
      }
    };
  }),
  // Deck
  setDeck: (deck) => set({ deck }),

  // Initialization
  initGame: (chapterId: string, stageId: number) => {
    set((state) => {
      const chapter = CHAPTERS[chapterId];
      const stageConfig = chapter?.stages[stageId];
      if (!stageConfig) return state;

      const config = DIFFICULTY_CONFIGS[state.difficulty];

      // v2.0.0.17: Boss Damage Reduction as Condition
      const botConditions = new Map<string, Condition>();
      if (chapterId === '1') {
        const baseReduction = stageId === 10 ? 15 : (stageId >= 8 ? 10 : 0);
        const damageReduction = (config.bossOverrides[chapterId]?.[stageId] || {}).damageReduction ?? baseReduction;

        if (damageReduction > 0) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: damageReduction });
        }
      } else if (chapterId === '2A') {
        // Chapter 2A Boss Passives
        const avoidStages: Record<number, number> = { 2: 0.10, 3: 0.08, 6: 0.15 };
        const drStages: Record<number, number> = { 2: 5, 3: 5, 4: 15, 5: 20, 7: 30, 8: 10, 9: 15, 10: 40 };
        const regenStages: Record<number, number> = { 2: 5, 3: 10, 4: 10, 5: 15, 8: 10, 9: 15, 10: 15 };

        const avoidChance = avoidStages[stageId];
        const drPercent = drStages[stageId];
        const regenAmount = regenStages[stageId];

        if (avoidChance !== undefined) {
          applyCondition(botConditions, 'Avoiding', 9999, '', { chance: avoidChance });
        }
        if (drPercent !== undefined) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: drPercent });
        }
        if (regenAmount !== undefined) {
          applyCondition(botConditions, 'Regenerating', 9999, `At the end of each turn, restores ${regenAmount} HP.`, { amount: regenAmount });
        }

        if (stageId === 6) {
          applyCondition(botConditions, 'Triple Attack', 9999);
        }
        // Stage 11: SAND DRAGON (Pre-awakening Passives)
        if (stageId === 11) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 30 });
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 10 });
          applyCondition(botConditions, 'Triple Attack', 9999);
        }
      } else if (chapterId === '2B') {
        if (stageId === 11) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
          applyCondition(botConditions, 'Reflection', 9999, '', { chance: 30, percent: 10 });
        }
      } else if (chapterId === '3A') {
        // ── 챕터 3A 공통: 메아리(Echo) 조건 부여 ──────────────────────
        applyCondition(botConditions, 'Echo', 9999, '', { chance: 0.20, damageScale: 0.70 });

        // ── 스테이지별 패시브 ────────────────────────────────────────────
        // 3A-1 SLIME: 재생 +2/턴
        if (stageId === 1) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 2 });
        }
        // 3A-2 VAMPIRE BAT: 흡혈 30%
        if (stageId === 2) {
          applyCondition(botConditions, 'Hematophagy', 9999, '', { percent: 30 });
        }
        // 3A-6 CAVE BEAR: 피해경감 15%
        if (stageId === 6) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
        }
        // 3A-7 CRYSTAL GOLEM: 초기 피해경감 10% (brittle 스택 카운터: stackCount)
        if (stageId === 7) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 10 });
          applyCondition(botConditions, 'Brittle', 9999, '', { stackCount: 0, maxStacks: 5 });
        }
        // 3A-8 DRAKE: 피해경감 15%
        if (stageId === 8) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
        }
        // 3A-9 BASILISK: 피해경감 15%
        if (stageId === 9) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
        }
        // 3A-10 HYDRA: 피해경감 15% + 부활 4회 (60% HP)
        if (stageId === 10) {
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
          applyCondition(botConditions, 'Revival', 9999, '', { count: 4, limit: 4, percent: 60 });
          set({ hydraReviveRemaining: 4 });
        }
      } else if (chapterId === '3B') {
        // ── 챕터 3B 공통: 잠김(Swamping) 플레이어 상태이상 부여 ────────
        // (플레이어 conditions는 아래 player 초기화 시 추가)

        // ── 스테이지별 패시브 ────────────────────────────────────────────
        // 3B-1 SWAMP WOLFTURTLE: 재생+5, 피해경감 15%, 데미지반사 10%
        if (stageId === 1) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 5 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
          applyCondition(botConditions, 'Reflection', 9999, '', { chance: 1.0, percent: 10 });
        }
        // 3B-2 MURLOC: 재생+10, 피해경감 10%
        if (stageId === 2) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 10 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 10 });
        }
        // 3B-3 CROCODILE: 재생+15, 피해경감 12%
        if (stageId === 3) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 15 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 12 });
        }
        // 3B-4 LIZARD SKINK: 재생+15, 피해경감 10%
        if (stageId === 4) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 15 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 10 });
        }
        // 3B-5 LIZARD MAN: 재생+15, 피해경감 12%
        if (stageId === 5) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 15 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 12 });
        }
        // 3B-6 LIZARD SLANN: 패시브 없음
        // 3B-7 LIZARD SAURUS: 패시브 없음
        // 3B-8 TROGLODON: 재생(매 턴 종료 시 마다, +15), 피해경감(12%)
        if (stageId === 8) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 15 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 12 });
        }
        // 3B-9 LIZARD KROXIGOR: 재생+20, 피해경감 15%
        if (stageId === 9) {
          applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 20 });
          applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
        }
        // 3B-10 LIZARD KING: 줄기세포 (매 턴 종료: maxHp+10, 20% 회복, ATK+2, 회피+2%)
        if (stageId === 10) {
          applyCondition(botConditions, 'Stem Cell', 9999, '', {
            maxHpGrowth: 10,
            healPercent: 20,
            atkGrowth: 2,
            avoidGrowth: 2,
            currentAvoid: 0,
          });
        }
      }

      // Boss stat overrides based on difficulty
      const bossOverride = config.bossOverrides[chapterId]?.[stageId] || {};
      const bossHp = bossOverride.hp ?? Math.floor(stageConfig.hp * config.hpScale);
      const bossAtk = bossOverride.atk ?? Math.floor(stageConfig.atk * config.atkScale);

      let activeSkills = state.equippedAltarSkills || [];

      const isChapterTransition = stageId === 1 && state.chapterNum && state.chapterNum !== chapterId;

      // v2.5.1: 새 게임 시작 시에만 제단 프리셋에서 스킬을 가져옴
      // 스테이지/챕터 전환 시에는 현재 런 세션의 스킬을 유지 (프리셋 변경 악용 방지)
      if (stageId === 1 && !isChapterTransition) {
        const altarData = AltarManager.getAltarData();
        if (state.difficulty === Difficulty.HARD) {
          activeSkills = altarData.hard?.equippedSkills || [];
        } else if (state.difficulty === Difficulty.HELL) {
          activeSkills = altarData.hell?.equippedSkills || [];
        } else {
          activeSkills = altarData.normal?.equippedSkills || [];
        }
      }

      let player: Character;

      if (stageId === 1 && !isChapterTransition) {
        // Start of Game - Reset Stats + Apply Altar Bonuses
        player = calculateInitialPlayer(config, activeSkills, chapterId, state.difficulty, state.hasStage6Bonus);
      } else if (isChapterTransition) {
        // Start of New Chapter - Preserve previous HP (with chapter clear bonus) but update maxHp/conditions
        const basePlayer = calculateInitialPlayer(config, activeSkills, chapterId, state.difficulty, state.hasStage6Bonus);
        player = {
          ...basePlayer,
          hp: Math.min(basePlayer.maxHp, state.player.hp)
        };
      } else {
        // Stage transition - preserve current HP and max HP
        player = {
          ...state.player,
          hp: state.player.hp,
          maxHp: state.player.maxHp,
          baseMaxHp: state.player.baseMaxHp || config.playerHp,
          drawsRemaining: config.swapCount,
          conditions: new Map(state.player.conditions),
        };

        // Ensure Avoiding/Dehydration are updated if necessary (e.g. Chapter change)
        const isOnenessWithNature = activeSkills.includes('2B');
        if (chapterId === '2B' && !isOnenessWithNature) {
          player.conditions.delete('Avoiding');
        } else if (chapterId !== '2B' && config.avoidChance > 0 && !player.conditions.has('Avoiding')) {
          const bonus = isOnenessWithNature ? 0.05 : 0;
          applyCondition(player.conditions, 'Avoiding', 9999, '', { chance: config.avoidChance + bonus });
        }

        if (chapterId === '2A' && !player.conditions.has('Dehydration')) {
          const dehydrationDmg = {
            [Difficulty.EASY]: 1,
            [Difficulty.NORMAL]: 2,
            [Difficulty.HARD]: 3,
            [Difficulty.HELL]: 4
          }[state.difficulty] || 2;
          applyCondition(player.conditions, 'Dehydration', 9999, '', { amount: dehydrationDmg });
        }

        // 3B 챕터 진입 시 기존 Swamping 제거 후 재부여 (스테이지마다 초기화)
        if (chapterId === '3B') {
          player.conditions.delete('Swamping');
        }
      }

      // 3B 챕터: 스테이지 시작 시마다 플레이어에게 Swamping 부여
      if (chapterId === '3B') {
        applyCondition(player.conditions, 'Swamping', 9999, '', { attackCount: 0 });
      }

      // 4A-2: Bottom Deal (+5% Joker probability)
      const bonusJoker = activeSkills.includes('4A-2') ? 0.05 : 0;
      const newDeck = new Deck(config.jokerProbability + bonusJoker);

      const initialHand = new Array(8).fill(null);

      let stage6Hp = state.stage6EntryHp;
      if (chapterId === '1' && stageId === 6) {
        stage6Hp = state.player.hp;
      }

      // RESET STAGE-BASED SKILL USES
      const newSkillUses = { ...state.altarSkillUses };

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
        bannedIndices: [],
        hasStage6Bonus: (chapterId === '1' && stageId === 1) ? false : state.hasStage6Bonus,
        equippedAltarSkills: activeSkills,
        player: player,
        altarSkillUses: newSkillUses,

        stageSkillsTriggered: [],
        consecutiveHandType: null,
        consecutiveHandStacks: 0,
        // Reset 3B-10 Boss states when not already destroyed or when it's a new chapter/stage
        lizardKingStraightCount: (chapterId === '3B' && stageId === 10 && !state.lizardStemCellDestroyed) ? 0 :
                                 (chapterId === '3B' && stageId === 10 && state.lizardStemCellDestroyed) ? state.lizardKingStraightCount : 0,
        lizardStemCellDestroyed: (chapterId === '3B' && stageId === 10) ? state.lizardStemCellDestroyed : false,
        bot: {
          name: stageConfig.bossName,
          hp: bossHp,
          maxHp: bossHp,
          atk: bossAtk,
          level: stageConfig.level,
          conditions: botConditions,
          activeRules: [],
          accuracy: stageConfig.accuracy ?? 1.0,
          isBossVisible: true,
        },
        deck: newDeck,
        isPaused: false,
        stage10RuleText: '',
        stageRulesApplied: false,
        puzzleTarget: 0,
        message: '',
        dyschromatopsiaUses: 0,
        isDyschromatopsiaActive: false,
        holdBreathCount3B: 0,
        holdBreathTurn3B: -1,
        holdBreathInvulnerable3B: false,
      };
    });
    // Immediately apply rules for turn 0
    get().applyStageRules(chapterId, stageId, 0);
  },

  scorePreviewHUDPos: { x: 800, y: 380 }, // Default gap area
  setScorePreviewHUDPos: (pos) => set({ scorePreviewHUDPos: pos }),

  isVictoryFanfareActive: false,
  setIsVictoryFanfareActive: (isVictoryFanfareActive) => set({ isVictoryFanfareActive }),

  applyStageRules: (chapterId: string, stageId: number, turn: number) => {
    applyStageRulesImplementation(get, set, chapterId, stageId, turn);
  },

  resetGame: () =>
    set({
      gameState: GameState.MENU,
      stageNum: 1,
      currentTurn: 0,
      playerHand: new Array(8).fill(null),
      deck: new Deck(),
      blindIndices: [],
      bannedIndices: [],
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
        isBossVisible: true,
      },
      message: '',
      isGameLoaded: false,
      // Hidden Scenario Reset
      ch1PerfectCount: 0,
      specialQualify: false,
      ch2PerfectCount: 0,
      ch2SpecialQualify: false,
      lizardKingStraightCount: 0,
      lizardStemCellDestroyed: false,
    }),

  saveGame: (slot: number) => {
    const state = get();
    // Block saving during tutorial or active combat processing
    if (state.isTutorial) {
      console.log("Saving is blocked during tutorial.");
      return;
    }
    if (state.isProcessing) {
      const msg = state.language === 'KR' ? "전투 중에는 저장할 수 없습니다." : "Cannot save during combat.";
      state.setMessage(msg);
      console.log(msg);
      return;
    }

    SaveManager.saveGame(slot, buildSavePayload(state));
  },

  forceSaveGame: (slot: number) => {
    const state = get();
    SaveManager.saveGame(slot, buildSavePayload(state));
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
      chapterNum: '1', // v2.4.9: Ensure Tutorial uses Chapter 1 assets
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
        isBossVisible: true,
        activeRules: [],
      },
      playerHand: tutorialHand,
      deck: new Deck(0),
      message: "TUTORIAL START",
      equippedAltarSkills: [], // Disable Altar skills during Tutorial
    });
  },

  loadGame: async (slot: number) => {
    const gameData = SaveManager.loadGame(slot);
    if (!gameData) return;

    // Preload assets before restoring state to avoid render pop-in
    set({ loadingPhase: 'GAME_ENTRY', loadingProgress: 0 });
    const preloadChapter = gameData.chapterNum || '1';
    const preloadSkills = gameData.equippedAltarSkills || [];
    try {
      const assetsToLoad = getGameEntryAssets(preloadChapter, preloadSkills);
      await preloadManager.preloadBatch(assetsToLoad, (progress) => {
        set({ loadingProgress: progress });
      });
    } catch (e) {
      console.warn("Preload failed partially, continuing load", e);
    }
    set({ loadingPhase: 'NONE' });

    set({
        chapterNum: gameData.chapterNum || '1',
        stageNum: gameData.stageNum,
        difficulty: gameData.difficulty,
        currentTurn: gameData.currentTurn,
        player: gameData.player,
        bot: gameData.bot,
        playerHand: gameData.playerHand as (Card | null)[],
        isGameLoaded: true,
        puzzleTarget: gameData.puzzleTarget || 0,
        // Hidden Scenario
        ch1PerfectCount: gameData.ch1PerfectCount ?? 0,
        specialQualify: gameData.specialQualify ?? false,
        ch2PerfectCount: gameData.ch2PerfectCount ?? 0,
        ch2SpecialQualify: gameData.ch2SpecialQualify ?? false,

        lizardKingStraightCount: gameData.lizardKingStraightCount ?? 0,
        lizardStemCellDestroyed: gameData.lizardStemCellDestroyed ?? false,

        message: "Game Loaded.",
        hasStage6Bonus: gameData.hasStage6Bonus ?? false,
        gameState: gameData.gameState || GameState.BATTLE,
        gamePhase: gameData.gamePhase || 'IDLE',
        // v2.5.1: 세이브 파일의 장착 스킬 스냅샷 복원 (현재 제단 프리셋 무시)
        equippedAltarSkills: gameData.equippedAltarSkills || [],
        
        // v2.5.3: Altar 스킬 내부 상태 및 전투 연속성 데이터 복원
        altarSkillUses: gameData.altarSkillUses || {},
        dyschromatopsiaUses: gameData.dyschromatopsiaUses ?? 0,
        isDyschromatopsiaActive: gameData.isDyschromatopsiaActive ?? false,
        stageSkillsTriggered: gameData.stageSkillsTriggered || [],
        consecutiveHandType: gameData.consecutiveHandType || null,
        consecutiveHandStacks: gameData.consecutiveHandStacks ?? 0,
        stage10RuleText: gameData.stage10RuleText || '',
    });

    // Restore Deck State
    if (gameData.deckState) {
      const restoredDeck = new Deck(gameData.deckState.jokerProbability);
      restoredDeck.cards = gameData.deckState.cards;
      restoredDeck.consecutiveJokers = gameData.deckState.consecutiveJokers;
      restoredDeck.consecutiveRoyals = gameData.deckState.consecutiveRoyals;

      // Critical Fix: Shuffle deck upon load to ensure non-deterministic RNG for future draws (SWAP)
      restoredDeck.shuffle();

      set({ deck: restoredDeck });
    }

    // Restore pending trophies
    if (gameData.pendingTrophies) {
      AltarManager.setPendingTrophies(gameData.pendingTrophies);
    }

    // Re-apply rules to populate UI states (especially for Stage 10 rule text)
    get().applyStageRules(gameData.chapterNum || '1', gameData.stageNum, gameData.currentTurn);
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
    return [Difficulty.EASY];
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
  clearPopupDifficulty: null,
  setClearPopupDifficulty: (diff: Difficulty | null) => set({ clearPopupDifficulty: diff }),
  syncDifficulties: () => {
    try {
      const saved = localStorage.getItem(UNLOCKED_DIFFICULTIES_KEY);
      if (saved) {
        set({ unlockedDifficulties: JSON.parse(saved) as Difficulty[] });
      } else {
        set({ unlockedDifficulties: [Difficulty.EASY] });
      }
    } catch { }
  },
  initGameWithDifficulty: async (chapterId: string, stageId: number, difficulty?: Difficulty) => {
    const store = get();
    store.setLoadingPhase('GAME_ENTRY');
    store.setLoadingProgress(0);

    const diff = difficulty ?? (store.difficulty as Difficulty);
    const config = DIFFICULTY_CONFIGS[diff];
    const chapter = CHAPTERS[chapterId];
    const stageConfig = chapter?.stages[stageId];
    if (!stageConfig) return;

    // Boss stat overrides
    const bossOverride = config.bossOverrides[chapterId]?.[stageId] || {};
    const bossHp = bossOverride.hp ?? Math.floor(stageConfig.hp * config.hpScale);
    const bossAtk = bossOverride.atk ?? Math.floor(stageConfig.atk * config.atkScale);

    // v2.3.2: 2A Passive System
    let bossDamageReduction = 0;
    let bossAvoidChance = 0;

    if (chapterId === '2A') {
      const drStages: Record<number, number> = { 4: 15, 5: 20, 7: 30, 8: 10, 9: 10, 10: 40 };
      const avoidStages: Record<number, number> = { 2: 10, 3: 8, 6: 15 };
      bossDamageReduction = drStages[stageId] || 0;
      bossAvoidChance = (avoidStages[stageId] || 0) / 100;
    } else {
      bossDamageReduction = bossOverride.damageReduction ?? (stageId === 10 ? 15 : (stageId >= 8 ? 10 : 0));
    }

    const newDeck = new Deck(config.jokerProbability);
    const initialHand = new Array(8).fill(null);

    // Boss Conditions - Passive Skills
    const botConditions = new Map<string, Condition>();
    if (bossDamageReduction > 0) {
      applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: bossDamageReduction });
    }
    if (bossAvoidChance > 0) {
      applyCondition(botConditions, 'Avoiding', 9999, '', { chance: bossAvoidChance });
    }
    // Stage 6 Triple Attack
    if (chapterId === '2A' && stageId === 6) {
      applyCondition(botConditions, 'Triple Attack', 9999);
    }

    // ── 챕터 3A 보스 패시브 (initGameWithDifficulty) ──
    if (chapterId === '3A') {
      // 공통: 메아리(Echo)
      applyCondition(botConditions, 'Echo', 9999, '', { chance: 0.20, damageScale: 0.70 });

      if (stageId === 1) {
        applyCondition(botConditions, 'Regenerating', 9999, '', { amount: 2 });
      }
      if (stageId === 2) {
        applyCondition(botConditions, 'Hematophagy', 9999, '', { percent: 30 });
      }
      if (stageId === 6) {
        applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
      }
      if (stageId === 7) {
        applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 10 });
        applyCondition(botConditions, 'Brittle', 9999, '', { stackCount: 0, maxStacks: 5 });
      }
      if (stageId === 8) {
        applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
      }
      if (stageId === 9) {
        applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
      }
      if (stageId === 10) {
        applyCondition(botConditions, 'Damage Reducing', 9999, '', { percent: 15 });
        applyCondition(botConditions, 'Revival', 9999, '', { count: 4, limit: 4, percent: 60 });
        set({ hydraReviveRemaining: 4 });
      }
    }

    // v2.4.0: Fetch specific difficulty altar data on game start
    const altarData = AltarManager.getAltarData();
    let currentEquippedSkills: string[] = [];
    if (diff === Difficulty.HARD) {
      currentEquippedSkills = altarData.hard?.equippedSkills || [];
    } else if (diff === Difficulty.HELL) {
      currentEquippedSkills = altarData.hell?.equippedSkills || [];
    } else {
      currentEquippedSkills = altarData.normal?.equippedSkills || [];
    }

    const player = calculateInitialPlayer(config, currentEquippedSkills, chapterId, diff, false); // New game starts without bonus

    // Preload Assets for Game Entry
    const assetsToLoad = getGameEntryAssets(chapterId, currentEquippedSkills);
    try {
      await preloadManager.preloadBatch(assetsToLoad, (progress) => {
        set({ loadingProgress: progress });
      });
    } catch (e) {
      console.warn("Preload failed partially, continuing game init", e);
    }
    
    set({ loadingPhase: 'NONE' });

    set({
      chapterNum: chapterId,
      stageNum: stageId,
      difficulty: diff,
      gameState: GameState.BATTLE,
      currentTurn: 0,
      playerHand: initialHand,
      stage6EntryHp: player.maxHp,
      bannedRanks: [],
      bannedSuit: null,
      bannedHand: null,
      blindIndices: [],
      bannedIndices: [],
      hasStage6Bonus: false,
      isGameLoaded: false,
      equippedAltarSkills: currentEquippedSkills,
      player: player,
      bot: {
        name: stageConfig.bossName,
        hp: bossHp,
        maxHp: bossHp,
        atk: bossAtk,
        level: stageConfig.level,
        conditions: botConditions,
        activeRules: [],
        isBossVisible: true,
      },
      deck: newDeck,
      isPaused: false,
      stage10RuleText: '',
      stageRulesApplied: false,
      puzzleTarget: 0,
      message: '',
      clearPopupDifficulty: null,
    });
    // Immediately apply rules for turn 0
    get().applyStageRules(chapterId, stageId, 0);
  },

}));

function buildSavePayload(state: GameStoreState) {
  // Normalization for STAGE_CLEAR (Boss HP <= 0)
  const isBossDefeated = state.bot.hp <= 0;
  const finalGamePhase = isBossDefeated ? 'BOSS_DEFEATED' : state.gamePhase;
  // When normalization, clear selected cards and prevent further input
  const finalPlayerHand = isBossDefeated ? state.playerHand.map(c => c) : state.playerHand;

  return {
    chapterNum: state.chapterNum,
    stageNum: state.stageNum,
    difficulty: state.difficulty,
    currentTurn: state.currentTurn,
    player: state.player,
    bot: state.bot,
    playerHand: finalPlayerHand,
    deckState: {
      cards: state.deck.cards,
      jokerProbability: state.deck.jokerProbability,
      consecutiveJokers: state.deck.consecutiveJokers,
      consecutiveRoyals: state.deck.consecutiveRoyals,
    },
    equippedAltarSkills: state.equippedAltarSkills,
    pendingTrophies: AltarManager.getPendingTrophies(),
    puzzleTarget: state.puzzleTarget,
    // v2.5.3: Altar 스킬 내부 상태 및 전투 연속성 데이터 추가
    altarSkillUses: state.altarSkillUses,
    dyschromatopsiaUses: state.dyschromatopsiaUses,
    isDyschromatopsiaActive: state.isDyschromatopsiaActive,
    stageSkillsTriggered: state.stageSkillsTriggered,
    consecutiveHandType: state.consecutiveHandType,
    consecutiveHandStacks: state.consecutiveHandStacks,
    stage10RuleText: state.stage10RuleText,
    // Hidden Scenario
    ch1PerfectCount: state.ch1PerfectCount,
    specialQualify: state.specialQualify,
    ch2PerfectCount: state.ch2PerfectCount,
    ch2SpecialQualify: state.ch2SpecialQualify,
    lizardKingStraightCount: state.lizardKingStraightCount,
    lizardStemCellDestroyed: state.lizardStemCellDestroyed,
    hasStage6Bonus: state.hasStage6Bonus,
    gameState: state.gameState,
    gamePhase: finalGamePhase,
  };
}
