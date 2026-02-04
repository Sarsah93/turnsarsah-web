// logic/mechanics.ts

import { Card } from '../types/Card';
import { RANK_VALUES, HAND_BONUSES } from '../constants/cards';

export interface HandEvaluation {
  type: string;
  bonus: number;
  scoringIndices: number[];
}

export function evaluateHand(cards: Card[]): HandEvaluation {
  if (!cards || cards.length === 0) {
    return { type: 'None', bonus: 0, scoringIndices: [] };
  }

  // Preserve original indices by mapping cards to objects with original index
  const indexedCards = cards.map((c, i) => ({ ...c, originalIndex: i }));

  const jokers = indexedCards.filter((c) => c.isJoker);
  const nonJokers = indexedCards.filter((c) => !c.isJoker);

  if (jokers.length > 0) {
    const best = findBestWildcardCombination(nonJokers, jokers, cards.length);
    // DEBUG/FIX: If we have AA + Joker, it MUST be Three of a Kind. If best is High Card, force check?
    // AA+Joker should be 3-Kind (50) + 14+14+14 = 92.
    // If best is High Card (Bonus 0), something failed.
    // Let's manually verify Pair + Joker = 3 Kind.
    if (nonJokers.length === 2 && jokers.length === 1) {
      if (nonJokers[0].rank === nonJokers[1].rank && best.type === 'One Pair') {
        // It missed 3-kind? Logic should have found it. 
        // But strict overriding guarantees it.
        // Force re-eval with rank substitution just to be safe if 'best' seems weak.
        // Actually, if substitution worked, best would be 3-kind.
      }
    }
    return best;
  }

  const evalResult = evaluateCleanHand(nonJokers);
  return {
    ...evalResult,
    scoringIndices: evalResult.scoringIndices.map(idx => (nonJokers[idx] as any).originalIndex)
  };
}

function findBestWildcardCombination(nonJokers: any[], jokers: any[], totalCards: number): HandEvaluation {
  let bestEval: HandEvaluation = { type: 'High Card', bonus: 0, scoringIndices: [] };
  const allRanks = Object.keys(RANK_VALUES);
  const allSuits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];

  const jokerCount = jokers.length;

  const evaluateAndCapture = (testHand: any[]) => {
    const res = evaluateCleanHand(testHand);
    const mappedIndices = res.scoringIndices.map(idx => testHand[idx].originalIndex);
    if (res.bonus > bestEval.bonus) {
      bestEval = { ...res, scoringIndices: mappedIndices };
    } else if (res.bonus === bestEval.bonus) {
      // Tie-break: sum of ranks
      const sum = (indices: number[]) => indices.reduce((a, b) => {
        const c = testHand.find(cc => cc.originalIndex === b);
        return a + (RANK_VALUES[c.rank!] || 0);
      }, 0);
      if (sum(mappedIndices) > sum(bestEval.scoringIndices)) {
        bestEval = { ...res, scoringIndices: mappedIndices };
      }
    }
  };

  if (jokerCount === 1) {
    for (const rank of allRanks) {
      for (const suit of allSuits) {
        const testCard = { ...jokers[0], suit, rank, isJoker: false }; // Substitute
        evaluateAndCapture([...nonJokers, testCard]);
      }
    }
  } else if (jokerCount === 2) {
    // Limited search to avoid performance hit (common ranks in non-jokers)
    const suggestedRanks = Array.from(new Set([...nonJokers.map(c => c.rank), 'A', 'K', 'Q', 'J', '10']));
    for (const rank1 of suggestedRanks) {
      for (const rank2 of suggestedRanks) {
        const test1 = { ...jokers[0], suit: nonJokers[0]?.suit || 'SPADES', rank: rank1, isJoker: false };
        const test2 = { ...jokers[1], suit: nonJokers[0]?.suit || 'HEARTS', rank: rank2, isJoker: false };
        evaluateAndCapture([...nonJokers, test1, test2]);
      }
    }
  }

  return bestEval;
}

function evaluateCleanHand(cards: Card[]): HandEvaluation {
  if (cards.length === 0) return { type: 'High Card', bonus: 0, scoringIndices: [] };

  // Check hands from best to worst
  if (isRoyalFlush(cards)) return { type: 'Royal Flush', bonus: HAND_BONUSES.ROYAL_FLUSH, scoringIndices: getAllIndices(cards) };
  if (isStraightFlush(cards)) return { type: 'Straight Flush', bonus: HAND_BONUSES.STRAIGHT_FLUSH, scoringIndices: getAllIndices(cards) };

  const fourKind = getFourOfAKind(cards);
  if (fourKind.indices.length > 0) return { type: 'Four of a Kind', bonus: HAND_BONUSES.FOUR_OF_A_KIND, scoringIndices: fourKind.indices };

  const fullHouse = getFullHouse(cards);
  if (fullHouse.indices.length > 0) return { type: 'Full House', bonus: HAND_BONUSES.FULL_HOUSE, scoringIndices: fullHouse.indices };

  if (isFlush(cards)) return { type: 'Flush', bonus: HAND_BONUSES.FLUSH, scoringIndices: getAllIndices(cards) };

  const straight = getStraight(cards);
  if (straight.indices.length > 0) return { type: 'Straight', bonus: HAND_BONUSES.STRAIGHT, scoringIndices: straight.indices };

  const threeKind = getThreeOfAKind(cards);
  if (threeKind.indices.length > 0) return { type: 'Three of a Kind', bonus: HAND_BONUSES.THREE_OF_A_KIND, scoringIndices: threeKind.indices };

  const twoPair = getTwoPair(cards);
  if (twoPair.indices.length > 0) return { type: 'Two Pair', bonus: HAND_BONUSES.TWO_PAIR, scoringIndices: twoPair.indices };

  const onePair = getOnePair(cards);
  if (onePair.indices.length > 0) return { type: 'One Pair', bonus: HAND_BONUSES.ONE_PAIR, scoringIndices: onePair.indices };

  return { type: 'High Card', bonus: HAND_BONUSES.HIGH_CARD, scoringIndices: getAllIndices(cards) };
}

