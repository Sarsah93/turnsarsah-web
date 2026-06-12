// constants/eventScenarios.ts
// 이벤트 스테이지 시스템 — 12종 이벤트 시나리오 데이터 정의

export type EventCategory = 'UNSTABLE_CREATURE' | 'SHADY_MERCHANT' | 'CRACKED_NODE' | 'UNKNOWN_ALTAR';

export interface EventBonuses {
  percentAtkBonus: number;      // 추가 데미지(%) 누적 (0.02 = +2%)
  critMultBonus: number;        // 크리티컬 배수 누적 (0.10 = +10%)
  critChanceBonus: number;      // 카드당 크리티컬 확률 누적 (0.03 = +3%)
  evasionBonus: number;         // 회피율 누적 (0.06 = +6%)
  maxHpBonusPercent: number;    // 최대 코어 안정도 % 누적 (0.10 = +10%)
  swapCountBonus: number;       // 카드 교체 횟수 고정 증감
  damageTakenPercent: number;   // 받는 피해 % 누적 (0.25 = +25%, 방어력 감소 역할)
}

export interface PendingBattleDebuffs {
  hpDrainPerTurn: number;   // 매 턴 종료 시 HP 감소량 (0 = 없음)
  swapCountPenalty: number; // 카드 교체 횟수 감소 (0 = 없음)
  sourceLabel: string;      // 디버프 출처 표시용 (예: "수상한 과자")
}

// 이벤트 ID 목록
export type EventId =
  | 'CREATURE_SMALL'   // 1.1 소동물
  | 'CREATURE_MEDIUM'  // 1.2 중형 동물
  | 'CREATURE_LARGE'   // 1.3 대형 동물
  | 'MERCHANT_CANDY'   // 2.1 수상한 과자
  | 'MERCHANT_DRINK'   // 2.2 수상한 음료
  | 'MERCHANT_CUBE'    // 2.3 수상한 큐브
  | 'NODE_ANALYSIS'    // 3.1 잔해 패턴 분석
  | 'NODE_ABSORB'      // 3.2 잔해 직접 흡수
  | 'NODE_DESTROY'     // 3.3 잔해 충격 파괴
  | 'ALTAR_MINOR'      // 4.1 소제물 봉헌
  | 'ALTAR_MAJOR'      // 4.2 대제물 봉헌
  | 'ALTAR_BLOOD';     // 4.3 피의 봉헌

// 카테고리별 이벤트 ID 그룹
export const EVENT_CATEGORY_MAP: Record<EventCategory, EventId[]> = {
  UNSTABLE_CREATURE: ['CREATURE_SMALL', 'CREATURE_MEDIUM', 'CREATURE_LARGE'],
  SHADY_MERCHANT:    ['MERCHANT_CANDY', 'MERCHANT_DRINK', 'MERCHANT_CUBE'],
  CRACKED_NODE:      ['NODE_ANALYSIS', 'NODE_ABSORB', 'NODE_DESTROY'],
  UNKNOWN_ALTAR:     ['ALTAR_MINOR', 'ALTAR_MAJOR', 'ALTAR_BLOOD'],
};

export const EVENT_CATEGORIES: EventCategory[] = [
  'UNSTABLE_CREATURE',
  'SHADY_MERCHANT',
  'CRACKED_NODE',
  'UNKNOWN_ALTAR',
];

/** 세션 내 랜덤 이벤트 ID를 선택합니다 */
export function pickRandomEventId(): EventId {
  const catIdx = Math.floor(Math.random() * EVENT_CATEGORIES.length);
  const category = EVENT_CATEGORIES[catIdx];
  const events = EVENT_CATEGORY_MAP[category];
  const evtIdx = Math.floor(Math.random() * events.length);
  return events[evtIdx];
}

/** 퍼센트값 → 표시용 문자열 (+X%) */
export function pct(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${Math.round(val * 100)}%`;
}
