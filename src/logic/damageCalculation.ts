// logic/damageCalculation.ts

import { Card } from '../types/Card';
import { evaluateHand, HandEvaluation } from './mechanics';
import { CRITICAL_DAMAGE_BONUS } from '../constants/gameConfig';
import { RANK_VALUES } from '../constants/cards';

/**
 * 크리티컬 확률 계산
 * v2.0.0.5: (A 개수 + 조커 개수) * 10% 확률로 크리티컬
 * - 족보에 '참여'하는 카드만 계산
 * - HIGH CARD는 크리티컬 발생 안함
 */
export function getCriticalSuccess(cards: Card[], handType: string, scoringIndices: number[]): boolean {
  if (handType === 'High Card' || scoringIndices.length === 0) return false;

  const scoringCards = scoringIndices.map((i) => cards[i]);
  const criticalCount = scoringCards.filter(
    (c) => c.isJoker || c.rank === 'A'
  ).length;

  const probability = criticalCount * 0.1;
  return Math.random() < probability;
}

/**
 * 기본 포커 족보에 따른 데미지 계산
 * v2.0.0.6: Hand Bonus + Sum of Scoring Card Values (금지 카드 반영)
 */
export function calculateBaseDamage(
  hand: HandEvaluation,
  cards: Card[],
  bannedRanks: string[] = [],
  bannedSuit: string | null = null
): number {
  const scoringCards = hand.scoringIndices.map(idx => cards[idx]);

  // 1. Sum of Scoring Card Values (금지된 경우 0점)
  const sumValues = scoringCards.reduce((acc, card) => {
    // 족보에는 참여하지만 점수는 0점인 조건 체크
    const isBannedRank = card.rank && bannedRanks.includes(card.rank);
    const isBannedSuit = card.suit && card.suit === bannedSuit;

    if (isBannedRank || isBannedSuit) return acc + 0;

    if (card.isJoker) return acc + 14; // 조커는 일단 14점 (또는 대체된 카드 점수?)
    return acc + (RANK_VALUES[card.rank!] || 0);
  }, 0);

  // 2. High Card Logic (No combination formed)
  if (hand.type === 'High Card') {
    // Top 2 highest cards from selection (excluding banned ones)
    const sortedValues = cards.map(c => {
      const isBannedRank = c.rank && bannedRanks.includes(c.rank);
      const isBannedSuit = c.suit && c.suit === bannedSuit;
      if (isBannedRank || isBannedSuit) return 0;
      if (c.isJoker) return 14;
      return RANK_VALUES[c.rank!] || 0;
    }).sort((a, b) => b - a);

    const top1 = sortedValues[0] || 0;
    const top2 = sortedValues[1] || 0;
    return top1 + top2;
  }

  // 3. Add Hand Bonus
  const bonuses: Record<string, number> = {
    'One Pair': 10,
    'Two Pair': 20,
    'Three of a Kind': 50,
    'Straight': 75,
    'Flush': 100,
    'Full House': 125,
    'Four of a Kind': 150,
    'Straight Flush': 175,
    'Royal Flush': 300
  };

  const handBonus = bonuses[hand.type] || 0;

  return handBonus + sumValues;
}

/**
 * 플레이어 공격 데미지 최종 계산
 */
export interface DamageCalculationResult {
  baseDamage: number;
  isCritical: boolean;
  finalDamage: number;
  multiplier: number;
  handType: string;
}

export function calculatePlayerDamage(
  cards: Card[],
  hasDebilitating: boolean = false,
  bannedHandType: string | null = null,
  bannedRanks: string[] = [],
  bannedSuit: string | null = null
): DamageCalculationResult {
  // 1. Check Banned Hand (Stage Rule)
  const handEval = evaluateHand(cards);
  if (bannedHandType && handEval.type === bannedHandType && handEval.type !== 'High Card') {
    return {
      baseDamage: 0,
      isCritical: false,
      finalDamage: 0,
      multiplier: 0,
      handType: `${handEval.type}`, // BANNED 처리는 호출부에서 문구 띄움
    };
  }

  const baseDamage = calculateBaseDamage(handEval, cards, bannedRanks, bannedSuit);

  // 2. Critical Hit Multiplier
  const isCritical = getCriticalSuccess(cards, handEval.type, handEval.scoringIndices);
  let multiplier = 1.0;

  if (isCritical) {
    multiplier *= 1.25; // 1.25x Total Damage
  }

  // 3. Debilitating Penalty
  if (hasDebilitating) {
    multiplier *= 0.8; // 0.8x Total Damage
  }

  const finalDamage = Math.floor(baseDamage * multiplier);

  return {
    baseDamage,
    isCritical,
    finalDamage,
    multiplier,
    handType: handEval.type,
  };
}

/**
 * 보스 공격 데미지
 * 기본: 보스의 ATK 스탯
 * 변수: 스테이지별 규칙에 따라 변동
 */
export function calculateBotDamage(
  baseAtk: number,
  stage?: number,
  hasAvoidance?: boolean
): number {
  let damage = baseAtk;

  // 회피 (Avoiding) 조건 시 공격이 빗나갈 확률 처리
  // 실제 회피는 여기서 판정하거나, UI에서 표시만 함
  if (hasAvoidance && Math.random() < 0.05) {
    return 0; // 회피!
  }

  return Math.max(1, damage);
}

/**
 * 데미지 수정 조건 적용
 * - Damage Reducing: N% 감소
 * - Immune: 완전 면역
 */
export function applyDamageModifiers(
  damage: number,
  damageReducingPercent: number = 0,
  isImmune: boolean = false
): number {
  if (isImmune) return 0;

  if (damageReducingPercent > 0) {
    damage = Math.floor(damage * (1 - damageReducingPercent / 100));
  }

  return Math.max(0, damage);
}

/**
 * 최종 HP 계산 (음수 방지)
 */
export function applyDamage(currentHp: number, damage: number): number {
  return Math.max(0, currentHp - damage);
}

/**
 * 치유 계산
 */
export function applyHealing(currentHp: number, maxHp: number, healAmount: number): number {
  return Math.min(maxHp, currentHp + healAmount);
}
