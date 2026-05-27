// constants/guideData.ts
// Guide Popup System - Content definitions for first-time player guidance

export interface GuidePopupData {
  key: string;           // localStorage key
  title: { KR: string; EN: string };
  body: { KR: string; EN: string };
  category: 'CHAPTER_INTRO' | 'SYSTEM' | 'GIMMICK' | 'CONDITION';
}

// --- localStorage Helpers ---
import { storageKey } from '../utils/buildTarget';
const GUIDE_PREFIX = storageKey('guide_seen_');

export function hasSeenGuide(key: string): boolean {
  return localStorage.getItem(GUIDE_PREFIX + key) === '1';
}

export function markGuideSeen(key: string): void {
  localStorage.setItem(GUIDE_PREFIX + key, '1');
}

export function clearAllSeenGuides(): void {
  const prefix = storageKey('guide_seen_');
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('[guideData] All seen guides cleared.');
}


// ─── 1. Chapter Intro Popups ──────────────────────────────────────────
export const CHAPTER_INTROS: Record<string, GuidePopupData> = {
  '1': {
    key: 'chapter_intro_1',
    category: 'CHAPTER_INTRO',
    title: { KR: '챕터 1: 들판', EN: 'Chapter 1: Meadow' },
    body: {
      KR: '눈을 뜨니, 낯선 들판에 서 있었습니다.\n\n이곳에는 고블린 종족이 서식하고 있으며, 스테이지가 진행될수록 더 강력한 고블린들이 등장합니다.\n\n💡 각 보스는 고유한 "규칙(Rule)"을 가지고 있어, 특정 카드나 족보가 제한될 수 있습니다.\n\n⚔️ 카드를 조합해 포커 족보를 만들고, 보스를 처치하세요!',
      EN: 'You have opened your eyes and found yourself in a strange meadow.\n\nGoblin tribes inhabit this area, and stronger goblins appear as you progress.\n\n💡 Each boss has a unique "Rule" that may restrict certain cards or hands.\n\n⚔️ Combine your cards to form poker hands and defeat the bosses!'
    }
  },
  '2A': {
    key: 'chapter_intro_2A',
    category: 'CHAPTER_INTRO',
    title: { KR: '챕터 2A: 사막', EN: 'Chapter 2A: Desert' },
    body: {
      KR: '끝없이 펼쳐진 사막 지대에 진입했습니다.\n\n이곳의 보스들은 특정 족보를 무효화하는 고유 기믹을 가지고 있습니다. 약한 족보로는 데미지를 줄 수 없는 경우가 많아, 더 다양한 전략이 필요합니다.\n\n🏜️ 주요 등장 몬스터: 미라, 사막뱀, 사막 전갈, 스핑크스 등\n⚠️ 보스의 회피, 피해 경감, 재생 등 다양한 패시브에 주의하세요!',
      EN: 'You have entered the vast desert zone.\n\nBosses here have unique gimmicks that nullify specific poker hands. Weak hands often deal zero damage, requiring more diverse strategies.\n\n🏜️ Key monsters: Mummy, Sand Snake, Sand Scorpion, Sphinx, etc.\n⚠️ Watch out for boss passives like Avoidance, Damage Reduction, and Regeneration!'
    }
  },
  '2B': {
    key: 'chapter_intro_2B',
    category: 'CHAPTER_INTRO',
    title: { KR: '챕터 2B: 깊은 숲', EN: 'Chapter 2B: Deep Forest' },
    body: {
      KR: '울창한 숲 깊숙이 들어왔습니다.\n\n이곳의 오크 종족 보스들은 명중률이 낮아 공격을 빗나가는 경우가 있지만, 대신 강력한 상태이상과 패시브를 보유하고 있습니다.\n\n🌲 주요 등장 몬스터: 오크, 하이 오크, 하이 오크 로드 등\n⚠️ 도발, 버서커, 아드레날린 분비 등의 특수 패시브에 주의하세요!',
      EN: 'You have ventured deep into the forest.\n\nOrc bosses here have lower accuracy but possess powerful status effects and passives.\n\n🌲 Key monsters: Orc, High Orc, High Orc Lord, etc.\n⚠️ Watch out for Provocation, Berserker, and Adrenaline Secretion passives!'
    }
  },
  '3A': {
    key: 'chapter_intro_3A',
    category: 'CHAPTER_INTRO',
    title: { KR: '챕터 3A: 동굴', EN: 'Chapter 3A: Cave' },
    body: {
      KR: '어둡고 습한 동굴에 진입했습니다.\n\n이곳의 모든 보스에게는 "메아리(Echo)" 패시브가 적용되어, 20% 확률로 보스의 공격에 추가 피해가 발생합니다.\n\n🦇 주요 등장 몬스터: 슬라임, 뱀파이어 박쥐, 크리스탈 골렘, 바실리스크, 히드라 등\n⚠️ 석화, 진액, 유체화 등 특수 상태이상과 기믹에 주의하세요!',
      EN: 'You have entered a dark, damp cave.\n\nAll bosses here have the "Echo" passive: 20% chance for an extra hit on the boss\'s attack.\n\n🦇 Key monsters: Slime, Vampire Bat, Crystal Golem, Basilisk, Hydra, etc.\n⚠️ Watch out for Petrified, Mucus, Ghost, and other special mechanics!'
    }
  },
  '3B': {
    key: 'chapter_intro_3B',
    category: 'CHAPTER_INTRO',
    title: { KR: '챕터 3B: 늪지대', EN: 'Chapter 3B: Swamp' },
    body: {
      KR: '독기가 가득한 늪지대에 진입했습니다.\n\n이곳에서는 "잠김(Swamping)" 환경 효과가 적용되어, 플레이어의 회피율이 점차 감소합니다.\n\n🐊 주요 등장 몬스터: 악어거북, 머를록, 크로커다일, 리자드맨, 리자드 킹 등\n⚠️ 진흙 뿌리기(카드 잠금), 숨참기(보스 무적), 줄기세포(보스 성장) 등 독특한 기믹들이 있습니다!',
      EN: 'You have entered a swamp filled with toxic air.\n\nThe "Swamping" environmental effect reduces your evasion as the fight continues.\n\n🐊 Key monsters: Alligator Snapping Turtle, Murloc, Crocodile, Lizard Man, Lizard King, etc.\n⚠️ Watch out for Mud Spray (card lock), Hold Breath (boss invulnerability), and Stem Cell (boss growth)!'
    }
  }
};

