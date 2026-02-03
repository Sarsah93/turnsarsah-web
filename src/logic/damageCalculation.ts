// logic/damageCalculation.ts

import { Card } from '../types/Card';
import { evaluateHand, HandEvaluation } from './mechanics';
import { CRITICAL_DAMAGE_BONUS } from '../constants/gameConfig';
import { RANK_VALUES } from '../constants/cards';

/**
 * 크리티컬 확률 계산
 * Pygame 로직: 족보 구성에 기여한 A/조커 한 장당 10% 확률로 크리티컬
 */
export function getCriticalInfo(cards: Card[], scoringIndices: number[]): boolean {
  if (scoringIndices.length === 0) return false;

  const scoringCards = scoringIndices.map((i) => cards[i]);
  const criticalCards = scoringCards.filter(
    (c) => c.isJoker || c.rank === 'A'
  );

  const criticalProbability = criticalCards.length * 0.1;
  return Math.random() < criticalProbability;
}

/**
 * 기본 포커 족보에 따른 데미지 계산
 * A부터 K까지 각 등급별 기본 데미지
 */
export function calculateBaseDamage(hand: HandEvaluation): number {
  // 기본 데미지 = 족보 보너스 + 카드 등급 합산
  const baseBonus = hand.bonus;

  // 평균적인 추가 데미지: A=5, K=4, Q=3, J=2 정도
  // 간단하게: hand.bonus / 10 정도의 추가 효과
  const cardBonus = Math.ceil(baseBonus / 10);

  return baseBonus + cardBonus;
}

/**
 * 플레이어 공격 데미지 최종 계산
 * 1. 기본 데미지
 * 2. 크리티컬 보너스 (+25%)
 * 3. 쇠약 페널티 (-20%)
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
  hasDebilitating: boolean = false
): DamageCalculationResult {
  // 족보 평가
  const handEval = evaluateHand(cards);
  const baseDamage = calculateBaseDamage(handEval);

  // 크리티컬 판정
  const isCritical = getCriticalInfo(cards, handEval.scoringIndices);
  let multiplier = 1.0;

  if (isCritical) {
    multiplier *= 1 + CRITICAL_DAMAGE_BONUS;
  }

  // 쇠약 페널티
  if (hasDebilitating) {
    multiplier *= 0.8; // -20% 데미지
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
