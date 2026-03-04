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
    desc: { KR: string; EN: string };   // Flavor text / Description
    effect: { KR: string; EN: string }; // Technical effect
    duration: { KR: string; EN: string };
    cost: string[]; // Trophy IDs required
}

export const ALTAR_SKILLS: Record<string, AltarSkillDef> = {
    // LEVEL 1
    '1A': {
        id: '1A',
        tier: 1,
        image: '1A_생존주의자(Prepper).png',
        name: { KR: '생존주의자', EN: 'Prepper' },
        desc: {
            KR: '낯선 공간에 빠르게 적응하며 코어 안정도가 높게 유지된다.',
            EN: 'Adapts quickly to unfamiliar spaces, maintaining high core stability.'
        },
        effect: {
            KR: '플레이어는 최대 체력이 +25 증가한 채로 시작한다.',
            EN: 'Player starts with +25 Max HP.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_1_4']
    },
    '1B': {
        id: '1B',
        tier: 1,
        image: '1B_날카로운 카드(Sharpen Cards).png',
        name: { KR: '날카로운 카드', EN: 'Sharpen Cards' },
        desc: {
            KR: '카드 연산의 정확도가 상승하여 공격의 위력이 강화된다.',
            EN: 'Calculation accuracy increases, enhancing attack power.'
        },
        effect: {
            KR: '플레이어 공격 시, 추가 고정 데미지 +25.',
            EN: 'When attacking, deals +25 additional fixed damage.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_1_4']
    },

    // LEVEL 2
    '2A': {
        id: '2A',
        tier: 2,
        image: '2A_응용(Utilization).png',
        name: { KR: '응용', EN: 'Utilization' },
        desc: {
            KR: '카드 공격이 노드 구조에 추가적인 이상 반응을 남긴다.',
            EN: 'Card attacks leave additional abnormal reactions in the node structure.'
        },
        effect: {
            KR: '공격 시 보스에게 ‘출혈(50% 확률)’과 ‘중독(50% 확률)’ 중 하나를 부여한다. 둘이 동시에 부여되진 않으나, 이미 하나가 걸려있을 때 다른 하나를 부가할 수 있다. (동종 중첩 불가, 디버프 종료 후 재부여 가능)',
            EN: 'Attacks have a 50% chance to inflict Bleed or Poison. Can apply different debuffs incrementally, but same debuffs do not stack.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_1_5', 'TR_1_10']
    },
    '2A-1': {
        id: '2A-1',
        tier: 2,
        image: '2A-1_생체 리듬 가속(Biorhythm Acceleration).png',
        name: { KR: '생체 리듬 가속', EN: 'Biorhythm Acceleration' },
        desc: {
            KR: '이 공간의 에너지 흐름에 적응하여 회복 효율이 증가한다.',
            EN: 'Adapts to energy flows, increasing recovery efficiency.'
        },
        effect: {
            KR: '플레이어가 받는 상태이상 재생(Regeneration) 효과와 영구적으로 적용되는 최대 체력 증가 효과의 증가량을 +20% 향상하여 적용 받는다.',
            EN: 'Increases the effectiveness of Regeneration and permanent Max HP bonuses by +20%.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2A_5', 'TR_2A_10']
    },
    '2A-2': {
        id: '2A-2',
        tier: 2,
        image: '2A-2_사냥꾼(Hunter).png',
        name: { KR: '사냥꾼', EN: 'Hunter' },
        desc: {
            KR: '전투 패턴을 읽기 시작하며 방해 효과에 흔들리지 않는다.',
            EN: 'Starts reading combat patterns, becoming unshakeable by disturbances.'
        },
        effect: {
            KR: '플레이어가 명중률 감소 디버프 효과 및 마비 효과로부터 면역된다. (모든 명중률 저하 및 마비 효과 기믹 무효화)',
            EN: 'Immune to accuracy reduction debuffs and paralysis effects (negates all accuracy drop and paralysis logic).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2A_5', 'TR_2A_10']
    },
    '2B': {
        id: '2B',
        tier: 2,
        image: '2B_물아일체(Oneness with Nature).png',
        name: { KR: '물아일체', EN: 'Oneness with Nature' },
        desc: {
            KR: '환경 흐름과 동기화되어 회피 능력이 향상된다.',
            EN: 'Synchronizes with environmental flow, enhancing evasion.'
        },
        effect: {
            KR: '플레이어가 받는 상태이상 ‘회피(Avoiding)’의 발동 확률을 영구적으로 +5% 올려준다. 또한, ‘챕터 2B 깊은 숲’과 같이 환경적 요인으로 플레이어의 회피 효과가 제한되는 로직을 무시하고 우선 적용한다.',
            EN: '+5% permanent Evasion chance. Negates environmental evasion restrictions (e.g., Chapter 2B).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_1_5', 'TR_1_10']
    },
    '2B-1': {
        id: '2B-1',
        tier: 2,
        image: '2B-1_보호구 장착(Equipment Gear).png',
        name: { KR: '보호구 장착', EN: 'Equipment Gear' },
        desc: {
            KR: '기본적인 방어 프로토콜이 활성화된다.',
            EN: 'Basic defense protocols are activated.'
        },
        effect: {
            KR: '보스로부터 받는 공격(상태 이상 피해 제외)을 30% 감소하여 적용 받는다.',
            EN: 'Reduces damage taken from boss attacks by 30% (excludes status effect damage).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_5', 'TR_2B_10']
    },
    '2B-2': {
        id: '2B-2',
        tier: 2,
        image: '2B-2_순응(Acclimatization).png',
        name: { KR: '순응', EN: 'Acclimatization' },
        desc: {
            KR: '이상 상태에 점차 적응하며 회복 반응이 발생한다.',
            EN: 'Gradually adapts to abnormal states, triggering recovery reactions.'
        },
        effect: {
            KR: '플레이어는 상태이상에 대한 피해를 받을 시, 3턴 동안 상태이상 ‘재생(Regeneration)’ 효과를 얻으며, 한 번 회복될 때, +5씩 회복한다.',
            EN: 'When taking status effect damage, gain "Regeneration" for 3 turns, restoring +5 HP each time.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_5', 'TR_2B_10']
    },

    // LEVEL 3
    '3A-1': {
        id: '3A-1',
        tier: 3,
        image: '3A-1_색각이상(Dyschromatopsia).png',
        name: { KR: '색각 이상', EN: 'Dyschromatopsia' },
        desc: {
            KR: '카드 구분 규칙이 순간적으로 흐려진다.',
            EN: 'Card classification rules momentarily blur.'
        },
        effect: {
            KR: '스테이지 마다, 단 2회까지만 같은 카드의 색끼리(스페이드와 클로버는 동일한 모양으로 취급, 하트와 다이아몬드도 서로 동일한 모양으로 취급), 카드 족보를 구성하여 공격할 수 있다. (세션 당 적용)\n**인게임 제단 스킬 슬롯에서 남은 횟수가 표기되며, 사용할 때 마다, 카운트 되며, 전부 사용했을 시에는 더 이상 같은 색깔의 다른 모양을 같은 모양으로 취급하지 않는다.',
            EN: 'Up to 2 times per stage, you can form hands using cards of the same color (Spades/Clubs count as same, Hearts/Diamonds count as same). Remaining uses are shown in the skill slot.'
        },
        duration: { KR: '2회/스테이지(2 Times/Stage)', EN: '2 Times/Stage' },
        cost: []
    },
    '3A-2': {
        id: '3A-2',
        tier: 3,
        image: '3A-2_밑장 빼기(Bottom Deal).png',
        name: { KR: '밑장 빼기', EN: 'Bottom Deal' },
        desc: {
            KR: '카드 흐름을 읽어 조커를 끌어낼 확률이 증가한다.',
            EN: 'Reads card flow, increasing the chance to draw Jokers.'
        },
        effect: {
            KR: '조커 등장 확률이 영구적으로 5% 증가한다. (세션 당 적용)',
            EN: 'Joker draw probability permanently increases by 5%.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '3A-3': {
        id: '3A-3',
        tier: 3,
        image: '3A-3_확률 왜곡(Probability Distortion).png',
        name: { KR: '확률 왜곡', EN: 'Probability Distortion' },
        desc: {
            KR: '카드 교체 과정에서 확률 흐름이 흔들린다.',
            EN: 'Probability flow fluctuates during card swaps.'
        },
        effect: {
            KR: '플레이어가 카드를 교체할 때 25% 확률로 추가 카드 교체 기회를 1회 얻는다. (사용 시 ‘Draws +1’ 안내 문구 출력)',
            EN: '25% chance to gain 1 extra swap chance when swapping cards. (Displays "Draws +1")'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '3B-1': {
        id: '3B-1',
        tier: 3,
        image: '3B-1_위상 전이(Phase Transition).png',
        name: { KR: '위상 전이', EN: 'Phase Transition' },
        desc: {
            KR: '치명적 순간 코어 위상이 잠시 이동한다.',
            EN: 'Core phase momentarily shifts during critical moments.'
        },
        effect: {
            KR: 'HP가 0 이하로 떨어지는 치명적인 피해를 입었을 때 ‘HP 1’ 로 생존하고, 즉시 수중패의 랜덤한 카드 한 장을 조커 카드로 교체해준다. (한 세션 당 1회만 발동됨)',
            EN: 'Survive fatal damage with 1 HP and immediately replace a random card in hand with a Joker. (Once per session)'
        },
        duration: { KR: '1회/세션(1 Time/Session)', EN: '1 Time/Session' },
        cost: []
    },
    '3B-2': {
        id: '3B-2',
        tier: 3,
        image: '3B-2_노드 간섭(Node Interference).png',
        name: { KR: '노드 간섭', EN: 'Node Interference' },
        desc: {
            KR: '노드 구조에 간섭하여 공격 흐름을 약화시킨다.',
            EN: 'Interferes with node structure, weakening the attack flow.'
        },
        effect: {
            KR: '스테이지 마다, 보스가 특수 공격 시, 35% 확률로 해당 공격의 피해량을 50% 감소하여 적용받으며, 동시에 해당 공격 피해량의 30%를 보스에게 고정 피해로 되돌려준다. (대상: 모래폭풍, 부패 폭발 등)',
            EN: '35% chance to reduce Special Attack damage by 50% and reflect 30% of that damage back to the boss.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '3B-3': {
        id: '3B-3',
        tier: 3,
        image: '3B-3_공생 관계(Symbiotic Relationship).png',
        name: { KR: '공생 관계', EN: 'Symbiotic Relationship' },
        desc: {
            KR: '플레이어 코어가 주변 에너지 흐름과 연결된다.',
            EN: 'Player core connects with surrounding energy flows.'
        },
        effect: {
            KR: '보스의 재생과 같은 상태이상 및 기타 특수 효과에 의한 HP 회복이 될 때, 플레이어도 보스와 동일한 회복량 만큼 회복한다. (% 수치가 아닌, 정수로 반영)',
            EN: 'When the boss recovers HP via status effects or mechanics, the player recovers the same flat amount.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },

    // LEVEL 4
    '4A-1': {
        id: '4A-1',
        tier: 4,
        image: '4A-1_패턴 교란(Pattern Disruption).png',
        name: { KR: '패턴 교란', EN: 'Pattern Disruption' },
        desc: {
            KR: '카드 연산 패턴에 오류가 발생한다.',
            EN: 'Errors occur in card calculation patterns.'
        },
        effect: {
            KR: '플레이어가 공격 시, 20% 확률로 카드 족보의 보너스 피해량을 ‘한 단계 상위 족보’의 피해량으로 적용하여 계산한다.',
            EN: '20% chance to apply bonus damage from one tier higher than the actual hand type.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '4A-2': {
        id: '4A-2',
        tier: 4,
        image: '4A-2_과부하(Overloaded).png',
        name: { KR: '과부하', EN: 'Overloaded' },
        desc: {
            KR: '같은 패턴의 공격이 반복될수록 연산 출력이 증가한다.',
            EN: 'Calculation output increases as the same attack pattern repeats.'
        },
        effect: {
            KR: '같은 족보를 연속 사용 시, 두 번째부터 플레이어가 보스에게 가하는 피해량이 10% 증가한다. (최대 3번까지 중첩)',
            EN: 'Using the same hand consecutively increases damage by 10% from the second attack. (Max 3 stacks)'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '4A-3': {
        id: '4A-3',
        tier: 4,
        image: '4A-3_불안정 동조(Instability Resonance).png',
        name: { KR: '불안정 동조', EN: 'Instability Resonance' },
        desc: {
            KR: '불안정한 코어와 공격이 공명한다.',
            EN: 'Attacks resonate with an unstable core.'
        },
        effect: {
            KR: '보스의 코어 안정도(HP)가 낮을수록, 플레이어의 공격력이 증가한다. (보스 HP 50% 이하: +5%, 25% 이하: +10%)',
            EN: 'Damage increases as boss HP decreases (Below 50%: +5%, Below 25%: +10%).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '4B-1': {
        id: '4B-1',
        tier: 4,
        image: '4B-1_위험 예측(Threat Prediction).png',
        name: { KR: '위험 예측', EN: 'Threat Prediction' },
        desc: {
            KR: '전투 시작 시 공격 흐름을 감지한다.',
            EN: 'Detects attack flow at the start of battle.'
        },
        effect: {
            KR: '전투 시작 시, 보스의 첫 공격을 100% 확률로 회피한다. (세션 당 적용, 모든 챕터의 10 보스 스테이지에서만 한정적으로 적용됨)',
            EN: '100% chance to evade the boss\'s first attack. Only applies to Chapter-end Boss stages (Stage 10/SP).'
        },
        duration: { KR: '1회/스테이지(1 Time/Stage)', EN: '1 Time/Stage' },
        cost: []
    },
    '4B-2': {
        id: '4B-2',
        tier: 4,
        image: '4B-2_노드 붕괴(Node Collapse).png',
        name: { KR: '노드 붕괴', EN: 'Node Collapse' },
        desc: {
            KR: '다중 이상 상태가 코어 구조를 붕괴시킨다.',
            EN: 'Multiple abnormal states collapse the core structure.'
        },
        effect: {
            KR: '플레이어가 보스에게 상태이상(디버프) 효과를 2개 이상을 부여한 상태에서 공격 시, 추가 고정 피해 +60을 가한다. (스테이지 당 1회, 턴 당 1회)',
            EN: 'Deals +60 additional fixed damage when attacking a boss with 2 or more debuffs. (Once per stage, once per turn)'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '4B-3': {
        id: '4B-3',
        tier: 4,
        image: '4B-3_파편 회수(Fragments Recovery).png',
        name: { KR: '파편 회수', EN: 'Fragments Recovery' },
        desc: {
            KR: '코어 안정도가 낮아지면 주변 노드 파편이 끌려와 부분화된다.',
            EN: 'Node fragments are pulled in for partial recovery as core stability drops.'
        },
        effect: {
            KR: '플레이어의 코어 안정도(HP)가 25% 이하일 때, 플레이어의 카드 교체 가능 횟수가 2회 추가된다.',
            EN: 'Gain +2 extra swap chances when player HP is 25% or below.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },

    // LEVEL 5
    '5A-1': {
        id: '5A-1',
        tier: 5,
        image: '5A-1_적응 연산(Adaptive Calculation).png',
        name: { KR: '적응 연산', EN: 'Adaptive Calculation' },
        desc: {
            KR: '전투 패턴을 분석하며 카드 연산 효율이 점차 상승한다.',
            EN: 'Calculation efficiency gradually increases by analyzing combat patterns.'
        },
        effect: {
            KR: '플레이어가 공격 성공 시마다, 해당 전투 동안 공격 피해량이 +5%씩 중첩되어 상승한다. (최대 10회 중첩, +50%까지)',
            EN: 'Each successful attack increases damage by +5% for the duration of the battle. (Max 10 stacks, up to +50%)'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '5A-2': {
        id: '5A-2',
        tier: 5,
        image: '5A-2_확률 정렬(Probability Alignment).png',
        name: { KR: '확률 정렬', EN: 'Probability Synchronization' },
        desc: {
            KR: '카드 확률 흐름을 동기화하여 무늬 패턴이 안정화된다.',
            EN: 'Pattern stability is synchronized with card probability flow.'
        },
        effect: {
            KR: '카드 교체 시, 새로 등장할 카드 중, 1장이 수중패 카드 중 가장 많은 모양(무늬)으로 변경된다. (확률이 같을 경우는 같은 모양에서 랜덤으로 배정)',
            EN: 'When swapping, 1 new card is guaranteed to be the majority suit currently in hand.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '5B-1': {
        id: '5B-1',
        tier: 5,
        image: '5B-1_코어 공명(Core Resonance).png',
        name: { KR: '코어 공명', EN: 'Core Resonance' },
        desc: {
            KR: '플레이어 코어가 불안정한 노드와 공명하며 공격이 증폭된다.',
            EN: 'Player core resonates with unstable nodes, amplifying attacks.'
        },
        effect: {
            KR: '보스 HP가 50% 이하일 때, 플레이어 공격 피해량 +15% 증가되어 적용된다.',
            EN: 'Player damage increases by +15% when boss HP is 50% or below.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '5B-2': {
        id: '5B-2',
        tier: 5,
        image: '5B-2_연산 안정화(Calculation Stabilization).png',
        name: { KR: '연산 안정화', EN: 'Calculation Stabilization' },
        desc: {
            KR: '카드 연산 오차를 줄여 숫자 패턴이 안정화된다.',
            EN: 'Number patterns stabilize by reducing calculation errors.'
        },
        effect: {
            KR: '카드 교체 시, 두 장을 교체할 때, 교체될 두 카드가 40% 확률로 ‘같은 숫자 카드’로 등장한다.',
            EN: '40% chance that two swapped cards will have the same rank.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },

    // LEVEL 6
    '6A': {
        id: '6A',
        tier: 6,
        image: '6A_인과 재배열(Causality Rearrangement).png',
        name: { KR: '인과 재배열', EN: 'Causality Rearrangement' },
        desc: {
            KR: '노드 인과 흐름이 어긋나며 공격 결과가 중복될 수 있다.',
            EN: 'Causality flow shifts, potentially duplicating attack results.'
        },
        effect: {
            KR: '카드 공격 시, 8% 확률로 플레이어의 공격이 두 번 적용된다. (공격 시 적용되는 모든 효과도 두 번 적용된다.)',
            EN: '8% chance for an attack to apply twice (including all side effects).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '6B': {
        id: '6B',
        tier: 6,
        image: '6B_엔트로피 제어(Entropy Control).png',
        name: { KR: '엔트로피 제어', EN: 'Entropy Control' },
        desc: {
            KR: '노드 간섭을 억제하여 카드 인터페이스를 안정화한다.',
            EN: 'Stabilizes card interface by suppressing node interference.'
        },
        effect: {
            KR: '플레이어는 전투 중 다음 효과의 영향을 받지 않는다. \n- BLIND (카드 뒤집힘) \n- BANNED (카드 금지: 모양 금지, 특정 숫자 금지) \n모든 카드는 항상 정상적으로 표시되고, 점수가 정상 계산된다. (예외 로직)',
            EN: 'Immune to BLIND and BANNED rules. All cards display normally and score fully.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },

    // LEVEL 7
    '7': {
        id: '7',
        tier: 7,
        image: '7_시스템 과부하(System Overload).png',
        name: { KR: '시스템 과부하', EN: 'System Overload' },
        desc: {
            KR: '시스템의 가장 깊은 곳, 인과를 결정하는 근원적 코드에 접속한다.',
            EN: 'Accesses the deepest source code that determines causality.'
        },
        effect: {
            KR: '턴 종료 시, 5% 확률로 현재 수중패의 모든 카드가 범용 카드(JOKER)로 변환된다. (스테이지당 1회 발동)\n+ 발동 시, 안내 메시지 “연산 오류 감지! 카드 패턴이 붕괴되었습니다!”',
            EN: '5% chance at turn end to convert all cards in hand to Jokers. (Once per stage)'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    }
};