// ─── 2. System Guide Popups (Loot & Altar) ────────────────────────────
export const SYSTEM_GUIDES: Record<string, GuidePopupData> = {
  LOOT_SYSTEM: {
    key: 'system_loot',
    category: 'SYSTEM',
    title: { KR: '📦 전리품 시스템', EN: '📦 Loot System' },
    body: {
      KR: '특정 스테이지의 보스를 처치하면 "전리품(Trophy)"을 획득할 수 있습니다!\n\n전리품은 보스의 고유 아이템으로, 제단 시스템에서 강력한 스킬을 해금하는 데 사용됩니다.\n\n💡 쉬움 난이도에서는 전리품을 획득할 수 없습니다.',
      EN: 'Defeat certain stage bosses to earn "Trophies"!\n\nTrophies are unique boss items used to unlock powerful skills in the Altar System.\n\n💡 Trophies cannot be obtained on Easy difficulty.'
    }
  },
  ALTAR_SYSTEM: {
    key: 'system_altar',
    category: 'SYSTEM',
    title: { KR: '⛩️ 제단 시스템', EN: '⛩️ Altar System' },
    body: {
      KR: '획득한 전리품을 사용하여 "제단(Altar)"에서 전투에 도움이 되는 다양한 스킬을 해금할 수 있습니다.\n\n해금된 스킬은 전투 중 자동으로 활성화되어 플레이어를 보조합니다.\n\n메인 메뉴에서 제단을 확인해보세요!',
      EN: 'Use your earned trophies to unlock various combat skills at the "Altar".\n\nUnlocked skills activate automatically during battle to assist you.\n\nCheck the Altar from the main menu!'
    }
  }
};