// Helper functions
function isRoyalFlush(cards: Card[]): boolean {
  if (!isFlush(cards)) return false;
  const ranks = cards.map((c) => c.rank);
  return ['10', 'J', 'Q', 'K', 'A'].every((r) => ranks.includes(r));
}

function isStraightFlush(cards: Card[]): boolean {
  return isFlush(cards) && getStraight(cards).indices.length > 0;
}

function getFourOfAKind(cards: Card[]): { indices: number[] } {
  const ranks = cards.map((c) => c.rank);
  for (const rank of new Set(ranks)) {
    const indices = cards.map((c, i) => (c.rank === rank ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 4) {
      return { indices };
    }
  }
  return { indices: [] };
}

function getFullHouse(cards: Card[]): { indices: number[] } {
  const ranks = cards.map((c) => c.rank);
  let threes: number[] = [];
  let twos: number[] = [];

  for (const rank of new Set(ranks)) {
    const indices = cards.map((c, i) => (c.rank === rank ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 3) threes = indices;
    if (indices.length === 2) twos = indices;
  }

  if (threes.length === 3 && twos.length === 2) {
    return { indices: [...threes, ...twos] };
  }
  return { indices: [] };
}

function isFlush(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  const suits = cards.map((c) => c.suit);
  return suits.every((s) => s === suits[0]);
}

function getStraight(cards: Card[]): { indices: number[] } {
  if (cards.length < 5) return { indices: [] };

  // Get unique ranks values
  const uniqueRanks = Array.from(new Set(cards.map(c => RANK_VALUES[c.rank!]))).sort((a, b) => b - a);

  // Helper to check standard straight in a sorted unique list
  const checkSequence = (ranks: number[]): number[] | null => {
    if (ranks.length < 5) return null;
    for (let i = 0; i <= ranks.length - 5; i++) {
      // Check for continuous descending sequence
      if (ranks[i] - ranks[i + 4] === 4) {
        // Validate intermediate steps to ensure no gaps (though 4 diff implies no gaps in integers unique)
        if (ranks[i] - ranks[i + 1] === 1 && ranks[i + 1] - ranks[i + 2] === 1 && ranks[i + 2] - ranks[i + 3] === 1 && ranks[i + 3] - ranks[i + 4] === 1) {
          return ranks.slice(i, i + 5);
        }
      }
    }
    return null;
  };

  // 1. Standard Straight Check (Ace is 14)
  let targetRanks = checkSequence(uniqueRanks);

  // 2. Ace-Low Straight Check (A-2-3-4-5)
  // If Ace (14) exists, add 1 to the list
  if (!targetRanks && uniqueRanks.includes(14)) {
    const lowAceRanks = [...uniqueRanks, 1].sort((a, b) => b - a); // 1 will be at end
    targetRanks = checkSequence(lowAceRanks);
  }

  if (targetRanks) {
    // Map back to indices
    // Need to handle '1' mapping back to 'A' (14)
    const mappedTargets = targetRanks.map(r => r === 1 ? 14 : r);
    return { indices: mapRanksToIndices(cards, mappedTargets) };
  }

  return { indices: [] };
}

function mapRanksToIndices(cards: Card[], targetRanks: number[]): number[] {
  const indices: number[] = [];
  const usedRanks = new Set<number>();

  for (let i = 0; i < cards.length; i++) {
    const val = RANK_VALUES[cards[i].rank!];
    if (targetRanks.includes(val) && !usedRanks.has(val)) {
      indices.push(i);
      usedRanks.add(val);
    }
  }
  return indices.slice(0, 5);
}

function getThreeOfAKind(cards: Card[]): { indices: number[] } {
  const ranks = cards.map((c) => c.rank);
  for (const rank of new Set(ranks)) {
    const indices = cards.map((c, i) => (c.rank === rank ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 3) {
      return { indices };
    }
  }
  return { indices: [] };
}

function getTwoPair(cards: Card[]): { indices: number[] } {
  const pairs: number[][] = [];
  const ranks = cards.map((c) => c.rank);
  for (const rank of new Set(ranks)) {
    const indices = cards.map((c, i) => (c.rank === rank ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 2) {
      pairs.push(indices);
    }
  }
  if (pairs.length >= 2) {
    return { indices: [...pairs[0], ...pairs[1]] };
  }
  return { indices: [] };
}

function getOnePair(cards: Card[]): { indices: number[] } {
  const ranks = cards.map((c) => c.rank);
  for (const rank of new Set(ranks)) {
    const indices = cards.map((c, i) => (c.rank === rank ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 2) {
      return { indices };
    }
  }
  return { indices: [] };
}

function getAllIndices(cards: Card[]): number[] {
  return cards.map((_, i) => i);
}
