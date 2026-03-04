// logic/conditions.ts

import { Condition } from '../types/Character';

export interface ConditionEffect {
  type: 'HEAL' | 'DAMAGE' | 'BLEED' | 'POISON' | 'POISON_DMG' | 'HEAVY_BLEED' | 'AVOIDED' | 'PARALYZED' | 'DEBILITATING' | 'FRAILTY' | 'CONDITION_APPLIED' | 'DEHYDRATION_DMG' | 'NEUROTOXICITY_DMG' | 'ADRENALINE_NULL' | 'RECOIL_DMG' | 'LIFESTEAL' | 'BURN' | 'DECAY' | 'REFLECT';
  amount: number;
  data?: any; // For flexible payload in CONDITION_APPLIED
}

/**
 * 상태이상 기본 설정 (v2.0.0.6 기준)
 */
export const CONDITION_PRESETS: Record<string, { duration: number }> = {
  'Bleeding': { duration: 4 },
  'Heavy Bleeding': { duration: 3 },
  'Poisoning': { duration: 4 },
  'Regenerating': { duration: 999 },
  'Paralyzing': { duration: 2 },
  'Debilitating': { duration: 3 },
  'Damage Reducing': { duration: 9999 },
  'Avoiding': { duration: 9999 },
  'Immune': { duration: 3 },
  'Awakening': { duration: 9999 },
  'Damage recoiling': { duration: 3 },
  'Berserker': { duration: 3 },
  'Revival': { duration: 9999 }, // Charge-based
  'Invincible spirit': { duration: 9999 }, // Charge-based
  'Adrenaline secretion': { duration: 3 },
  'Neurotoxicity': { duration: 3 },
  'Dehydration': { duration: 9999 },
  'Provocation': { duration: 9999 },
  'Decreasing accuracy': { duration: 3 },
  'Burn': { duration: 3 },
  'Decay': { duration: 4 },
  'Reflection': { duration: 9999 },
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
  const debuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating', 'Neurotoxicity', 'Dehydration', 'Burn', 'Decay'];
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
    desc: desc || '', // Descs are now handled by the UI/Translation system
    data,
    type: name.toUpperCase().replace(/\s+/g, '_') as any
  });

  // Special immediate effects
  // Neurotoxicity (v2.3.2): Immediate paralyze removed, replaced with once-per-duration turn-start check.

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
    const removableDebuffs = ['Bleeding', 'Heavy Bleeding', 'Poisoning', 'Paralyzing', 'Debilitating', 'Burn', 'Decay'];
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
    } else if (name === 'Neurotoxicity') {
      effects.push({ type: 'NEUROTOXICITY_DMG', amount: 15 });
    } else if (name === 'Dehydration') {
      // Dehydration damage is passed as data { amount: N }
      const dmg = (condition.data as any)?.amount || 0;
      if (dmg > 0) {
        effects.push({ type: 'DEHYDRATION_DMG', amount: dmg });
      }
    } else if (name === 'Burn') {
      effects.push({ type: 'BURN', amount: 0 }); // Damage calculation handled in useGameLoop based on maxHp
    } else if (name === 'Decay') {
      effects.push({ type: 'DECAY', amount: 0 }); // Damage calculation handled in useGameLoop
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
