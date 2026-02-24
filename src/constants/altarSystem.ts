export interface TrophyDef {
    id: string;
    image: string;
    name: { KR: string; EN: string };
    desc: { KR: string; EN: string }; // Optional short description shown in inventory tooltips
    chapterInfo: string; // e.g. "Chapter 1 Stage 4"
}

export const TROPHIES: Record<string, TrophyDef> = {
    TR_1_4: {
        id: 'TR_1_4',
        image: 'trophy_hobgoblin.png',
        name: { KR: '고블린 로드에게 하사받은 단검', EN: 'Dagger Granted by the Goblin Lord' },
        desc: { KR: '고블린 로드에게 강함을 인정받은 자만 지닐 수 있는 단검.', EN: 'A dagger bestowed only upon those whose strength is acknowledged by the Goblin Lord.' },
        chapterInfo: 'CHAPTER 1 / STAGE 04'
    },
    TR_1_5: {
        id: 'TR_1_5',
        image: 'trophy_goblin shaman.png', // The user wrote 'trophy_goblin shaman.png'
        name: { KR: '고블린 제사장의 주술 지팡이', EN: "Goblin Shaman's Voodoo Staff" },
        desc: { KR: '알 수 없는 힘으로 울부짖는 지팡이.', EN: 'A staff wailing with unknown power.' },
        chapterInfo: 'CHAPTER 1 / STAGE 05'
    },
    TR_1_10: {
        id: 'TR_1_10',
        image: 'trophy_goblin lord.png',
        name: { KR: '고블린 로드의 황금 왕관', EN: "Goblin Lord's Golden Crown" },
        desc: { KR: '들판의 주인이었던 증표.', EN: 'The token of the ruler of the fields.' },
        chapterInfo: 'CHAPTER 1 / STAGE 10'
    },
    TR_2A_5: {
        id: 'TR_2A_5',
        image: 'trophy_scorpion.png',
        name: { KR: '신경맹독을 가진 전갈의 독침', EN: 'Stinger of the Neurotoxic Scorpion' },
        desc: { KR: '가벼운 스침만으로도 마비가 오는 치명적인 독침.', EN: 'A lethal stinger that paralyzes with a mere graze.' },
        chapterInfo: 'CHAPTER 2A / STAGE 05'
    },
    TR_2A_10: {
        id: 'TR_2A_10',
        image: 'trophy_sphinx.png',
        name: { KR: '피라미드 구조물의 핵 결정체', EN: 'Core Crystal of the Pyramid Structure' },
        desc: { KR: '고대 건축물의 동력이 되는 신비한 결정.', EN: 'A mysterious crystal powering ancient structures.' },
        chapterInfo: 'CHAPTER 2A / STAGE 10'
    },
    TR_2A_SP: {
        id: 'TR_2A_SP',
        image: 'trophy_sand dragon.png',
        name: { KR: '기력을 다한 모래 드래곤의 뿔', EN: 'Exhausted Sand Dragon\'s Horn' },
        desc: { KR: '모래 폭풍을 다루던 거대한 드래곤의 잔해.', EN: 'The remains of a massive dragon that manipulated sandstorms.' },
        chapterInfo: 'CHAPTER 2A / SP STAGE'
    },
    TR_2B_5: {
        id: 'TR_2B_5',
        image: 'trophy_orc chieftain.png', // trophy_orc chieftain.png (note: user had typo 'cheiftain' earlier, fixed here)
        name: { KR: '오크 지도자를 상징하는 뿔 투구', EN: 'Horned Helm Symbolizing the Orc Chieftain' },
        desc: { KR: '숲의 고함을 지배하는 자의 투구.', EN: 'Helm of the one who dominates the cries of the forest.' },
        chapterInfo: 'CHAPTER 2B / STAGE 05'
    },
    TR_2B_10: {
        id: 'TR_2B_10',
        image: 'trophy_high orc lord.png',
        name: { KR: '하이 오크 로드의 양쪽 귀', EN: 'Both Ears of the High Orc Lord' },
        desc: { KR: '그의 교만함을 잘라낸 전리품.', EN: 'A trophy severing his arrogance.' },
        chapterInfo: 'CHAPTER 2B / STAGE 10'
    },
    TR_2B_SP: {
        id: 'TR_2B_SP',
        image: 'trophy_high orc shaman.png',
        name: { KR: '하이 오크 제사장의 주술 지팡이', EN: 'High Orc Shaman\'s Voodoo Staff' },
        desc: { KR: '피와 절규로 빚어진 저주받은 지팡이.', EN: 'A cursed staff molded from blood and screams.' },
        chapterInfo: 'CHAPTER 2B / SP STAGE'
    }
};

