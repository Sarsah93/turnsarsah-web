// logic/conditions.ts

import { Condition } from '../types/Character';
import {
  BLEED_DAMAGE,
  BLEED_DURATION,
  BLEED_INTERVAL,
  HEAVY_BLEED_DAMAGE,
  HEAVY_BLEED_DURATION,
  POISON_DAMAGE,
  POISON_DURATION,
  DEBILITATING_DURATION,
  DEBILITATING_HP_REDUCTION,
  PARALYSIS_DURATION,
  IMMUNE_DURATION,
  REGEN_DURATION,
} from '../constants/gameConfig';

/**
 * 상태이상 기본 설정
 */
export interface ConditionConfig {
  duration: number;
  desc: string;
  data?: unknown;
}

export const CONDITION_PRESETS: Record<string, ConditionConfig> = {
  Bleeding: {
    duration: BLEED_DURATION,
    desc: 'Losing HP over time.',
  },
  'Heavy Bleeding': {
    duration: HEAVY_BLEED_DURATION,
    desc: 'Losing lots of HP over time.',
  },
  Poisoning: {
    duration: POISON_DURATION,
    desc: 'Taking damage at turn end.',
  },
  Debilitating: {
    duration: DEBILITATING_DURATION,
    desc: 'Max HP reduced.',
  },
  Paralyzing: {
    duration: PARALYSIS_DURATION,
    desc: 'May skip turn.',
  },
  Regenerating: {
    duration: REGEN_DURATION,
    desc: 'Healing over time.',
  },
  Avoiding: {
    duration: 999, // Permanent
    desc: 'Chance to evade attacks.',
  },
  'Damage Reducing': {
    duration: 999, // Permanent
    desc: 'Taking reduced damage.',
  },
  Immune: {
    duration: IMMUNE_DURATION,
    desc: 'Immune to negative effects.',
  },
};

/**
 * 음수 효과 (면역 조건으로 차단 가능)
 */
const NEGATIVE_EFFECTS = [
  'Bleeding',
  'Heavy Bleeding',
  'Poisoning',
  'Debilitating',
  'Paralyzing',
];

/**
 * 조건 적용 (면역 체크, 중첩 규칙)
 */
export function applyCondition(
  conditions: Map<string, Condition>,
  name: string,
  duration: number,
  desc: string = '',
  data?: unknown
): boolean {
  // 면역 체크
  if (conditions.has('Immune') && NEGATIVE_EFFECTS.includes(name)) {
    return false; // 면역으로 차단됨
  }

  // 출혈 중첩 규칙
  if (name === 'Bleeding') {
    if (conditions.has('Heavy Bleeding')) {
      return false; // 이미 Heavy Bleed가 있으면 적용 안 됨
    }
    if (conditions.has('Bleeding')) {
      // 일반 출혈 → Heavy Bleed로 업그레이드
      conditions.delete('Bleeding');
      return applyCondition(
        conditions,
        'Heavy Bleeding',
        HEAVY_BLEED_DURATION,
        CONDITION_PRESETS['Heavy Bleeding'].desc
      );
    }
  }

  // 중독 중첩 규칙
  if (name === 'Poisoning') {
    if (conditions.has('Poisoning')) {
      // 50% 확률로 쇠약으로 업그레이드
      if (Math.random() < 0.5) {
        conditions.delete('Poisoning');
        return applyCondition(
          conditions,
          'Debilitating',
          DEBILITATING_DURATION,
          CONDITION_PRESETS.Debilitating.desc
        );
      }
    }
  }

  // 마비 중첩 규칙
  if (name === 'Paralyzing') {
    if (conditions.has('Paralyzing')) {
      return false; // 중첩 안 됨
    }
  }

  const isNew = !conditions.has(name);
  conditions.set(name, {
    duration,
    elapsed: 0,
    desc: desc || CONDITION_PRESETS[name]?.desc || '',
    data,
  });

  return isNew;
}

/**
 * 조건 제거
 */
