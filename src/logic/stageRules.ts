import { TRANSLATIONS } from '../constants/translations';
import { DIFFICULTY_CONFIGS, Difficulty } from '../constants/gameConfig';
import { CHAPTERS } from '../constants/stages';
import { RANK_VALUES } from '../constants/cards';

export const applyStageRulesImplementation = (
    get: () => any, // Using any for state to break cyclic dependency easily, type cast inside
    set: (partial: any) => void,
    chapterId: string,
    stageId: number,
    turn: number
) => {
    const state = get();
    const t = TRANSLATIONS[state.language as keyof typeof TRANSLATIONS] as any;
    const config = DIFFICULTY_CONFIGS[state.difficulty as keyof typeof DIFFICULTY_CONFIGS];
    let { bannedRanks, bannedSuit, bannedHand, blindIndices, bannedIndices, bot } = state;

    bannedRanks = [];
    bannedSuit = null;
    bannedHand = null;
    blindIndices = [];
    bannedIndices = [];

    // 7B: Entropy Control — Immune to BLIND and BANNED; skip all ban/blind logic
    const has7B = state.equippedAltarSkills.includes('7B');

    const suits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    const hands = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair'];

    // v2.1.0: Only chapter 1 rules for now
    if (chapterId === '1') {
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
            if (!has7B) {
              activeStageIds.push(3); // BLIND is now Stage 3
              const indices = [0, 1, 2, 3, 4, 5, 6, 7].filter(idx => !blindIndices.includes(idx));
              for (let j = 0; j < 2 && indices.length > 0; j++) {
                const randIdx = Math.floor(Math.random() * indices.length);
                blindIndices.push(indices.splice(randIdx, 1)[0]);
              }
              ruleDescs.push('BLIND_2 CARDS');
            }
          } else if (pick === 'BAN_RANK') {
            if (!has7B) { // Changed from has6B to has7B
              activeStageIds.push(2); // BAN_RANK is now Stage 2
              const r1 = ranks[Math.floor(Math.random() * ranks.length)];
              let r2 = ranks[Math.floor(Math.random() * ranks.length)];
              while (r1 === r2) r2 = ranks[Math.floor(Math.random() * ranks.length)];
              bannedRanks = [r1, r2];
              ruleDescs.push(`BANNED_${bannedRanks.join('/')}`);
            }
          } else if (pick === 'BAN_SUIT') {
            if (!has7B) {
              activeStageIds.push(4);
              bannedSuit = suits[Math.floor(Math.random() * suits.length)];
              ruleDescs.push(`BANNED_${bannedSuit}`);
            }
          } else if (pick === 'BAN_HAND') {
            if (!has7B) {
              activeStageIds.push(6);
              bannedHand = hands[Math.floor(Math.random() * hands.length)];
              ruleDescs.push(`BANNED_${bannedHand}`);
            }
          } else if (pick === 'POISON') {
            state.addPlayerCondition('Poisoning', 4);
            ruleDescs.push('POISON');
          } else if (pick === 'ATK_UP') {
            activeStageIds.push(7);
            // Bug fix: prevent ATK_UP stacking on load/reapply
            // Only apply +10 atk if not already applied for this stage instance
            if (turn === 0 && !state.stageRulesApplied) {
              set({ bot: { ...bot, atk: bot.atk + 10 } });
            }
            ruleDescs.push('ATK_UP');
          }
        }

        const isAwakened = bot.conditions.has('Awakening');
        set({ stage10RuleText: t.RULES.CH1_RULE_10, stageRulesApplied: true });
      } else if (stageId === 99) {
        set({ stage10RuleText: 'DEBUG RULE: APPLY PETRIFY STATUS' });
        setTimeout(() => get().applyPetrifyStatus(1), 0);
      } else {
        const ch1RuleKey = `CH1_RULE_${stageId}`;
        set({ stage10RuleText: t.RULES[ch1RuleKey] || '' });

        if (stageId === 2) {
          if (!has7B) {
            const r1 = ranks[Math.floor(Math.random() * ranks.length)];
            let r2 = ranks[Math.floor(Math.random() * ranks.length)];
            while (r1 === r2) r2 = ranks[Math.floor(Math.random() * ranks.length)];
            bannedRanks = [r1, r2];
          }
        } else if (stageId === 3) {
          if (!has7B) {
            const indices = [0, 1, 2, 3, 4, 5, 6, 7];
            for (let i = 0; i < 2; i++) {
              const randIdx = Math.floor(Math.random() * indices.length);
              blindIndices.push(indices.splice(randIdx, 1)[0]);
            }
          }
        } else if (stageId === 4) {
          if (!has7B) {
            bannedSuit = suits[Math.floor(Math.random() * suits.length)];
          }
        } else if (stageId === 5 && (state.difficulty === Difficulty.HARD || state.difficulty === Difficulty.HELL)) {
          if (!has7B) {
            bannedHand = hands[Math.floor(Math.random() * hands.length)];
          }
        } else if (stageId === 6) {
          if (!has7B) {
            bannedHand = hands[Math.floor(Math.random() * hands.length)];
          }
        }
      }
    } else if (get().isTutorial) {
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
    } else if (chapterId === '2A') {
      const t = TRANSLATIONS[get().language as keyof typeof TRANSLATIONS] as any;
      const regenMap: Record<number, number> = { 2: 5, 3: 10, 4: 10, 5: 15, 8: 10, 9: 15, 10: 15 };
      const isAwakened = bot.conditions.has('Awakening');
      if (regenMap[stageId] && !bot.conditions.has('Regenerating') && !isAwakened) {
        state.addBotCondition('Regenerating', 9999, t.CONDITIONS.REGENERATING.DESC, { amount: regenMap[stageId] });
      }

      if (stageId === 1) {
        set({ stage10RuleText: t.RULES.REVIVE_50_STRAIGHT_FLUSH_DMG_0 });
      } else if (stageId === 2) {
        set({ stage10RuleText: t.RULES.ONE_PAIR_DMG_0 });
      } else if (stageId === 3) {
        set({ stage10RuleText: t.RULES.TWO_PAIR_DMG_0 });
      } else if (stageId === 4) {
        set({ stage10RuleText: t.RULES.UNDER_30_POINTS_NO_DMG });
      } else if (stageId === 5) {
        set({ stage10RuleText: t.RULES.FORCE_SWAP_2_NEUROTOXIC });
      } else if (stageId === 6) {
        set({ stage10RuleText: t.RULES.TRIPLE_ATTACK });
      } else if (stageId === 7) {
        set({ stage10RuleText: t.RULES.TWO_TIMES_PARALYZE_50 });
      } else if (stageId === 8) {
        const indices = [0, 1, 2, 3, 4, 5, 6, 7];
        const blindIdx = Math.floor(Math.random() * indices.length);
        blindIndices.push(indices.splice(blindIdx, 1)[0]);
        const banIdx = Math.floor(Math.random() * indices.length);
        bannedIndices.push(indices[banIdx]);
        set({ stage10RuleText: t.RULES.STRAIGHT_DMG_0_BLIND_1_BAN_1 });
      } else if (stageId === 9) {
        const indices = [0, 1, 2, 3, 4, 5, 6, 7];
        for (let i = 0; i < 2; i++) {
          const randIdx = Math.floor(Math.random() * indices.length);
          blindIndices.push(indices.splice(randIdx, 1)[0]);
        }
        set({ stage10RuleText: t.RULES.FLUSH_DMG_0_BLIND_2 });
      } else if (stageId === 10) {
        const validCards = state.playerHand.filter((c: any) => c !== null);
        let target = 0;
        if (validCards.length >= 5) {
          const sums: number[] = [];
          const getCombinations = (start: number, count: number, currentSum: number) => {
            if (count === 5) { sums.push(currentSum); return; }
            for (let i = start; i < validCards.length; i++) {
              const card = validCards[i];
              let cardVal = 0;
              if (card.isJoker) cardVal = 14;
              else if (card.rank === 'A') cardVal = 1;
              else if (card.rank) cardVal = RANK_VALUES[card.rank as string] || 0;
              getCombinations(i + 1, count + 1, currentSum + cardVal);
            }
          };
          getCombinations(0, 0, 0);
          if (sums.length > 0) target = sums[Math.floor(Math.random() * sums.length)];
        }
        if (target > 0) {
          set({ puzzleTarget: target, stage10RuleText: t.RULES.PUZZLE_DMG_50_AWAKEN || t.RULES.PUZZLE_DMG_50_BLIND_1_AWAKEN });
        } else if (state.puzzleTarget > 0) {
          set({ stage10RuleText: t.RULES.PUZZLE_DMG_50_AWAKEN || t.RULES.PUZZLE_DMG_50_BLIND_1_AWAKEN });
        }
      } else if (stageId === 11) {
        // Special: SAND DRAGON
        set({ stage10RuleText: t.RULES.SAND_STORM_TRIPLE_AWAKEN });
        if (!bot.conditions.has('Awakening')) {
          if (!bot.conditions.has('Damage Reducing')) {
            state.addBotCondition('Damage Reducing', 9999, '', { percent: 20 });
          }
          if (!bot.conditions.has('Regenerating')) {
            state.addBotCondition('Regenerating', 9999, '', { amount: 20 });
          }
          if (!bot.conditions.has('Triple Attack')) {
            state.addBotCondition('Triple Attack', 9999);
          }
        }
      }
    } else if (chapterId === '2B') {
      const ruleKey = (CHAPTERS['2B'].stages as any)[stageId]?.rule;
      if (ruleKey && t.RULES[ruleKey]) {
        const prefix = t.RULES.RULE_HINT || "RULE: ";
        let ruleText = t.RULES[ruleKey];
        if (!ruleText.startsWith(prefix)) ruleText = prefix + ruleText;
        set({ stage10RuleText: ruleText });
      }

      // Initial Boss Conditions for 2B
      const drMap: Record<number, number> = { 1: 5, 2: 8, 3: 10, 4: 13, 5: 11, 6: 13, 7: 15, 8: 12, 9: 17, 10: 20 };
      const drPercent = drMap[stageId];
      const isAwakened2B = bot.conditions.has('Awakening');
      if (drPercent && !bot.conditions.has('Damage Reducing') && !isAwakened2B) {
        state.addBotCondition('Damage Reducing', 9999, '', { percent: drPercent });
      }
      if (stageId === 3 && !bot.conditions.has('Avoiding')) {
        state.addBotCondition('Avoiding', 9999, '', { chance: 0.20 });
      }
      if (stageId === 8 && !bot.conditions.has('Avoiding')) {
        state.addBotCondition('Avoiding', 9999, '', { chance: 0.25 });
      }
      if ([5, 9, 10].includes(stageId) && !bot.conditions.has('Provocation')) {
        const prob = stageId === 5 ? 30 : (stageId === 9 ? 35 : 40);
        state.addBotCondition('Provocation', 9999, '', { chance: prob });
      }
      if (stageId === 6 && !bot.conditions.has('Adrenaline secretion')) {
        state.addBotCondition('Adrenaline secretion', 9999, '', { limit: 60 });
      }
      if (stageId === 11) {
        // Special: HIGH ORC SHAMAN
        const isAwakened = bot.conditions.has('Awakening');
        if (!isAwakened) {
          const indices = [0, 1, 2, 3, 4, 5, 6, 7];
          const b1 = Math.floor(Math.random() * indices.length);
          blindIndices.push(indices.splice(b1, 1)[0]);
          const b2 = Math.floor(Math.random() * indices.length);
          blindIndices.push(indices.splice(b2, 1)[0]);
          const banIdx = Math.floor(Math.random() * indices.length);
          bannedIndices.push(indices[banIdx]);
        }
        if (!isAwakened && !bot.conditions.has('Reflection')) {
          state.addBotCondition('Reflection', 9999, '', { chance: 0.3, percent: 10 });
        }
        set({ stage10RuleText: t.RULES.BLIND_BAN_REFLECTION_AWAKEN });
      }
    } else if (chapterId === '3A') {
      const ruleKey = (CHAPTERS['3A'].stages as any)[stageId]?.rule;
      if (ruleKey && (t.RULES as any)[ruleKey]) {
        set({ stage10RuleText: (t.RULES as any)[ruleKey] });
      }
    } else if (chapterId === '3B') {
      const ruleKey = (CHAPTERS['3B'].stages as any)[stageId]?.rule;
      if (ruleKey && (t.RULES as any)[ruleKey]) {
        set({ stage10RuleText: (t.RULES as any)[ruleKey] });
      }

      // 3B-1 ~ 3B-8: 재생 (+15)
      if (stageId >= 1 && stageId <= 8) {
        if (!bot.conditions.has('Regenerating')) {
          state.addBotCondition('Regenerating', 9999, t.CONDITIONS.REGENERATING.DESC, { amount: 15 });
        }
      }

      // 3B-1: 피해경감 (10%), 반사 (10%)
      if (stageId === 1) {
        if (!bot.conditions.has('Damage Reducing')) {
          state.addBotCondition('Damage Reducing', 9999, '', { percent: 10 });
        }
        if (!bot.conditions.has('Reflection')) {
          state.addBotCondition('Reflection', 9999, '', { chance: 1.0, percent: 10 });
        }
      }

      // 3B-2 ~ 3B-8: 피해경감 (12%)
      if (stageId >= 2 && stageId <= 8) {
        if (!bot.conditions.has('Damage Reducing')) {
          state.addBotCondition('Damage Reducing', 9999, '', { percent: 12 });
        }
      }

      // 3B-9: 각성 전 패시브 - 재생 (+20), 피해경감 (15%)
      if (stageId === 9) {
        if (!bot.conditions.has('Awakening')) {
          if (!bot.conditions.has('Regenerating')) {
            state.addBotCondition('Regenerating', 9999, t.CONDITIONS.REGENERATING.DESC, { amount: 20 });
          }
          if (!bot.conditions.has('Damage Reducing')) {
            state.addBotCondition('Damage Reducing', 9999, '', { percent: 15 });
          }
        }
      }

      // 3B-10: 반사 (30% 확률, 10% 반사)
      if (stageId === 10) {
        if (!bot.conditions.has('Reflection')) {
          state.addBotCondition('Reflection', 9999, '', { chance: 0.3, percent: 10 });
        }
      }
    }

    set({ bannedRanks, bannedSuit, bannedHand, blindIndices, bannedIndices });
};