// ─── 3. Gimmick Guide Popups (Boss Rules) ─────────────────────────────
export const GIMMICK_GUIDES: Record<string, GuidePopupData> = {
  // Chapter 1
  'CH1_BLEED_PROB': {
    key: 'gimmick_ch1_bleed',
    category: 'GIMMICK',
    title: { KR: '⚔️ 기믹: 출혈 확률', EN: '⚔️ Gimmick: Bleed Chance' },
    body: {
      KR: '보스의 공격이 성공하면 일정 확률로 "출혈" 상태이상이 부여됩니다.\n\n출혈 상태에서는 매 턴 종료 시 추가 피해를 입게 됩니다.',
      EN: 'When the boss successfully attacks, there is a chance to inflict "Bleeding".\n\nWhile bleeding, you take additional damage at the end of each turn.'
    }
  },
  'CH1_BAN_RANK': {
    key: 'gimmick_ch1_ban_rank',
    category: 'GIMMICK',
    title: { KR: '🚫 기믹: 숫자 금지', EN: '🚫 Gimmick: Rank Ban' },
    body: {
      KR: '매 턴 무작위로 2개의 숫자가 금지됩니다.\n\n금지된 숫자를 가진 카드는 공격 포인트 계산에서 0점으로 처리됩니다.',
      EN: 'Two random ranks are banned each turn.\n\nCards with banned ranks are treated as 0 points in damage calculation.'
    }
  },
  'CH1_BLIND': {
    key: 'gimmick_ch1_blind',
    category: 'GIMMICK',
    title: { KR: '🙈 기믹: 블라인드', EN: '🙈 Gimmick: Blind' },
    body: {
      KR: '매 턴 무작위로 2장의 카드가 뒤집혀 정보를 알 수 없게 됩니다.\n\n뒤집힌 카드도 선택 시 정상적으로 계산되지만, 어떤 카드인지 알 수 없어 전략 수립이 어려워집니다.',
      EN: 'Two random cards are flipped face-down each turn.\n\nBlinded cards still count normally when selected, but you cannot see what they are.'
    }
  },
  'CH1_BAN_SUIT': {
    key: 'gimmick_ch1_ban_suit',
    category: 'GIMMICK',
    title: { KR: '🚫 기믹: 문양 금지', EN: '🚫 Gimmick: Suit Ban' },
    body: {
      KR: '매 턴 무작위로 1개의 문양(♠♥♦♣)이 금지됩니다.\n\n금지된 문양을 가진 카드는 공격 포인트 계산에서 0점으로 처리됩니다.',
      EN: 'One random suit is banned each turn.\n\nCards with the banned suit are treated as 0 points in damage calculation.'
    }
  },
  'CH1_BAN_HAND': {
    key: 'gimmick_ch1_ban_hand',
    category: 'GIMMICK',
    title: { KR: '🚫 기믹: 족보 금지', EN: '🚫 Gimmick: Hand Ban' },
    body: {
      KR: '매 턴 무작위로 1개의 족보가 금지됩니다.\n\n금지된 족보로 공격 시 해당 족보 보너스가 적용되지 않습니다.',
      EN: 'One random poker hand type is banned each turn.\n\nAttacking with the banned hand type removes its bonus.'
    }
  },

  // Chapter 3A
  'CH3A_ACID_ATTACK': {
    key: 'gimmick_ch3a_acid',
    category: 'GIMMICK',
    title: { KR: '🧪 기믹: 산성 공격', EN: '🧪 Gimmick: Acid Attack' },
    body: {
      KR: '3턴마다 보스가 15의 추가 피해를 입히며, 20% 확률로 화상 상태이상을 부여합니다.',
      EN: 'Every 3 turns, the boss deals 15 extra damage with a 20% chance to inflict Burn.'
    }
  },
  'CH3A_HEMATOPHAGY': {
    key: 'gimmick_ch3a_hematophagy',
    category: 'GIMMICK',
    title: { KR: '🧛 기믹: 흡혈', EN: '🧛 Gimmick: Hematophagy' },
    body: {
      KR: '보스가 피해를 입힐 때마다 데미지의 30%를 HP로 회복합니다.',
      EN: 'The boss heals 30% of damage dealt as HP on each successful attack.'
    }
  },
  'CH3A_GHOST': {
    key: 'gimmick_ch3a_ghost',
    category: 'GIMMICK',
    title: { KR: '👻 기믹: 유체화', EN: '👻 Gimmick: Ghost' },
    body: {
      KR: '이 보스에게는 족보 보너스 데미지만 적용됩니다.\n\n카드의 숫자 합이 아닌 족보 보너스만으로 피해를 줄 수 있습니다.',
      EN: 'Only hand bonus damage applies to this boss.\n\nCard values are ignored; only the poker hand bonus counts.'
    }
  },
  'CH3A_PETRIFIED': {
    key: 'gimmick_ch3a_petrified',
    category: 'GIMMICK',
    title: { KR: '🗿 기믹: 석화', EN: '🗿 Gimmick: Petrify' },
    body: {
      KR: '보스의 공격 성공 시 30% 확률로 수중패의 카드 1장을 "석화" 상태로 만듭니다.\n\n석화된 카드는 2턴 동안 사용할 수 없습니다.',
      EN: 'On a successful attack, 30% chance to Petrify 1 card in your hand for 2 turns.\n\nPetrified cards cannot be used for attacks.'
    }
  },

  // Chapter 3B
  'CH3B_HARDNESS': {
    key: 'gimmick_ch3b_hardness',
    category: 'GIMMICK',
    title: { KR: '🛡️ 기믹: 단단함', EN: '🛡️ Gimmick: Hardness' },
    body: {
      KR: '투 페어 이상의 족보로만 피해를 줄 수 있습니다.\n\n하이 카드와 원 페어로는 데미지가 0이 됩니다.',
      EN: 'Only Two Pair or higher hands deal damage.\n\nHigh Card and One Pair deal zero damage.'
    }
  },
  'CH3B_MUDDED': {
    key: 'gimmick_ch3b_mudded',
    category: 'GIMMICK',
    title: { KR: '💧 기믹: 진흙 뿌리기', EN: '💧 Gimmick: Mud Spray' },
    body: {
      KR: '보스가 공격 성공 시 일정 확률로 수중패의 카드에 "진흙" 상태를 부여합니다.\n\n진흙 상태의 카드는 사용할 수 없으며, 카드 교환(스왑)으로 해제할 수 있습니다.',
      EN: 'On a successful boss attack, there\'s a chance to apply "Mudded" status to your cards.\n\nMudded cards cannot be used. Use card swap to remove the status.'
    }
  },
  'CH3B_HOLD_BREATH': {
    key: 'gimmick_ch3b_hold_breath',
    category: 'GIMMICK',
    title: { KR: '💨 기믹: 숨참기', EN: '💨 Gimmick: Hold Breath' },
    body: {
      KR: '보스가 2회 연속 공격에 성공하면, 다음 턴에 보스가 무적 상태가 됩니다.\n\n무적 턴에는 플레이어의 공격이 0 데미지가 되며, 보스도 공격하지 않습니다.',
      EN: 'After 2 consecutive successful attacks, the boss becomes invulnerable next turn.\n\nDuring invulnerable turns, your attacks deal 0 damage and the boss skips its turn.'
    }
  },
  'CH3B_STEM_CELL': {
    key: 'gimmick_ch3b_stem_cell',
    category: 'GIMMICK',
    title: { KR: '🧬 기믹: 줄기세포', EN: '🧬 Gimmick: Stem Cell' },
    body: {
      KR: '매 턴 종료 시 보스가 성장합니다:\n• 최대 HP +10\n• HP 20% 회복\n• 공격력 +2\n• 회피율 +2%\n\n스트레이트 계열 족보로 공격 성공 시 줄기세포를 파괴할 수 있습니다!',
      EN: 'The boss grows at the end of each turn:\n• Max HP +10\n• Heals 20% HP\n• ATK +2\n• Evasion +2%\n\nDestroy Stem Cell by attacking with a Straight-type hand!'
    }
  },
};