export function removeCondition(
  conditions: Map<string, Condition>,
  name: string
): void {
  if (conditions.has(name)) {
    conditions.delete(name);
  }
}

/**
 * 턴 시작 시 조건 처리 (회복 등)
 */
export interface ConditionEffect {
  type: 'HEAL' | 'DAMAGE' | 'BLEED' | 'POISON' | 'HEAVY_BLEED';
  amount: number;
}

export function processConditionsStartTurn(
  conditions: Map<string, Condition>
): ConditionEffect[] {
  const effects: ConditionEffect[] = [];

  // 재생 (Regenerating)
  if (conditions.has('Regenerating')) {
    // 실제로는 maxHp를 필요로 함. 호출처에서 maxHp를 전달받아 계산
    effects.push({ type: 'HEAL', amount: 0 }); // 마커만 추가, 값은 호출처에서 계산
  }

  return effects;
}

/**
 * 턴 종료 시 조건 처리 (데미지 등) 및 경과 시간 업데이트
 */
export function processConditionsEndTurn(
  conditions: Map<string, Condition>
): ConditionEffect[] {
  const effects: ConditionEffect[] = [];
  const toRemove: string[] = [];

  for (const [name, condition] of conditions.entries()) {
    // DoT 데미지
    if (name === 'Poisoning') {
      effects.push({ type: 'POISON', amount: POISON_DAMAGE });
    } else if (name === 'Bleeding') {
      effects.push({ type: 'BLEED', amount: BLEED_DAMAGE });
    } else if (name === 'Heavy Bleeding') {
      effects.push({ type: 'HEAVY_BLEED', amount: HEAVY_BLEED_DAMAGE });
    }

    // 경과 시간 증가
    condition.elapsed += 1;

    // 지속 시간 만료 체크
    if (condition.elapsed >= condition.duration) {
      toRemove.push(name);
    }
  }

  // 만료된 조건 제거
  toRemove.forEach((name) => removeCondition(conditions, name));

  return effects;
}

/**
 * 일반 병렬 처리 (출혈 틱 등 특수 타이밍)
 */
export function processBleedTick(conditions: Map<string, Condition>): ConditionEffect[] {
  const effects: ConditionEffect[] = [];

  // 출혈은 일반적으로 2턴 간격으로 처리 (mechanics 참고)
  if (conditions.has('Bleeding')) {
    const condition = conditions.get('Bleeding')!;
    // elapsed가 BLEED_INTERVAL의 배수인지 확인
    if (condition.elapsed % BLEED_INTERVAL === 0 && condition.elapsed > 0) {
      effects.push({ type: 'BLEED', amount: BLEED_DAMAGE });
    }
  }

  if (conditions.has('Heavy Bleeding')) {
    const condition = conditions.get('Heavy Bleeding')!;
    if (condition.elapsed % BLEED_INTERVAL === 0 && condition.elapsed > 0) {
      effects.push({ type: 'HEAVY_BLEED', amount: HEAVY_BLEED_DAMAGE });
    }
  }

  return effects;
}

/**
 * 전체 조건 초기화 (스테이지 전환 시)
 * 영구 효과 (duration >= 999)는 유지
 */
export function clearConditions(conditions: Map<string, Condition>): void {
  const toRemove: string[] = [];

  for (const [name, condition] of conditions.entries()) {
    if (condition.duration < 999) {
      toRemove.push(name);
    }
  }

  toRemove.forEach((name) => removeCondition(conditions, name));
}

/**
 * MaxHP 감소 (쇠약 적용)
 */
export function reduceMaxHp(maxHp: number, percentage: number = DEBILITATING_HP_REDUCTION): number {
  const reduction = Math.floor(maxHp * percentage);
  return Math.max(1, maxHp - reduction);
}

/**
 * MaxHP 복구 (쇠약 해제)
 */
export function restoreMaxHp(
  currentMaxHp: number,
  baseMaxHp: number
): number {
  return Math.max(currentMaxHp, baseMaxHp);
}
