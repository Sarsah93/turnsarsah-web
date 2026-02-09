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
  const jokerCount = jokers.length;
  const nonJokerCount = nonJokers.length;

  // Case 1: All jokers (no non-joker cards)
  if (nonJokerCount === 0) {
    const allIndices = jokers.map((j: any) => j.originalIndex);
    if (jokerCount >= 5) {
      return { type: 'Royal Flush', bonus: HAND_BONUSES.ROYAL_FLUSH, scoringIndices: allIndices };
    } else if (jokerCount === 4) {
      return { type: 'Four of a Kind', bonus: HAND_BONUSES.FOUR_OF_A_KIND, scoringIndices: allIndices };
    } else if (jokerCount === 3) {
      return { type: 'Three of a Kind', bonus: HAND_BONUSES.THREE_OF_A_KIND, scoringIndices: allIndices };
    } else if (jokerCount === 2) {
      return { type: 'One Pair', bonus: HAND_BONUSES.ONE_PAIR, scoringIndices: allIndices };
    } else {
      return { type: 'High Card', bonus: HAND_BONUSES.HIGH_CARD, scoringIndices: allIndices };
    }
  }

  // Case 2: Mixed hand (jokers + non-jokers)
  const allIndices = [...nonJokers, ...jokers].map((c: any) => c.originalIndex);

  // Check if we can form Royal Flush (5 cards with 10, J, Q, K, A in same suit)
  if (totalCards === 5) {
    const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
    const nonJokerRanks = nonJokers.map((c: any) => c.rank);
    const nonJokerSuits = nonJokers.map((c: any) => c.suit);

    // All non-jokers must be royal ranks and same suit
    const areAllRoyal = nonJokerRanks.every((r: string) => royalRanks.includes(r));
    const sameSuit = nonJokerSuits.length === 0 || nonJokerSuits.every((s: string) => s === nonJokerSuits[0]);

    if (areAllRoyal && sameSuit) {
      // Check if jokers can fill the missing royal ranks
      const missingRoyals = royalRanks.filter(r => !nonJokerRanks.includes(r));
      if (missingRoyals.length <= jokerCount) {
        return { type: 'Royal Flush', bonus: HAND_BONUSES.ROYAL_FLUSH, scoringIndices: allIndices };
      }
    }
  }

  // Check for Straight Flush (including wrap-around)
  if (totalCards === 5) {
    const straightFlushResult = checkStraightFlushWithJokers(nonJokers, jokerCount);
    if (straightFlushResult) {
      return { type: 'Straight Flush', bonus: HAND_BONUSES.STRAIGHT_FLUSH, scoringIndices: allIndices };
    }
  }

  // Check for Four of a Kind
  if (totalCards >= 4) {
    const fourKindResult = checkFourOfAKindWithJokers(nonJokers, jokerCount);
    if (fourKindResult) {
      return { type: 'Four of a Kind', bonus: HAND_BONUSES.FOUR_OF_A_KIND, scoringIndices: allIndices };
    }
  }

  // Check for Full House (3+2)
  if (totalCards === 5) {
    const fullHouseResult = checkFullHouseWithJokers(nonJokers, jokerCount);
    if (fullHouseResult) {
      return { type: 'Full House', bonus: HAND_BONUSES.FULL_HOUSE, scoringIndices: allIndices };
    }
  }

  // Check for Flush (5 cards same suit)
  if (totalCards === 5) {
    const flushResult = checkFlushWithJokers(nonJokers, jokerCount);
    if (flushResult) {
      return { type: 'Flush', bonus: HAND_BONUSES.FLUSH, scoringIndices: allIndices };
    }
  }

  // Check for Straight (including wrap-around)
  if (totalCards === 5) {
    const straightResult = checkStraightWithJokers(nonJokers, jokerCount);
    if (straightResult) {
      return { type: 'Straight', bonus: HAND_BONUSES.STRAIGHT, scoringIndices: allIndices };
    }
  }

  // Check for Three of a Kind
  if (totalCards >= 3) {
    const threeKindResult = checkThreeOfAKindWithJokers(nonJokers, jokerCount);
    if (threeKindResult) {
      return { type: 'Three of a Kind', bonus: HAND_BONUSES.THREE_OF_A_KIND, scoringIndices: allIndices };
    }
  }

  // Check for Two Pair
  if (totalCards >= 4) {
    const twoPairResult = checkTwoPairWithJokers(nonJokers, jokerCount);
    if (twoPairResult) {
      return { type: 'Two Pair', bonus: HAND_BONUSES.TWO_PAIR, scoringIndices: allIndices };
    }
  }

  // Check for One Pair
  if (totalCards >= 2) {
    const onePairResult = checkOnePairWithJokers(nonJokers, jokerCount);
    if (onePairResult) {
      return { type: 'One Pair', bonus: HAND_BONUSES.ONE_PAIR, scoringIndices: allIndices };
    }
  }

  return { type: 'High Card', bonus: HAND_BONUSES.HIGH_CARD, scoringIndices: allIndices };
}