// ─── 4. Condition (Status Effect) Guide Popups ────────────────────────
export const CONDITION_GUIDES: Record<string, GuidePopupData> = {
  'Bleeding': {
    key: 'condition_bleeding',
    category: 'CONDITION',
    title: { KR: '🩸 상태이상: 출혈', EN: '🩸 Status: Bleeding' },
    body: {
      KR: '매 턴 종료 시 일정 피해를 입습니다.\n\n지속 턴이 끝나면 자동으로 해제됩니다.',
      EN: 'Take damage at the end of each turn.\n\nAutomatically removed after the duration expires.'
    }
  },
  'Poisoning': {
    key: 'condition_poisoning',
    category: 'CONDITION',
    title: { KR: '☠️ 상태이상: 중독', EN: '☠️ Status: Poisoning' },
    body: {
      KR: '매 턴 종료 시 일정 피해를 입습니다.\n\n출혈과 유사하지만 별도의 상태이상으로 중첩 가능합니다.',
      EN: 'Take damage at the end of each turn.\n\nSimilar to Bleeding but stacks separately.'
    }
  },
  'Paralyzing': {
    key: 'condition_paralyzing',
    category: 'CONDITION',
    title: { KR: '⚡ 상태이상: 마비', EN: '⚡ Status: Paralyzing' },
    body: {
      KR: '마비 상태에서는 공격을 할 수 없습니다.\n\n턴이 자동으로 넘어가며, 지속 턴 후 해제됩니다.',
      EN: 'While paralyzed, you cannot attack.\n\nYour turn is automatically skipped until it wears off.'
    }
  },
  'Neurotoxicity': {
    key: 'condition_neurotoxicity',
    category: 'CONDITION',
    title: { KR: '🧪 상태이상: 신경성 맹독', EN: '🧪 Status: Neurotoxicity' },
    body: {
      KR: '공격 시 30%의 확률로 공격이 빗나갑니다.\n\n명중률 저하보다 강력한 효과입니다.',
      EN: 'Your attacks have a 30% chance to miss.\n\nA more powerful version of accuracy reduction.'
    }
  },
  'Debilitating': {
    key: 'condition_debilitating',
    category: 'CONDITION',
    title: { KR: '💔 상태이상: 쇠약', EN: '💔 Status: Debilitating' },
    body: {
      KR: '최대 HP가 70%로 감소합니다.\n\n공격력 또한 소폭 감소하며, 상태가 해제되면 능력치가 복구됩니다.',
      EN: 'Max HP is reduced to 70%.\n\nYour ATK is also slightly reduced. Stats are restored when the status expires.'
    }
  },
  'Decreasing accuracy': {
    key: 'condition_accuracy_down',
    category: 'CONDITION',
    title: { KR: '🎯 상태이상: 명중률 저하', EN: '🎯 Status: Decreasing Accuracy' },
    body: {
      KR: '공격 시 일정 확률로 공격이 빗나갑니다.\n\n지속 턴이 끝나면 해제됩니다.',
      EN: 'Your attacks have a chance to miss.\n\nRemoved after the duration expires.'
    }
  },
  'Heavy Bleeding': {
    key: 'condition_heavy_bleeding',
    category: 'CONDITION',
    title: { KR: '🩸 상태이상: 과출혈', EN: '🩸 Status: Heavy Bleeding' },
    body: {
      KR: '일반 출혈보다 더 강력한 지속 피해를 입습니다.\n\n매 턴 종료 시 20의 고정 피해를 입습니다.',
      EN: 'Takes higher damage per turn than regular Bleeding.\n\nTakes 20 fixed damage at the end of each turn.'
    }
  },
  'Dehydration': {
    key: 'condition_dehydration',
    category: 'CONDITION',
    title: { KR: '🏜️ 상태이상: 탈수', EN: '🏜️ Status: Dehydration' },
    body: {
      KR: '매 턴 종료 시 일정 피해를 입습니다.\n\n사막 환경에서 발생하는 환경 상태이상입니다.',
      EN: 'Take damage at the end of each turn.\n\nAn environmental status effect from the desert.'
    }
  },
  'Burn': {
    key: 'condition_burn',
    category: 'CONDITION',
    title: { KR: '🔥 상태이상: 화상', EN: '🔥 Status: Burn' },
    body: {
      KR: '매 턴 종료 시 최대 HP의 3%만큼 지속 피해를 입습니다.',
      EN: 'Take 3% of Max HP as damage at the end of each turn.'
    }
  },
  'Decay': {
    key: 'condition_decay',
    category: 'CONDITION',
    title: { KR: '💜 상태이상: 부패', EN: '💜 Status: Decay' },
    body: {
      KR: '매 턴 종료 시 지속 피해를 입습니다.\n\n시간이 지날수록(3% -> 5% -> 8% -> 10%) 피해량이 증가합니다.',
      EN: 'Take damage at the end of each turn.\n\nDamage increases over time (3% -> 5% -> 8% -> 10%).'
    }
  },
  'Regenerating': {
    key: 'condition_regenerating',
    category: 'CONDITION',
    title: { KR: '💚 상태이상: 재생', EN: '💚 Status: Regenerating' },
    body: {
      KR: '매 턴 종료 시 일정량의 HP를 회복합니다.\n\n플레이어와 보스 모두에게 적용될 수 있는 긍정적인 효과입니다.',
      EN: 'Restore a certain amount of HP at the end of each turn.\n\nA positive effect that can apply to both player and boss.'
    }
  },
  'Mudded': {
    key: 'condition_mudded',
    category: 'CONDITION',
    title: { KR: '💧 상태이상: 진흙', EN: '💧 Status: Mudded' },
    body: {
      KR: '해당 카드는 진흙에 오염되어 사용할 수 없습니다.\n\n카드 교체(SWAP)를 통해 진흙을 닦아내고 해제할 수 있습니다.',
      EN: 'This card is contaminated with mud and cannot be used.\n\nUse card SWAP to clean and remove the status.'
    }
  },
  'Petrified': {
    key: 'condition_petrified',
    category: 'CONDITION',
    title: { KR: '🗿 상태이상: 석화', EN: '🗿 Status: Petrified' },
    body: {
      KR: '해당 카드는 돌로 변해 사용할 수 없습니다.\n\n지속 턴(2턴)이 지나면 자동으로 해제됩니다.',
      EN: 'This card has turned into stone and cannot be used.\n\nAutomatically removed after 2 turns.'
    }
  },
  'Immune': {
    key: 'condition_immune',
    category: 'CONDITION',
    title: { KR: '🛡️ 상태이상: 면역', EN: '🛡️ Status: Immune' },
    body: {
      KR: '모든 상태이상에 면역이 됩니다.\n\n이미 걸려있는 상태이상은 해제되지 않으며, 새로운 상태이상에 걸리지 않습니다.',
      EN: 'Immune to all status effects.\n\nExisting effects are not removed, but no new effects can be applied.'
    }
  },
  'Swamping': {
    key: 'condition_swamping',
    category: 'CONDITION',
    title: { KR: '💧 상태이상: 잠김', EN: '💧 Status: Swamping' },
    body: {
      KR: '늪지대 환경에 의해 회피율이 감소합니다.\n\n보스의 공격을 받을수록 중첩이 쌓이며 회피율 패널티가 커집니다.',
      EN: 'Evasion chance is reduced due to the swamp environment.\n\nStacks increase as you take boss attacks, increasing the evasion penalty.'
    }
  },
};

