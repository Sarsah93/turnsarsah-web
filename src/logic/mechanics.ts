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
  let bestSum = 0;
  const allRanks = Object.keys(RANK_VALUES);
  const allSuits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];

  const jokerCount = jokers.length;

  const evaluateAndCapture = (testHand: any[]) => {
    const res = evaluateCleanHand(testHand);
    const mappedIndices = res.scoringIndices.map(idx => testHand[idx].originalIndex);
    const currentSum = calculateSumOfIndices(testHand, res.scoringIndices);

    // Priority 1: Hand Bonus (Tier)
    if (res.bonus > bestEval.bonus) {
      bestEval = { ...res, scoringIndices: mappedIndices };
      bestSum = currentSum;
    }
    // Priority 2: Card Sum of scoring cards (to pick higher rank combination)
    else if (res.bonus === bestEval.bonus) {
      if (currentSum > bestSum) {
        bestEval = { ...res, scoringIndices: mappedIndices };
        bestSum = currentSum;
      }
    }
  };

  const allPossibleCards: any[] = [];
  for (const r of allRanks) {
    for (const s of allSuits) {
      allPossibleCards.push({ rank: r, suit: s, isJoker: false });
    }
  }

  if (jokerCount === 1) {
    for (const card1 of allPossibleCards) {
      const test1 = { ...jokers[0], ...card1 };
      evaluateAndCapture([...nonJokers, test1]);
    }
  } else if (jokerCount === 2) {
    // 52 * 52 = 2704 combinations. This is fast enough in JS.
    for (const card1 of allPossibleCards) {
      for (const card2 of allPossibleCards) {
        // Optimization: Ensure we don't pick the exact same card if possible, 
        // though in this game duplicate cards might be allowed due to deck logic.
        // For poker logic, we treat them as independent wildcards.
        const test1 = { ...jokers[0], ...card1 };
        const test2 = { ...jokers[1], ...card2 };
        evaluateAndCapture([...nonJokers, test1, test2]);
      }
    }
  }

  return bestEval;
}

function calculateSumOfIndices(hand: any[], indices: number[]): number {
  return indices.reduce((a, b) => a + (RANK_VALUES[hand[b].rank!] || 0), 0);
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

  // Sort ranks by frequency to find full house correctly
  const counts: Record<string, number[]> = {};
  ranks.forEach((r, i) => {
    if (!counts[r!]) counts[r!] = [];
    counts[r!].push(i);
  });

  const sortedRanks = Object.keys(counts).sort((a, b) => {
    if (counts[b].length !== counts[a].length) return counts[b].length - counts[a].length;
    return RANK_VALUES[b] - RANK_VALUES[a];
  });

  if (counts[sortedRanks[0]]?.length >= 3 && counts[sortedRanks[1]]?.length >= 2) {
    return { indices: [...counts[sortedRanks[0]].slice(0, 3), ...counts[sortedRanks[1]].slice(0, 2)] };
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

  const uniqueRankValues = Array.from(new Set(cards.map(c => RANK_VALUES[c.rank!]))).sort((a, b) => a - b);

  // Possible straights (as sets of values)
  // Standard and Ace-Low already covered by logic mostly, but let's be explicit for "wrap-around"
  const straights = [
    [2, 3, 4, 5, 14],      // A-2-3-4-5
    [2, 3, 4, 13, 14],     // K-A-2-3-4
    [2, 3, 12, 13, 14],    // Q-K-A-2-3
    [2, 11, 12, 13, 14],   // J-Q-K-A-2
  ];

  // Also add standard straights
  for (let i = 2; i <= 10; i++) {
    straights.push([i, i + 1, i + 2, i + 3, i + 4]);
  }

  // Check each candidate straight
  for (const candidate of straights.reverse()) { // Reverse to check high straights first
    if (candidate.every(val => uniqueRankValues.includes(val))) {
      // Map candidate values back to indices
      const indices: number[] = [];
      const usedValues = new Set();
      for (const val of candidate) {
        const idx = cards.findIndex((c, i) => RANK_VALUES[c.rank!] === val && !usedValues.has(i));
        indices.push(idx);
      }
      return { indices };
    }
  }

  return { indices: [] };
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
  // Sort ranks to pick highest pairs
  const uniqueRanks = Array.from(new Set(cards.map(c => c.rank!))).sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);

  for (const rank of uniqueRanks) {
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
  const uniqueRanks = Array.from(new Set(cards.map(c => c.rank!))).sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);
  for (const rank of uniqueRanks) {
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
