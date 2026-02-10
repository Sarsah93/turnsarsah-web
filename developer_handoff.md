# Developer Handoff: TurnSarsah-web

This document summarizes the current architecture, recent logic refinements (V11-V14), and critical considerations for future development.

## 1. Project Overview
- **Framework**: Vite + React + TypeScript
- **State Management**: Zustand (`src/state/gameStore.ts`)
- **Combat Logic**: Custom hook (`src/logic/useGameLoop.ts`)
- **Card Engine**: `src/types/Card.ts`, `src/logic/damageCalculation.ts`

### Chapter System (V15)
- **Nested Structure**: `stages.ts` now uses `CHAPTERS[chapterId].stages[stageId]` instead of a flat `STAGES` record.
- **State Extension**: `useGameStore` now includes `chapterNum`. All initialization methods (`initGame`, `initGameWithDifficulty`) and logic hooks (`applyStageRules`) are refactored to be chapter-aware.
- **UI Format**: All stage-related labels (BossDisplay, Victory screen) now follow the `CHAPTER X_STAGE Y` format for better scalability as new content is added.

### Boss Scaling & Balancing (V11-V14)
- **Conditional Scaling**: Stage 7 (+10 ATK) and Stage 9 (2x ATK) scaling is triggered in `executeBotTurn` only if the attack is **NOT avoided** (requires a successful hit).
- **Difficulty-Based ATK Cap**:
  - EASY, NORMAL, HARD: **100 ATK**
  - HELL: **200 ATK**
  - These caps are applied globally in `useGameLoop.ts` whenever Boss ATK is modified.
- **Stage 10 Phase 2**: Triggers once when HP <= 50%. Restores 100% HP and adds +50 ATK (clamped by cap). Tracked via 'Power Awakened' condition.

### Tutorial refinements
- **Hand Preservation**: `startInitialDraw` in `useGameLoop.ts` skips the draw if a tutorial hand is already set, preventing regressions in guaranteed card patterns.
- **Joker Logic**: Dynamic detection of Joker index in `BattleScreen.tsx`. Increased auto-advance timer to 8s (was 6s).
- **Flow Control**:
  - Boss Rule (Step 14) is moved to `proceedToEndTurn` to ensure it only pops up after animations finish.
  - Manual "NEXT" buttons only for Steps 14, 16, 17.

## 3. Implementation Considerations

### State Synchronization
- **CRITICAL**: Use `store.syncBot(...)` or `store.syncPlayer(...)` when modifying multiple properties (like HP and ATK simultaneously) to avoid race conditions or state overwrite.
- **Rules & Conditions**: Rules are applied at turn start (`applyStageRules`), while conditions are resolved at turn end (`resolveStatusEffects`).

### UI & Animations
- **Marker Overlap**: Use short strings for tutorial highlights (e.g., "CLICK!" or "JOKER") to prevent adjacent markers from overlapping. Card slots are 80px wide.
- **Sequence Timing**: `useGameLoop.ts` uses `await new Promise(r => setTimeout(r, ...))` to sequence combat phases. When adding new effects, ensure they are awaited correctly to maintain visual sync.

## 4. Known Data Keys
- **Zustand Store**: `useGameStore`
- **LocalStorage**: `turnsarsah_save_slot_X`, `unlocked_difficulties`

## 5. Future Roadmap
- [ ] Add visual "Stage Transition" screen (currently handled by `triggerTransition`).
- [ ] Improve Deck visualization (remaining cards display).
- [ ] Balance Hell difficulty further (current cap 200).

---
**Maintained by: Antigravity AI**
