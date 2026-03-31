export interface TrophyDef {
    id: string;
    image: string;
    name: { KR: string; EN: string };
    desc: { KR: string; EN: string }; // Optional short description shown in inventory tooltips
    chapterInfo: string; // e.g. "Chapter 1 Stage 4"
}

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

export interface AltarPath {
    from: string;
    to: string;
}

export const ALTAR_PATHS: AltarPath[] = [
    { from: '1A', to: '2A' },
    { from: '1B', to: '2B' },

    { from: '2A', to: '3A-1' },
    { from: '2A', to: '3A-2' },
    { from: '2B', to: '3B-1' },
    { from: '2B', to: '3B-2' },

    { from: '3A-1', to: '4A-1' },
    { from: '3A-1', to: '4A-2' },
    { from: '3A-2', to: '4A-3' },
    { from: '3A-2', to: '4B-1' },
    { from: '3B-1', to: '4A-3' },
    { from: '3B-1', to: '4B-1' },
    { from: '3B-2', to: '4B-2' },
    { from: '3B-2', to: '4B-3' },

    { from: '4A-1', to: '5A-1' },
    { from: '4A-1', to: '5A-2' },
    { from: '4A-2', to: '5A-1' },
    { from: '4A-2', to: '5A-2' },
    { from: '4A-3', to: '5A-3' },
    { from: '4A-3', to: '5B-1' },
    { from: '4B-1', to: '5A-3' },
    { from: '4B-1', to: '5B-1' },
    { from: '4B-2', to: '5B-2' },
    { from: '4B-2', to: '5B-3' },
    { from: '4B-3', to: '5B-2' },
    { from: '4B-3', to: '5B-3' },

    { from: '5A-1', to: '6A-1' },
    { from: '5A-2', to: '6A-1' },
    { from: '5A-2', to: '6A-2' },
    { from: '5A-3', to: '6A-2' },
    { from: '5B-1', to: '6B-1' },
    { from: '5B-2', to: '6B-1' },
    { from: '5B-2', to: '6B-2' },
    { from: '5B-3', to: '6B-2' },

    { from: '6A-1', to: '7A' },
    { from: '6A-2', to: '7A' },
    { from: '6B-1', to: '7B' },
    { from: '6B-2', to: '7B' },

    { from: '7A', to: '8' },
    { from: '7B', to: '8' },
];

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
    },
    TR_3A_07: {
        id: 'TR_3A_07',
        image: 'trophy_crystal golem.png',
        name: { KR: '크리스탈 골렘의 오팔 조각', EN: 'Opal Fragment of the Crystal Golem' },
        desc: { KR: '오랜 시간 동굴의 에너지를 응축하여 찬란하게 빛나는 희귀한 오팔 조각.', EN: 'A rare opal fragment that shines brilliantly, condensing the cave\'s energy over a long time.' },
        chapterInfo: 'CHAPTER 3A / STAGE 07'
    },
    TR_3A_10: {
        id: 'TR_3A_10',
        image: 'trophy_hydra.png',
        name: { KR: '하이드라의 신화독', EN: 'Mythical Poison of the Hydra' },
        desc: { KR: '닿는 즉시 모든 것을 부식시키는, 전설 속 괴물의 치명적인 독력이 담긴 정수.', EN: 'An essence containing the lethal poison of a legendary monster, corroding everything it touches instantly.' },
        chapterInfo: 'CHAPTER 3A / STAGE 10'
    },
    TR_3B_06: {
        id: 'TR_3B_06',
        image: 'trophy_lizard slann.png',
        name: { KR: '리자드 슬란의 명상 제어 지팡이', EN: 'Meditation Control Staff of the Lizard Slann' },
        desc: { KR: '늪지대의 흐름을 명상으로 제어하던 슬란의 힘이 깃든 지팡이.', EN: 'A staff imbued with Slann\'s power, which controlled the swamp\'s flow through meditation.' },
        chapterInfo: 'CHAPTER 3B / STAGE 06'
    },
    TR_3B_10: {
        id: 'TR_3B_10',
        image: 'trophy_lizard king.png',
        name: { KR: '리자드 킹의 근원 증폭 목걸이', EN: 'Lizard King\'s Source Amplification Necklace' },
        desc: { KR: '늪지대 근원의 힘을 제어할 자격을 갖춘 자의 목걸이', EN: 'A necklace belonging to one qualified to control the power of the swamp\'s source.' },
        chapterInfo: 'CHAPTER 3B / STAGE 10'
    }
};

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
        cost: ['TR_1_4', 'TR_1_5']
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
        cost: ['TR_1_4', 'TR_1_5']
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
            KR: "공격 시 보스에게 '출혈(50% 확률)'과 '중독(50% 확률)' 중 하나를 부여한다. 둘이 동시에 부여되진 않으나, 이미 하나가 걸려있을 때 다른 하나를 부가할 수 있다. (동종 중첩 불가, 디버프 종료 후 재부여 가능)",
            EN: "Attacks have a 50% chance to inflict Bleed or Poison. Different debuffs can be active simultaneously, but same debuffs do not stack."
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_1_10']
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
            KR: "플레이어가 받는 상태이상 '회피(Avoiding)'의 발동 확률을 영구적으로 +5% 올려준다. 또한, '챕터 2B 깊은 숲'과 같이 환경적 요인으로 플레이어의 회피 효과가 제한되는 로직을 무시하고 우선 적용된다.",
            EN: "+5% permanent Evasion chance. Negates environmental evasion restrictions (e.g., Chapter 2B)."
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_1_10']
    },

    // LEVEL 3
    '3A-1': {
        id: '3A-1',
        tier: 3,
        image: '3A-1_생체 리듬 가속(Biorhythm Acceleration).png',
        name: { KR: '생체 리듬 가속', EN: 'Biorhythm Acceleration' },
        desc: {
            KR: '이 공간의 에너지 흐름에 적응하여 회복 효율이 증가한다.',
            EN: 'Adapts to energy flows, increasing recovery efficiency.'
        },
        effect: {
            KR: "플레이어는 보스로부터 피해를 받았을 때, '재생(Regeneration)' 효과를 얻는다. 생체리듬가속에 의해 얻어진 '재생' 효과는 턴 종료 시 마다, +10씩 회복하는 효과로 적용받는다. 또한, 추가로 플레이어에게 영구적으로 적용되는 최대 체력 증가 효과의 증가량을 +20% 향상하여 적용 받는다.",
            EN: "Gains 'Regeneration' when taking damage from the boss (+10 HP/turn). Also increases the effectiveness of permanent Max HP bonuses by +20%."
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_5', 'TR_2A_5']
    },
    '3A-2': {
        id: '3A-2',
        tier: 3,
        image: '3A-2_사냥꾼(Hunter).png',
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
        cost: ['TR_2B_5', 'TR_2A_5']
    },
    '3B-1': {
        id: '3B-1',
        tier: 3,
        image: '3B-1_보호구 장착(Equipment Gear).png',
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
        cost: ['TR_2B_5', 'TR_2A_5']
    },
    '3B-2': {
        id: '3B-2',
        tier: 3,
        image: '3B-2_순응(Acclimatization).png',
        name: { KR: '순응', EN: 'Acclimatization' },
        desc: {
            KR: '이상 상태에 점차 적응하며 회복 반응이 발생한다.',
            EN: 'Gradually adapts to abnormal states, triggering recovery reactions.'
        },
        effect: {
            KR: "플레이어는 상태이상에 대한 피해 발생 시, 3턴 동안 최대 체력의 5%에 해당하는 수치만큼 회복(HP가 감소되는 디버프 상태이상이 유지되는 기간 동안)하는 '재생(Regeneration)' 효과를 얻는다. (단, 3턴 종료 후, 상태이상 피해가 발생하지 않는다면, 재생 효과는 발동되지 않는다.)",
            EN: 'When taking status effect damage, gain "Regeneration" for 3 turns, restoring 5% of Max HP each turn.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_5', 'TR_2A_5']
    },

    // LEVEL 4
    '4A-1': {
        id: '4A-1',
        tier: 4,
        image: '4A-1_색각이상(Dyschromatopsia).png',
        name: { KR: '색각이상', EN: 'DYSCHROMA-\nTOPSIA' },
        desc: {
            KR: '카드 문양의 색을 인지하는 방식에 오차가 발생한다.',
            EN: 'Errors occur in the way card suit colors are perceived.'
        },
        effect: {
            KR: '스킬 활성화 시 카드 족보 판정에서 같은 색깔의 문양(하트/다이아몬드, 스페이드/클로버)을 동일한 문양으로 간주한다. (해당 효과로 색상 통합이 이뤄져 실제로 플러시 계열 족보가 발동되었을 때만 횟수가 차감됨)\n※ 인게임 내 제단 스킬 슬롯을 클릭하여 능력을 켜고 끌 수 있습니다. (활성화: 빨간 테두리 / 비활성화: 파란 테두리)',
            EN: 'When active, treats suits of the same color (Heart/Diamond, Spade/Club) as the same suit. (Consumes 1 use ONLY when a Flush-type hand is successfully formed using color integration)\n* Click the Altar Skill slot in-game to toggle the ability. (Active: Red Border / Inactive: Blue Border)'
        },
        duration: { KR: '스테이지 당 1회(0/1)', EN: '1 Use per stage (0/1)' },
        cost: ['TR_2B_10', 'TR_2A_10', 'TR_3A_07', 'TR_3B_06']
    },
    '4A-2': {
        id: '4A-2',
        tier: 4,
        image: '4A-2_밑장 빼기(Bottom Deal).png',
        name: { KR: '밑장빼기', EN: 'Bottom Deal' },
        desc: {
            KR: '카드 덱의 흐름을 조작하여 특수한 카드를 끌어올린다.',
            EN: 'Manipulates the deck flow to bring up special cards.'
        },
        effect: {
            KR: '카드 덱 초기화 및 리필 시, 범용 카드(JOKER)가 등장할 확률이 +5% 증가한다.',
            EN: 'Increases the probability of Jokers appearing in the deck by +5%.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_10', 'TR_2A_10', 'TR_3A_07', 'TR_3B_06']
    },
    '4A-3': {
        id: '4A-3',
        tier: 4,
        image: '4A-3_확률 왜곡(Probability Distortion).png',
        name: { KR: '확률왜곡', EN: 'Probability Distortion' },
        desc: {
            KR: '카드 교체 과정에서 확률 흐름이 흔들린다.',
            EN: 'Probability flow fluctuates during card swaps.'
        },
        effect: {
            KR: '플레이어가 카드를 교체할 때 25% 확률로 교체 기회를 소모하지 않는다. (안내 문구: Draws +1)',
            EN: '25% chance to not consume a swap chance when swapping cards. (Displays "Draws +1")'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_10', 'TR_2A_10', 'TR_3A_07', 'TR_3B_06']
    },
    '4B-1': {
        id: '4B-1',
        tier: 4,
        image: '4B-1_위상 전이(Phase Transition).png',
        name: { KR: '위상전이', EN: 'Phase Transition' },
        desc: {
            KR: '치명적인 피해가 발생하려는 찰나, 코어를 다른 차원으로 전이시킨다.',
            EN: 'Transfers the core to another dimension just before fatal damage occurs.'
        },
        effect: {
            KR: '플레이어의 HP가 0이 될 때, 1회에 한해 HP 1로 생존하며 수중패의 카드 중 무작위 1장을 범용 카드(JOKER)로 변환한다. (스테이지당 1회)',
            EN: 'Once per stage, survives with 1 HP when taking fatal damage and converts a random card in hand to a Joker.'
        },
        duration: { KR: '1회/스테이지(1 Time/Stage)', EN: '1 Time/Stage' },
        cost: ['TR_2B_10', 'TR_2A_10', 'TR_3A_07', 'TR_3B_06']
    },
    '4B-2': {
        id: '4B-2',
        tier: 4,
        image: '4B-2_노드 간섭(Node Interference).png',
        name: { KR: '노드간섭', EN: 'Node Interference' },
        desc: {
            KR: '보스의 공격 파동에 간섭하여 피해를 역전시킨다.',
            EN: 'Interferes with the boss\'s attack wave to reverse the damage.'
        },
        effect: {
            KR: '보스의 특수 공격(모래 폭풍, 번개 등)에 의한 피해량을 50% 감소시키고, 감소시킨 수치만큼 보스에게 반사 피해를 준다.',
            EN: 'Reduces boss special attack damage by 50% and reflects the reduced amount back to the boss.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_10', 'TR_2A_10', 'TR_3A_07', 'TR_3B_06']
    },
    '4B-3': {
        id: '4B-3',
        tier: 4,
        image: '4B-3_공생 관계(Symbiotic Relationship).png',
        name: { KR: '공생관계', EN: 'Symbiotic Relationship' },
        desc: {
            KR: '플레이어 코어와 주변 에너지 흐름과 연결된다.',
            EN: 'Player core connects with surrounding energy flows.'
        },
        effect: {
            KR: '보스가 상태이상(재생 등)으로 HP를 회복할 때, 플레이어도 HP를 회복한다. (단, 회복량은 보스가 회복하는 수치의 80%만큼만 회복한다.)',
            EN: 'When the boss recovers HP via status effects, the player also recovers HP equal to 80% of the boss\'s recovered amount.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_2B_10', 'TR_2A_10', 'TR_3A_07', 'TR_3B_06']
    },

    // LEVEL 5
    '5A-1': {
        id: '5A-1',
        tier: 5,
        image: '5A-1_패턴 교란(Pattern Disruption).png',
        name: { KR: '패턴교란', EN: 'Pattern Disruption' },
        desc: {
            KR: '카드 연산 패턴에 오류가 발생한다.',
            EN: 'Errors occur in card calculation patterns.'
        },
        effect: {
            KR: '플레이어가 공격 시, 20% 확률로 카드 족보의 보너스 피해량을 ‘한 단계 상위 족보’의 피해량으로 적용하여 계산한다.',
            EN: '20% chance to apply bonus damage from one tier higher than the actual hand type.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_3A_10', 'TR_3B_10', 'TR_2A_SP']
    },
    '5A-2': {
        id: '5A-2',
        tier: 5,
        image: '5A-2_과부하(Overloaded).png',
        name: { KR: '과부하', EN: 'Overloaded' },
        desc: {
            KR: '같은 패턴의 공격이 반복될수록 연산 출력이 증가한다.',
            EN: 'Calculation output increases as the same attack pattern repeats.'
        },
        effect: {
            KR: '같은 족보를 연속 사용 시, 두 번째부터 플레이어가 보스에게 가하는 피해량이 10% 증가한다. (최대 3번까지 중첩, 최대 +30%)',
            EN: 'Using the same hand consecutively increases damage by 10% from the second attack. (Max 3 stacks, +30%)'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_3A_10', 'TR_3B_10', 'TR_2A_SP']
    },
    '5A-3': {
        id: '5A-3',
        tier: 5,
        image: '5A-3_불안정 동조(Instability Resonance).png',
        name: { KR: '불안정 동조', EN: 'Instability Resonance' },
        desc: {
            KR: '불안정한 코어와 공격이 공명한다.',
            EN: 'Attacks resonate with an unstable core.'
        },
        effect: {
            KR: '보스의 코어 안정도(HP)가 낮을수록 플레이어의 공격력이 증가한다. (보스 HP 50% 이하: +5%, 25% 이하: +10%)',
            EN: 'Damage increases as boss HP decreases (Below 50%: +5%, Below 25%: +10%).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_3A_10', 'TR_3B_10', 'TR_2A_SP']
    },
    '5B-1': {
        id: '5B-1',
        tier: 5,
        image: '5B-1_위험 예측(Threat Prediction).png',
        name: { KR: '위험예측', EN: 'Threat Prediction' },
        desc: {
            KR: '전투 시작 시 공격 흐름을 감지한다.',
            EN: 'Detects attack flow at the start of battle.'
        },
        effect: {
            KR: '전투 시작 시, 보스의 첫 공격을 100% 회피한다. (챕터 보스 스테이지 10/11에서만 적용)',
            EN: '100% chance to evade the boss\'s first attack. Only applies to Chapter Boss stages.'
        },
        duration: { KR: '1회/스테이지(1 Time/Stage)', EN: '1 Time/Stage' },
        cost: ['TR_3A_10', 'TR_3B_10', 'TR_2B_SP']
    },
    '5B-2': {
        id: '5B-2',
        tier: 5,
        image: '5B-2_노드 붕괴(Node Collapse).png',
        name: { KR: '노드붕괴', EN: 'Node Collapse' },
        desc: {
            KR: '코어 안정도가 낮아질수록 노드 구조가 붕괴하며 공격 에너지가 증폭된다.',
            EN: 'As core stability decreases, the node structure collapses and attack energy is amplified.'
        },
        effect: {
            KR: '플레이어의 코어 안정도(HP)가 낮아질수록 공격 시 추가 고정 피해를 가한다. (HP 80% 이하:+10, 50% 이하:+20, 30% 이하:+30)',
            EN: 'As player HP decreases, deals additional fixed damage on attack. (HP 80% or below: +10, 50%: +20, 30%: +30)'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_3A_10', 'TR_3B_10', 'TR_2B_SP']
    },
    '5B-3': {
        id: '5B-3',
        tier: 5,
        image: '5B-3_파편 회수(Fragments Recovery).png',
        name: { KR: '파편회수', EN: 'Fragments Recovery' },
        desc: {
            KR: '코어 안정도가 낮아지면 주변 노드 파편이 끌려와 부분화된다.',
            EN: 'Node fragments are pulled in for partial recovery as core stability drops.'
        },
        effect: {
            KR: '플레이어의 HP가 25% 이하일 때, 카드 교체 가능 횟수가 2회 추가된다.',
            EN: 'Gain +2 extra swap chances when player HP is 25% or below.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: ['TR_3A_10', 'TR_3B_10', 'TR_2B_SP']
    },

    // LEVEL 6
    '6A-1': {
        id: '6A-1',
        tier: 6,
        image: '6A-1_적응 연산(Adaptive Calculation).png',
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
    '6A-2': {
        id: '6A-2',
        tier: 6,
        image: '6A-2_확률 정렬(Probability Alignment).png',
        name: { KR: '확률정렬', EN: 'Probability Synchronization' },
        desc: {
            KR: '카드 확률 흐름을 동기화하여 무늬 패턴이 안정화된다.',
            EN: 'Pattern stability is synchronized with card probability flow.'
        },
        effect: {
            KR: '카드 교체 시, 새로 등장할 카드 중 1장이 수중패 카드 중 가장 많은 문양으로 변경된다. (확률이 같을 경우는 무작위)',
            EN: 'When swapping, 1 new card is guaranteed to be the majority suit currently in hand.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '6B-1': {
        id: '6B-1',
        tier: 6,
        image: '6B-1_코어 공명(Core Resonance).png',
        name: { KR: '코어 공명', EN: 'Core Resonance' },
        desc: {
            KR: '플레이어 코어가 불안정한 노드와 공명하며 공격이 증폭된다.',
            EN: 'Player core resonates with unstable nodes, amplifying attacks.'
        },
        effect: {
            KR: '보스 HP가 50% 이하일 때, 플레이어 공격 피해량이 +15% 증가한다.',
            EN: 'Player damage increases by +15% when boss HP is 50% or below.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '6B-2': {
        id: '6B-2',
        tier: 6,
        image: '6B-2_연산 안정화(Calculation Stabilization).png',
        name: { KR: '연산 안정화', EN: 'Calculation Stabilization' },
        desc: {
            KR: '카드 연산 오차를 줄여 숫자 패턴이 안정화된다.',
            EN: 'Number patterns stabilize by reducing calculation errors.'
        },
        effect: {
            KR: '카드 드로우 시 40% 확률로 동일한 숫자의 카드 2장이 세트로 등장한다.',
            EN: '40% chance that two swapped cards will have the same rank.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },

    // LEVEL 7
    '7A': {
        id: '7A',
        tier: 7,
        image: '7A_인과 재배열(Causality Rearrangement).png',
        name: { KR: '인과재배열', EN: 'Causality Rearrangement' },
        desc: {
            KR: '노드 인과 흐름이 어긋나며 공격 결과가 중복될 수 있다.',
            EN: 'Causality flow shifts, potentially duplicating attack results.'
        },
        effect: {
            KR: '플레이어 공격 시 8% 확률로 공격이 두 번 적용된다. (부가 효과 포함)',
            EN: '8% chance for an attack to apply twice (including all side effects).'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },
    '7B': {
        id: '7B',
        tier: 7,
        image: '7B_엔트로피 제어(Entropy Control).png',
        name: { KR: '엔트로피제어', EN: 'Entropy Control' },
        desc: {
            KR: '노드 간섭을 억제하여 카드 인터페이스를 안정화한다.',
            EN: 'Stabilizes card interface by suppressing node interference.'
        },
        effect: {
            KR: '플레이어는 전투 중 BLIND(카드 뒤집힘) 및 BANNED(모양/숫자 금지) 제약으로부터 완전 면역되며, 점수가 정상 계산된다.',
            EN: 'Immune to BLIND and BANNED rules. All cards display normally and score fully.'
        },
        duration: { KR: '영구(Permanent)', EN: 'Permanent' },
        cost: []
    },

    // LEVEL 8
    '8': {
        id: '8',
        tier: 8,
        image: '8_시스템 과부하(System Overload).png',
        name: { KR: '시스템과부하', EN: 'System Overload' },
        desc: {
            KR: '시스템의 가장 깊은 곳, 인과를 결정하는 근원적 코드에 접속한다.',
            EN: 'Accesses the deepest source code that determines causality.'
        },
        effect: {
            KR: '턴 종료 시 5% 확률로 수중패의 모든 카드가 범용 카드(JOKER)로 변환된다. (안내 문구 출력, 스테이지당 1회)',
            EN: '5% chance at turn end to convert all cards in hand to Jokers. (Once per stage)'
        },
        duration: { KR: '1회/스테이지(1 Time/Stage)', EN: '1 Time/Stage' },
        cost: []
    }
};
