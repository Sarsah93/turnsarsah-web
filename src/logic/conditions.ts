// logic/conditions.ts

import { Condition } from '../types/Character';

export interface ConditionEffect {
  type: 'HEAL' | 'DAMAGE' | 'BLEED' | 'POISON' | 'POISON_DMG' | 'HEAVY_BLEED' | 'AVOIDED' | 'PARALYZED' | 'DEBILITATING' | 'FRAILTY' | 'CONDITION_APPLIED';
  amount: number;
  data?: any; // For flexible payload in CONDITION_APPLIED
}

/**
 * 상태이상 기본 설정 (v2.0.0.5 기준)
 */
export const CONDITION_PRESETS: Record<string, { duration: number; desc: string }> = {
  Bleeding: {
    duration: 4,
    desc: 'LOSING 10 HP EVERY TURN.',
  },
  'Heavy Bleeding': {
    duration: 6,
    desc: 'LOSING 20 HP EVERY TURN.',
  },
  Poisoning: {
    duration: 6,
    desc: 'TAKING INCREASING DAMAGE EVERY TURN (+5).',
  },
  Regenerating: {
    duration: 5,
    desc: 'RECOVERING 10 HP EVERY TURN.',
  },
  Paralyzing: {
    duration: 3,
    desc: 'CANNOT ATTACK (SKIP TURN).',
  },
  Frailty: {
    duration: 6,
    desc: 'MAX HP -25%.',
  },
  Avoiding: {
    duration: 9999,
    desc: 'CHANCE TO EVADE ATTACKS (5%).',
  },
};

/**
 * 상태이상 적용 (면역 체크, 중첩 규칙 v2.0.0.5)
 */
export function applyCondition(
  conditions: Map<string, Condition>,
  name: string,
  duration: number,
  desc: string = '',
  data?: unknown
): boolean {
  // 1. Heavy Bleed blocks Bleed
  if (name === 'Bleeding' && conditions.has('Heavy Bleeding')) return false;

  // 2. Frailty blocks stacking Poison (new Frailty) 
  // Note: Poison can still be applied if Frailty exists, but it won't stack into NEW Frailty.
  // This is handled logic-side: if Poison is applied while Frailty exists, it's just Poison.
  // If Poison + Poison -> Frailty:
  if (name === 'Poisoning' && conditions.has('Poisoning')) {
    // Check if Frailty already exists
    if (conditions.has('Frailty')) {
      // Only refresh Poison? Or allow parallel Poison?
      // Requirement: "If Frailty remains, newly applied Poison cannot stack to Frailty."
      // So we just update Poison normally.
    } else {
      // Stack to Frailty
      conditions.delete('Poisoning');
      return applyCondition(
        conditions,
        'Frailty',
        6, // Duration for Frailty? User didn't specify, assuming similar to others or 5-6
        'MAX HP -25% (FRAILTY)',
        25
      );
    }
  }

  // 3. Bleed + Bleed -> Heavy Bleed
  if (name === 'Bleeding' && conditions.has('Bleeding')) {
    conditions.delete('Bleeding');
    return applyCondition(
      conditions,
      'Heavy Bleeding',
      4,
      'LOSING 25 HP EVERY TURN (HEAVY BLEED)',
      25
    );
  }

  // 4. Paralyze stacking block
  if (name === 'Paralyzing' && conditions.has('Paralyzing')) {
    return false;
  }

  // 5. Frailty Stacking block (Frailty cannot stack with itself)
  if (name === 'Frailty' && conditions.has('Frailty')) {
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

  for (const [name, condition] of conditions.entries()) {
    // 1. Damage Effects
    if (name === 'Bleeding') {
      effects.push({ type: 'BLEED', amount: 10 });
    } else if (name === 'Heavy Bleeding') {
      effects.push({ type: 'HEAVY_BLEED', amount: 25 });
    } else if (name === 'Poisoning') {
      const amount = (condition.elapsed + 1) * 5;
      effects.push({ type: 'POISON', amount });
    } else if (name === 'Regenerating') {
      effects.push({ type: 'HEAL', amount: 10 });
    }

    // 2. Elapsed Time
    condition.elapsed += 1;

    // 3. Expiration
    if (condition.duration < 999 && condition.elapsed >= condition.duration) {
      toRemove.push(name);
    }
  }

  toRemove.forEach((name) => conditions.delete(name));
  return effects;
}

export function clearConditions(conditions: Map<string, Condition>, isVictory: boolean = false): void {
  // 스테이지 6에서 얻은 최대 체력 증가는 상태이상이 아니므로 유지되도록 설계해야 함 (gameStore에서 처리)
  // 여기서는 단순히 조건 맵을 비움
  conditions.clear();
  // 회피는 항상 플레이어에게 부여되어야 하므로 나중에 다시 추가 필요 (gameStore.initGame에서 처리)
}