// Helper: Check if cards can form a Straight Flush with jokers
function checkStraightFlushWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 5;

  // All non-jokers must be same suit
  const suits = nonJokers.map((c: any) => c.suit);
  if (!suits.every((s: string) => s === suits[0])) return false;

  return checkStraightWithJokers(nonJokers, jokerCount);
}

// Helper: Check if cards can form a Straight with jokers (including wrap-around)
function checkStraightWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 5;

  const ranks = nonJokers.map((c: any) => RANK_VALUES[c.rank!]);
  const uniqueRanks = Array.from(new Set(ranks));

  // All valid 5-card straights (including wrap-around)
  const straights = [
    [2, 3, 4, 5, 14],      // A-2-3-4-5
    [2, 3, 4, 13, 14],     // K-A-2-3-4
    [2, 3, 12, 13, 14],    // Q-K-A-2-3
    [2, 11, 12, 13, 14],   // J-Q-K-A-2
  ];
  for (let i = 2; i <= 10; i++) {
    straights.push([i, i + 1, i + 2, i + 3, i + 4]);
  }

  for (const straight of straights) {
    const missing = straight.filter(v => !uniqueRanks.includes(v));
    if (missing.length <= jokerCount && uniqueRanks.every(r => straight.includes(r))) {
      return true;
    }
  }

  return false;
}

// Helper: Check for Four of a Kind with jokers
function checkFourOfAKindWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 4;

  const rankCounts: Record<string, number> = {};
  nonJokers.forEach((c: any) => {
    rankCounts[c.rank!] = (rankCounts[c.rank!] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(rankCounts), 0);
  return maxCount + jokerCount >= 4;
}

// Helper: Check for Full House with jokers
function checkFullHouseWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 5;

  const rankCounts: Record<string, number> = {};
  nonJokers.forEach((c: any) => {
    rankCounts[c.rank!] = (rankCounts[c.rank!] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // Need 3 of one rank and 2 of another
  let jokersNeeded = 0;
  if (counts.length >= 2) {
    jokersNeeded = Math.max(0, 3 - counts[0]) + Math.max(0, 2 - counts[1]);
  } else if (counts.length === 1) {
    // Single rank - need jokers for both parts
    if (counts[0] >= 3) jokersNeeded = 2; // Need pair
    else if (counts[0] === 2) jokersNeeded = 3; // Need triple
    else jokersNeeded = 4; // Single card, need 2 more for triple + 2 for pair
  }

  return jokersNeeded <= jokerCount && nonJokers.length + jokerCount >= 5;
}

// Helper: Check for Flush with jokers
function checkFlushWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 5;

  const suits = nonJokers.map((c: any) => c.suit);
  return suits.every((s: string) => s === suits[0]) && nonJokers.length + jokerCount >= 5;
}

// Helper: Check for Three of a Kind with jokers
function checkThreeOfAKindWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 3;

  const rankCounts: Record<string, number> = {};
  nonJokers.forEach((c: any) => {
    rankCounts[c.rank!] = (rankCounts[c.rank!] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(rankCounts), 0);
  return maxCount + jokerCount >= 3;
}

// Helper: Check for Two Pair with jokers
function checkTwoPairWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 4;

  const rankCounts: Record<string, number> = {};
  nonJokers.forEach((c: any) => {
    rankCounts[c.rank!] = (rankCounts[c.rank!] || 0) + 1;
  });

  const pairs = Object.values(rankCounts).filter(c => c >= 2).length;
  const singles = Object.values(rankCounts).filter(c => c === 1).length;

  if (pairs >= 2) return true;
  if (pairs === 1 && jokerCount >= 2) return true; // Jokers form second pair
  if (pairs === 1 && singles >= 1 && jokerCount >= 1) return true; // Joker pairs with single
  if (singles >= 2 && jokerCount >= 2) return true; // Jokers pair with two singles

  return false;
}

// Helper: Check for One Pair with jokers
function checkOnePairWithJokers(nonJokers: any[], jokerCount: number): boolean {
  if (nonJokers.length === 0) return jokerCount >= 2;

  const rankCounts: Record<string, number> = {};
  nonJokers.forEach((c: any) => {
    rankCounts[c.rank!] = (rankCounts[c.rank!] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(rankCounts), 0);
  return maxCount + jokerCount >= 2;
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
