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

  const jokers = cards.filter((c) => c.isJoker).length;
  const nonJokers = cards.filter((c) => !c.isJoker);

  if (jokers > 0) {
    return findBestWildcardCombination(nonJokers, jokers, cards.length);
  }

  return evaluateCleanHand(nonJokers);
}

function findBestWildcardCombination(nonJokers: Card[], jokerCount: number, totalCards: number): HandEvaluation {
  let bestEval = evaluateCleanHand(nonJokers);
  const allRanks = Object.keys(RANK_VALUES);
  const allSuits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];

  // Try substituting jokers with best possible cards
  if (jokerCount === 1) {
    for (const rank of allRanks) {
      for (const suit of allSuits) {
        const testCard = { suit, rank, isJoker: false, selected: false, isBlind: false, isBanned: false };
        const testHand = [...nonJokers, testCard];
        const eval_ = evaluateCleanHand(testHand);
        if (eval_.bonus > bestEval.bonus) {
          bestEval = eval_;
        }
      }
    }
  } else if (jokerCount === 2) {
    for (const rank1 of allRanks) {
      for (const suit1 of allSuits) {
        for (const rank2 of allRanks) {
          for (const suit2 of allSuits) {
            const test1 = { suit: suit1, rank: rank1, isJoker: false, selected: false, isBlind: false, isBanned: false };
            const test2 = { suit: suit2, rank: rank2, isJoker: false, selected: false, isBlind: false, isBanned: false };
            const testHand = [...nonJokers, test1, test2];
            const eval_ = evaluateCleanHand(testHand);
            if (eval_.bonus > bestEval.bonus) {
              bestEval = eval_;
            }
          }
        }
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

  // Get unique ranks sorted descending
  const uniqueRanks = Array.from(new Set(cards.map(c => RANK_VALUES[c.rank!]))).sort((a, b) => b - a);

  if (uniqueRanks.length < 5) return { indices: [] };

  // 1. Standard Straight Check
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      const targetRanks = uniqueRanks.slice(i, i + 5);
      const indices = mapRanksToIndices(cards, targetRanks);
      if (indices.length === 5) return { indices };
    }
  }

  // 2. Wrap-around Straight Check (e.g. Q-K-A-2-3)
  // Python logic uses circular gap check: [1,1,1,1,9] for 5 cards in 13-rank circle
  // Simplified: Check for A, 2, 3, 4, 5 (Low Straight) or similar wraps if any
  // But standard poker usually only treats A-2-3-4-5 as low straight.
  // TurnSarsah Python code logic:
  // gaps = [u[1]-u[0], u[2]-u[1], u[3]-u[2], u[4]-u[3], 13-(u[4]-u[0])] sorted == [1,1,1,1,9]
  // This supports ANY wrap-around.

  if (uniqueRanks.length === 5) { // Optimization: only check if exactly 5 unique ranks, otherwise difficult
    // The python logic on lines 163-176 assumes 'counts' keys (unique ranks). 
    // If user has 6 cards, we need to iterate combinations? Python `_evaluate_clean_hand` sorts ranks by frequency then value.
    // But `getStraight` in Python (line 162) checks `if num_cards == 5`. It implies it only runs closely on 5-card sets or relies on `evaluate_hand` passing 5 cards?
    // Actually `evaluate_hand` in Python passes ALL cards to `_evaluate_clean_hand`.
    // Python `_evaluate_clean_hand` logic for straight is: `if num_cards == 5` inside implicit check?
    // Wait, Python lines 162 `if num_cards == 5:` sets `is_straight = True` IF unique ranks form a wrap around.
    // It means wrap-around straights ONLY count if you have EXACTLY 5 cards in hand?
    // Let's stick to Python logic rigidly.

    // Re-implementing Python's exact gap logic for 5-card case:
    const sortedUnique = uniqueRanks.slice().sort((a, b) => a - b); // Ascending
    const gaps = [
      sortedUnique[1] - sortedUnique[0],
      sortedUnique[2] - sortedUnique[1],
      sortedUnique[3] - sortedUnique[2],
      sortedUnique[4] - sortedUnique[3],
      13 - (sortedUnique[4] - sortedUnique[0])
    ];
    // Sort gaps to check for [1, 1, 1, 1, 9] signature
    const sortedGaps = gaps.sort((a, b) => a - b);
    const isWrapAround = sortedGaps[0] === 1 && sortedGaps[1] === 1 && sortedGaps[2] === 1 && sortedGaps[3] === 1 && sortedGaps[4] === 9;

    if (isWrapAround) {
      return { indices: cards.map((_, i) => i) }; // All 5 cards used
    }
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