// ─── Utility: Build guide popup from gimmick rule key ─────────────────
const RULE_TO_GIMMICK: Record<string, string> = {
  // Chapter 1
  'BLEED_PROB': 'CH1_BLEED_PROB',
  'BAN_RANK': 'CH1_BAN_RANK',
  'BLIND': 'CH1_BLIND',
  'BAN_SUIT': 'CH1_BAN_SUIT',
  'BAN_HAND': 'CH1_BAN_HAND',
  // Chapter 3A
  'ACID_ATTACK': 'CH3A_ACID_ATTACK',
  'HEMATOPHAGY': 'CH3A_HEMATOPHAGY',
  'GHOST': 'CH3A_GHOST',
  'PETRIFIED_RULE': 'CH3A_PETRIFIED',
  // Chapter 3B
  'HARDNESS': 'CH3B_HARDNESS',
  'MUDDED_20PCT': 'CH3B_MUDDED',
  'MUDDED_40PCT': 'CH3B_MUDDED',
  'HOLD_BREATH': 'CH3B_HOLD_BREATH',
  'STEM_CELL': 'CH3B_STEM_CELL',
};

export function getGimmickGuide(ruleKey: string): GuidePopupData | null {
  const gimmickKey = RULE_TO_GIMMICK[ruleKey];
  if (!gimmickKey) return null;
  return GIMMICK_GUIDES[gimmickKey] || null;
}
