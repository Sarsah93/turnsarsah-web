// logic/conditions.ts

import { Condition } from '../types/Character';

export interface ConditionEffect {
  type: 'HEAL' | 'DAMAGE' | 'BLEED' | 'POISON' | 'POISON_DMG' | 'HEAVY_BLEED' | 'AVOIDED' | 'PARALYZED' | 'DEBILITATING' | 'FRAILTY' | 'CONDITION_APPLIED';
  amount: number;
  data?: any; // For flexible payload in CONDITION_APPLIED
}

/**
 * 상태이상 기본 설정 (v2.0.0.6 기준)
 */
export const CONDITION_PRESETS: Record<string, { duration: number; desc: string }> = {
  'Bleeding': {
    duration: 4,
    desc: 'Takes 5 fixed damage per turn. Stacks to Heavy Bleeding.',
  },
  'Heavy Bleeding': {
    duration: 3,
    desc: 'Takes 15 fixed damage per turn. Prevents additional Bleeding.',
  },
  'Poisoning': {
    duration: 4,
    desc: 'Takes stacking damage (5, 10, 15, 20) per turn. Stacks to Debilitating.',
  },
  'Regenerating': {
    duration: 5,
    desc: 'Restores HP each turn.',
  },
  'Paralyzing': {
    duration: 2,
    desc: 'Player cannot attack (turn passes to boss).',
  },
  'Debilitating': {
    duration: 3,
    desc: 'Reduces Max HP by 20% and damage dealt by 20%.',
  },
  'Immune': {
    duration: 3,
    desc: 'Immune to debuff effects (Bleeding, Poison, Paralyze, Debilitate).',
  },
};

/**
 * 상태이상 적용 (면역 체크, 중첩 규칙 v2.0.0.6)
 */
export function applyCondition(
  conditions: Map<string, Condition>,
  name: string,
  duration: number,
  desc: string = '',
  data?: unknown
): boolean {
  // 1. 면역(Immune) 상태 체크 (디버프성 효과만 차단)
  const debuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating'];
  if (conditions.has('Immune') && debuffs.includes(name)) {
    return false;
  }

  // 2. 출혈(Bleeding) 중첩 -> 과출혈(Heavy Bleeding)
  if (name === 'Bleeding') {
    if (conditions.has('Heavy Bleeding')) return false; // 과출혈 중에는 출혈 무시
    if (conditions.has('Bleeding')) {
      conditions.delete('Bleeding');
      return applyCondition(conditions, 'Heavy Bleeding', 3);
    }
  }

  // 3. 중독(Poisoning) 중첩 -> 쇠약(Debilitating)
  if (name === 'Poisoning') {
    if (conditions.has('Poisoning')) {
      conditions.delete('Poisoning');
      return applyCondition(conditions, 'Debilitating', 3);
    }
  }

  // 4. 쇠약(Debilitating) 중첩 불가 (갱신만 가능하거나 기존 유지)
  if (name === 'Debilitating' && conditions.has('Debilitating')) {
    // 갱신 로직 (시간만 초기화)
    const existing = conditions.get(name)!;
    existing.elapsed = 0;
    return false;
  }

  // 5. 마비(Paralyzing) 중첩 불가
  if (name === 'Paralyzing' && conditions.has('Paralyzing')) {
    return false;
  }

  const isNew = !conditions.has(name);
  conditions.set(name, {
    duration,
    elapsed: 0,
    desc: desc || CONDITION_PRESETS[name]?.desc || '',
    data,
    type: name.toUpperCase().replace(' ', '_') as any
  });

  return isNew;
}

export function processConditionsEndTurn(
  conditions: Map<string, Condition>
): ConditionEffect[] {
  const effects: ConditionEffect[] = [];
  const toRemove: string[] = [];

  // 매 턴 종료 시 15% 확률로 상태이상 제거 (디버프성만)
  const removableDebuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating'];

  for (const [name, condition] of conditions.entries()) {
    // 1. 확률적 제거 체크 (15%)
    if (removableDebuffs.includes(name) && Math.random() < 0.15) {
      toRemove.push(name);
      continue;
    }

    // 2. 데미지/회복 효과
    if (name === 'Bleeding') {
      effects.push({ type: 'BLEED', amount: 5 });
    } else if (name === 'Heavy Bleeding') {
      effects.push({ type: 'HEAVY_BLEED', amount: 15 });
    } else if (name === 'Poisoning') {
      // 5, 10, 15, 20 점진적 증가
      const amount = (condition.elapsed + 1) * 5;
      effects.push({ type: 'POISON', amount });
    } else if (name === 'Regenerating') {
      effects.push({ type: 'HEAL', amount: 10 });
    }

    // 3. 경과 시간
    condition.elapsed += 1;

    // 4. 만료 체크
    if (condition.duration < 999 && condition.elapsed >= condition.duration) {
      toRemove.push(name);
    }
  }

  toRemove.forEach((name) => conditions.delete(name));
  return effects;
}

export function clearConditions(conditions: Map<string, Condition>): void {
  conditions.clear();
}