export interface AltarSkillDef {
    id: string;
    tier: number;
    image: string;
    name: { KR: string; EN: string };
    desc: { KR: string; EN: string };
    cost: string[]; // Trophy IDs required
    prerequisites?: string[]; // Deprecated for complex logic, but we can just say "requires Tier N-1 > 0" dynamically.
}

export const ALTAR_SKILLS: Record<string, AltarSkillDef> = {
    '1A': {
        id: '1A',
        tier: 1,
        image: '1A_생존주의자(Prepper).png',
        name: { KR: '생존주의자', EN: 'Prepper' },
        desc: { KR: '최대 체력이 +25 증가한 채로 시작합니다.', EN: 'Start with +25 Max HP.' },
        cost: ['TR_1_4']
    },
    '1B': {
        id: '1B',
        tier: 1,
        image: '1B_날카로운 카드(Sharpen Cards).png',
        name: { KR: '날카로운 카드', EN: 'Sharpen Cards' },
        desc: { KR: '공격 시 추가 고정 데미지 +25.', EN: 'Attacks deal +25 extra fixed damage.' },
        cost: ['TR_1_4']
    },
    '2A': {
        id: '2A',
        tier: 2,
        image: '2A_순응(Acclimatization).png',
        name: { KR: '순응', EN: 'Acclimatization' },
        desc: { KR: '상태이상 피해 시 3턴 동안 턴당 체력 +5 회복(재생 효과).', EN: 'Taking debuff damage grants Regeneration (+5 HP for 3 turns).' },
        cost: ['TR_1_5', 'TR_1_10']
    },
    '2B': {
        id: '2B',
        tier: 2,
        image: '2B_물아일체(Oneness with Nature).png',
        name: { KR: '물아일체', EN: 'Oneness with Nature' },
        desc: { KR: '회피 발동 5% 증가 및 챕터 2B의 회피 제한 무시.', EN: '+5% Evasion. Negates evasion limits in Chapter 2B.' },
        cost: ['TR_1_5', 'TR_1_10']
    },
    '2A-1': {
        id: '2A-1',
        tier: 2,
        image: '2A-1_응용(Utilization).png',
        name: { KR: '응용', EN: 'Utilization' },
        desc: { KR: '공격 시 보스에게 50% 확률로 출혈 또는 중독 부여(중첩 불가).', EN: '50% chance to inflict Bleed or Poison on attack (no overlap).' },
        cost: ['TR_2A_5', 'TR_2A_10']
    },
    '2A-2': {
        id: '2A-2',
        tier: 2,
        image: '2A-2_생체 리듬 가속(Biorhythm Acceleration).png',
        name: { KR: '생체 리듬 가속', EN: 'Biorhythm Acceleration' },
        desc: { KR: '재생 효과와 최대 체력 증가량을 +20% 증폭.', EN: 'Amplify Regeneration amount and Max HP bonuses by +20%.' },
        cost: ['TR_2A_5', 'TR_2A_10']
    },
    '2B-1': {
        id: '2B-1',
        tier: 2,
        image: '2B-1_사냥꾼(Hunter).png',
        name: { KR: '사냥꾼', EN: 'Hunter' },
        desc: { KR: '명중률 감소 디버프 모면.', EN: 'Immune to accuracy reduction debuffs.' },
        cost: ['TR_2B_5', 'TR_2B_10']
    },
    '2B-2': {
        id: '2B-2',
        tier: 2,
        image: '2B-2_보호구 장착(Equipment Gear).png',
        name: { KR: '보호구 장착', EN: 'Equipment Gear' },
        desc: { KR: '보스로부터 받는 공격 데미지 30% 감소.', EN: 'Reduces boss attack damage by 30%.' },
        cost: ['TR_2B_5', 'TR_2B_10']
    }
};
