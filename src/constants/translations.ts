// constants/translations.ts

export type Language = 'KR' | 'EN';

export const TRANSLATIONS = {
    KR: {
        SETTINGS: {
            TITLE: "설정",
            BGM: "BGM 볼륨",
            SFX: "SFX 볼륨",
            LANGUAGE: "언어 설정",
            KOREAN: "한국어",
            ENGLISH: "영어",
            FONT_SIZE: "글자 크기",
            FONT_LARGE: "크게",
            FONT_NORMAL: "보통",
            FONT_SMALL: "작게",
            BACK: "뒤로가기"
        },
        TUTORIAL: {
            // ... (keeping existing tutorial steps)
            STEP_0: {
                TITLE: "WELCOME TO TURNSARSAH",
                TEXT: "'Turn Sarsah'는 스테이지 마다 다양한 패턴으로 구성된 보스들을 하나씩 1:1로 턴제 배틀을 통해, 무력화시키는 게임입니다."
            },
            STEP_1: {
                TITLE: "카드와 공격 포인트",
                TEXT: "스테이지에서는 주어진 카드 패를 가지고, 포커 족보 규칙에 맞춰 공격 포인트를 형성하여 보스를 공격할 수 있습니다. 공격 포인트는 카드의 숫자 합과 족보 보너스 점수로 결정됩니다."
            },
            STEP_2: {
                TITLE: "포커 족보",
                TEXT: "같은 숫자쌍(PAIR), 같은 모양(FLUSH), 연속된 숫자(STRAIGHT) 등으로 족보를 만들 수 있습니다. ONE PAIR는 같은 숫자 2장을 선택할 때 적용되며 족보 보너스 10점이 주어집니다."
            },
            STEP_3: {
                TITLE: "포커 족보 (계속)",
                TEXT: "PAIR(2장), TWO PAIR(2장+2장), TRIPLE(3장), FOUR CARDS(4장), FULL HOUSE(3장+2장) 순으로 강력해집니다. STRAIGHT는 연속된 5장, FLUSH는 같은 모양 5장입니다."
            },
            STEP_4: {
                TITLE: "특수 족보",
                TEXT: "STRAIGHT FLUSH는 연속된 숫자이면서 같은 모양인 5장입니다. ROYAL FLUSH(10,J,Q,K,A)는 가장 강력한 보너스 점수를 제공합니다."
            },
            STEP_5: {
                TITLE: "실습: ONE PAIR",
                TEXT: "같은 숫자 카드 2장을 골라 ONE PAIR 공격을 해볼까요?"
            },
            STEP_6: {
                TITLE: "자유 공격",
                TEXT: "4턴 동안 자유롭게 강력한 족보를 만들어 보스를 공격해 보세요!"
            },
            STEP_7: {
                TITLE: "조커 카드",
                TEXT: "조커(JOKER)는 모든 카드를 대체할 수 있는 와일드 카드입니다. 가장 높은 족보를 완성하도록 도와주며, 숫자는 14(A)로 계산됩니다. 조커로 공격해 보세요!"
            },
            STEP_8: {
                TITLE: "상태 이상",
                TEXT: "이제 보스의 상태 이상 공격에 대비해야 합니다."
            },
            STEP_9: {
                TITLE: "출혈 (BLEEDING)",
                TEXT: "'출혈' 상태가 되면 매 턴 종료 시 일정 데미지를 입습니다. 보스의 공격으로 출혈 상태가 되었습니다!"
            },
            STEP_10: {
                TITLE: "피해 확인",
                TEXT: "턴이 넘어갈 때마다 입는 출혈 피해를 확인하고, 다시 보스를 공격해 보세요."
            },
            STEP_11: {
                TITLE: "전투 지속",
                TEXT: "상태 이상은 여러 턴 지속됩니다. 체력 관리에 유의하며 전투를 이어가세요."
            },
            STEP_12: {
                TITLE: "튜토리얼 종료",
                TEXT: "다양한 상태 이상과 보스 룰이 당신을 기다립니다. 이제 본격적인 전장으로 떠나보세요!"
            },
            STEP_13: {
                TITLE: "카드 교환 (SWAP)",
                TEXT: "패가 좋지 않을 때 SWAP 버튼을 눌러 최대 2장까지 카드를 새로 바꿀 수 있습니다."
            },
            STEP_14: {
                TITLE: "보스 룰 (BOSS RULE)",
                TEXT: "보스들은 고유한 룰을 가집니다. 특정 숫자/모양 금지, 카드 뒤집기(BLIND), 족보 금지 등 다양한 제약 속에서 승리해야 합니다."
            },
            STEP_15: {
                TITLE: "보스 룰: 블라인드",
                TEXT: "BLIND 룰이 적용되면 카드가 뒤집혀 정보를 알 수 없게 됩니다. 하지만 족보 완성 여부와 조커 표시로 유추할 수 있습니다."
            },
            STEP_16: {
                TITLE: "실습: 블라인드 (1/2)",
                TEXT: "뒤집힌 카드가 있는 상태에서 공격을 진행해 보세요! (1/2)"
            },
            STEP_17: {
                TITLE: "실습: 블라인드 (2/2)",
                TEXT: "한 번 더 블라인드 상태에서 공격을 해봅시다! (2/2)"
            },
            STEP_14_DESC: "본 게임에서 스테이지마다 보스들이 존재하며, 보스들은 각각의 고유한 설정과 룰을 가지고 있습니다. 플레이어는 룰을 토대로 승리하기 위해 전략적으로 카드 조합을 구성해야 합니다.\n\n- BAN_RANK 2: 무작위 숫자 2개를 턴 마다 공격 포인트로 사용할 수 없게 됩니다.\n- BAN_SUIT: 무작위 문양 1개를 턴 마다 공격 포인트로 사용할 수 없게 됩니다.\n- BAN_BLIND 2: 플레이어의 수중패에서 무작위 카드 2개를 턴 마다 뒤집어 카드를 알 수 없게 합니다.\n- BAN_HAND: 무작위 족보 1개를 턴 마다 금지시키고, 해당 족보로 공격할 수 없게 합니다.",
            NEXT: "다음",
            PREV: "이전",
            EXIT: "메인 화면으로"
        },
        COMBAT: {
            VICTORY: "승리!",
            DEFEAT: "패배...",
            SELECT_CARDS: "카드를 선택하세요!",
            MAX_SWAP: "최대 2장까지만 교환 가능합니다!",
            CARDS_SWAPPED: "카드 교환 완료!",
            NO_SWAPS: "남은 교환 횟수가 없습니다!",
            BANNED_HAND: "금지된 족보: ",
            PARALYZED: "마비 상태입니다! 공격 불가!",
            CRITICAL_HIT: "크리티컬 히트!",
            AWAKENING: "보스 각성! HP 회복!",
            BOSS_SKIPPED: "보스가 공격을 건너뛰었습니다.",
            ATTACK_AVOIDED: "공격 회피!",
            BOSS_ATTACKS: "보스의 공격!",
            BOSS_MISSED: "보스의 공격이 빗나갔습니다!",
            ST_AWAKENING: "보스가 각성 중입니다... 턴 종료.",
            TUTORIAL_RESTORED: "튜토리얼: 보스 체력 회복",
            PROCEED_STAGE7: "패배... 스테이지 7로 이동합니다...",
            STAGE6_BONUS: "승리! 최대 HP +{percent}% 보너스!",
            CLEARED_INFO: "챕터 {chapter}_스테이지 {stage} 클리어!",
            BOSS_BLEEDING: "보스 출혈!",
            BOSS_POISONING: "보스 중독!",
            BOSS_HEAVY_BLEEDING: "보스 과출혈!",
            BOSS_REGENERATING: "보스 재생 중!",
            PLAYER_CLEARED: "{cond} 해제!",
            PLAYER_REGEN: "체력 재생 중!",
            PLAYER_POISONING: "플레이어 중독 피해!",
            PLAYER_HEAVY_BLEEDING: "플레이어 과출혈 피해!",
            PLAYER_BLEEDING: "플레이어 출혈 피해!",
            ONE_PAIR_REQ: "ONE PAIR를 구성하세요.",
            SELECT_SWAP_CARDS: "교환할 카드를 선택하세요.",
            SWAP_GUIDE: "카드를 최대 두 장 까지 선택 후, SWAP 버튼을 눌러 새로운 카드로 교환하세요",
            DAMAGE: "데미지",
            BANNED: "금지됨",
            REVIVE_MSG: "룰: 부활!",
            FORCE_SWAP_MSG: "룰: 강제 교체!",
            NO_DMG_UNDER_30_MSG: "룰: 30 미만 데미지 무효",
            NEURO_MISSED: "공격 실패! (신경성 맹독)",
            ACCURACY_MISSED: "명중률 저하로 공격 실패!",
            PUZZLE_SUCCESS: "퍼즐 성공! (타겟 x 2) + {bonus} 고정 데미지!",
        },
        CONDITIONS: {
            BLEEDING: {
                NAME: "출혈",
                DESC: "매 턴 5의 고정 피해를 입습니다. 중첩 시 과출혈로 진화합니다."
            },
            HEAVY_BLEEDING: {
                NAME: "과출혈",
                DESC: "매 턴 15의 고정 피해를 입습니다. 추가 출혈이 쌓이지 않습니다."
            },
            POISONING: {
                NAME: "중독",
                DESC: "매 턴 피해량이 점진적으로 증가합니다. 중첩 시 쇠약으로 진화합니다."
            },
            REGENERATING: {
                NAME: "재생",
                DESC: "매 턴 일정량의 체력을 회복합니다."
            },
            PARALYZING: {
                NAME: "마비",
                DESC: "공격이 불가능하며 턴이 보스에게 넘어갑니다."
            },
            DEBILITATING: {
                NAME: "쇠약",
                DESC: "최대 체력이 20% 감소하고 가하는 피해량이 20% 감소합니다."
            },
            DAMAGE_REDUCING: {
                NAME: "경감",
                DESC: "받는 피해량이 {percent}% 감소합니다."
            },
            AVOIDING: {
                NAME: "회피",
                DESC: "{percent}% 확률로 적의 공격을 회피합니다."
            },
            IMMUNE: {
                NAME: "면역",
                DESC: "모든 상태이상 효과에 면역이 됩니다."
            },
            AWAKENING: {
                NAME: "각성",
                DESC: "보스가 각성하여 공격력이 상승했습니다."
            },
            DAMAGE_RECOILING: {
                NAME: "데미지 반동",
                DESC: "타격 시 {chance}% 확률로 발동. 피해량 +{bonus} 및 본인에게 +{recoil} 반동 피해. (최대 3턴)"
            },
            BERSERKER: {
                NAME: "버서커",
                DESC: "HP {threshold}% 미만 시 발동. 공격력 +{atkBonus} 및 피해량의 10% 회복. (최대 3턴)"
            },
            REVIVAL: {
                NAME: "부활",
                DESC: "HP 0 이하 시 50% 체력으로 부활. (잔여 횟수: {count}회)"
            },
            INVINCIBLE_SPIRIT: {
                NAME: "불굴의 의지",
                DESC: "HP가 일정 이하로 떨어지면 즉시 체력을 회복합니다."
            },
            ADRENALINE_SECRETION: {
                NAME: "아드레날린 분비",
                DESC: "작은 데미지를 무시할 확률이 생깁니다."
            },
            NEUROTOXICITY: {
                NAME: "신경성 맹독",
                DESC: "매 턴 15의 고정 독 피해를 입으며, 공격 시 30% 확률로 빗나갑니다. 지속 중 매 턴 시작 시 20% 확률로 1턴 마비가 발생합니다 (최대 1회)."
            },
            TRIPLE_ATTACK: {
                NAME: "연속 공격",
                DESC: "일정 확률로 2회 또는 3회 연속 공격을 가합니다."
            },
            DEHYDRATION: {
                NAME: "탈수",
                DESC: "턴 종료 후 HP가 {dmg} 감소. 보스 클리어 시 다음 스테이지로 이월."
            },
            REVIVED: {
                NAME: "부활",
                DESC: "대상이 부활했습니다!"
            },
            PROVOCATION: {
                NAME: "도발",
                DESC: "공격 시 플레이어의 명중률을 저하시킬 수 있습니다."
            },
            DECREASING_ACCURACY: {
                NAME: "명중률 저하",
                DESC: "공격이 빗나갈 확률이 발생합니다."
            }
        },
        RULES: {
            NONE: "없음",
            BANNED_2_CARDS: "카드 2장 사용 금지",
            BLIND_2_CARDS: "카드 2장 블라인드",
            BANNED_SUIT: "특정 문양 사용 금지",
            POISON: "독성 안개 (매 턴 중독)",
            BANNED_HAND: "특정 족보 금지: ",
            ATK_UP: "공격력 상승 (매 턴 +10)",
            REGEN_REDUCE: "재생 + 경감 {percent}%",
            ATK_GROWTH: "공격 시 공격력 {type}",
            RULE_HINT: "규칙: ",
            // Chapter 2A Rules
            REVIVE_50_STRAIGHT_FLUSH_DMG_0: "50% 확률 부활 & 스트레이트 플러시 점수 0",
            ONE_PAIR_DMG_0: "원페어 점수 0",
            TWO_PAIR_DMG_0: "투페어 점수 0",
            UNDER_30_POINTS_NO_DMG: "30점 미만 무효",
            FORCE_SWAP_2_NEUROTOXIC: "강제 교체 2장 & 신경성 맹독",
            TRIPLE_DMG_0_TRIPLE_ATTACK: "트리플 (Three of a Kind) 점수 0 & 삼중 공격",
            FULL_HOUSE_DMG_0_PARALYZE_40: "풀하우스 점수 0 & 마비 40%",
            STRAIGHT_DMG_0_BLIND_1_BAN_1: "스트레이트 점수 0 & 블라인드 1장 & 밴 1장",
            FLUSH_DMG_0_BLIND_3: "플러시 점수 0 & 블라인드 3장",
            PUZZLE_DMG_50_BLIND_1_AWAKEN: "수수께끼 적중 시 (타겟x2 + 족보보너스) 고정데미지\n& 블라인드 1장 & 각성",

            PUZZLE_TARGET: "타겟: {target}",
            REVIVE_50: "체력 0 도달 시 50% 회복 (1회)",
            NO_DMG_UNDER_30: "30 미만 데미지 무효",
            FORCE_SWAP: "매 턴 카드 강제 교체 (1장)",
            TRIPLE_ATTACK: "트리플 데미지 0 + 3연속 공격 (50%/30%)",
            TWO_TIMES_PARALYZE_50: "풀하우스 데미지 0 + 2턴마다 행동 + 마비 50%",
            NO_DMG_STRAIGHT_BLIND_1: "스트레이트 데미지 0 + 블라인드 1장",
            RANDOM_BLIND_BAN_1: "플러쉬 데미지 0 + 블라인드 1 + 금지 1",
            PUZZLE: "퍼즐 (숫자 합 맞추기)",

            // Chapter 2B Rules
            ORC_SAVAGE_RULE: "데미지 반동 40% (+10 데미지 / 자신 12 피해)",
            HALF_ORC_RULE: "영악함 (최대 2회 공격)",
            ORC_WARRIOR_RULE: "버서커 (HP 20% 미만 시 공격력 +15 & 10% 회흡)",
            ORC_CHIEFTAIN_RULE: "도발 30% & 불굴의 의지 (HP 80 이하 시 100 회복)",
            HIGH_ORC_RULE: "아드레날린 분비 (60 이하 데미지 무시)",
            HIGH_ORC_WARRIOR_RULE: "버서커 (HP 30% 미만 시 공격력 +20 & 10% 회흡)",
            HIGH_ORC_ASSASSIN_RULE: "치명타 25% (공격력 +50%)",
            HIGH_ORC_CHIEFTAIN_RULE: "도발 35% & 불굴의 의지 (HP 100 이하 시 150 회복)",
            HIGH_ORC_LORD_RULE: "도발 40% & 버서커 (HP 30% 미만 시 공격력 +25 & 15% 회흡)"
        },
        UI: {
            BACK_TO_MAIN: "메인 화면으로",
            ATTACK: "공격",
            SWAP: "교체",
            BOSS: "보스",
            PLAYER: "플레이어",
            ATK: "공격력",
            HP: "체력",
            QUIT_CONFIRM: "메인 화면으로 돌아가시겠습니까?",
            SAVE_SUCCESS: "게임이 저장되었습니다!",
            DIFFICULTY_EASY: "쉬움",
            DIFFICULTY_NORMAL: "보통",
            DIFFICULTY_HARD: "어려움",
            DIFFICULTY_HELL: "지옥",
            STAGE_NUM: "스테이지",
            CHAPTER_NUM: "챕터",
            PERMANENT: "영구 지속",
            TURNS_REMAINING: "턴 남음",
            USES_REMAINING: "회 남음",
            WILD: " (조커)",
            JOKER_CUE: "조커",
            BLINDED_CUE: "블라인드!",
            CLICK_CUE: "클릭!",
            NEW_GAME: "새 게임",
            START_GAME: "게임 시작",
            TUTORIAL: "튜토리얼",
            ALTAR_SYSTEM: "제단 시스템",
            QUIT: "종료",
            QUIT_ASK: "정말로 게임을 종료하시겠습니까?",
            SELECT_DIFFICULTY: "난이도 선택",
            YES: "예",
            NO: "아니오",
            CONFIRM: "확인",
            CANCEL: "취소",
            DELETE: "삭제",
            SAVE: "저장",
            LOAD: "불러오기",
            EMPTY: "비어있음",
            PAUSE: "일시정지",
            RESUME: "계속하기",
            SAVE_GAME: "게임 저장",
            LOAD_GAME: "불러오기",
            SLOT: "슬롯",
            DELETE_CONFIRM: "해당 저장 데이터를 삭제하시겠습니까?",
            OVERWRITE_CONFIRM: "해당 슬롯에 덮어씌우시겠습니까?"
        }
    },
    EN: {
        SETTINGS: {
            TITLE: "SETTINGS",
            BGM: "BGM VOLUME",
            SFX: "SFX VOLUME",
            LANGUAGE: "LANGUAGE",
            KOREAN: "KOREAN",
            ENGLISH: "ENGLISH",
            FONT_SIZE: "FONT SIZE",
            FONT_LARGE: "LARGE",
            FONT_NORMAL: "NORMAL",
            FONT_SMALL: "SMALL",
            BACK: "BACK"
        },
        TUTORIAL: {
            STEP_0: {
                TITLE: "WELCOME TO TURNSARSAH",
                TEXT: "'Turn Sarsah' is a 1:1 turn-based poker-themed battle game where you defeat bosses with unique patterns."
            },
            STEP_1: {
                TITLE: "CARDS & ATK POINTS",
                TEXT: "Form attack points based on poker hand rules. Your damage is determined by the sum of card numbers and hand bonus points."
            },
            STEP_2: {
                TITLE: "POKER HANDS",
                TEXT: "Create hands with pairs, flushes, or straights. ONE PAIR involves selecting two cards of the same rank and gives +10 bonus."
            },
            STEP_3: {
                TITLE: "POKER HANDS (CONT.)",
                TEXT: "Strength order: PAIR, TWO PAIR, TRIPLE, FOUR CARDS, FULL HOUSE. STRAIGHT is 5 consecutive cards, FLUSH is 5 of the same suit."
            },
            STEP_4: {
                TITLE: "SPECIAL HANDS",
                TEXT: "STRAIGHT FLUSH is 5 consecutive cards of the same suit. ROYAL FLUSH (10,J,Q,K,A) provides the highest bonus score."
            },
            STEP_5: {
                TITLE: "PRACTICE: ONE PAIR",
                TEXT: "Try attacking with a ONE PAIR by selecting two cards with the same rank."
            },
            STEP_6: {
                TITLE: "FREE ATTACK",
                TEXT: "For the next 4 turns, feel free to attack with strong hands!"
            },
            STEP_7: {
                TITLE: "JOKER CARD",
                TEXT: "The JOKER is a wild card that replaces any card to complete the best hand. It counts as 14 (A). Attack with the Joker!"
            },
            STEP_8: {
                TITLE: "STATUS EFFECTS",
                TEXT: "Now, prepare for the boss's status effect attacks."
            },
            STEP_9: {
                TITLE: "BLEEDING",
                TEXT: "'Bleeding' deals fixed damage at the end of each turn. You are now bleeding from the boss's attack!"
            },
            STEP_10: {
                TITLE: "OBSERVE DAMAGE",
                TEXT: "Observe the bleeding damage as the turn ends, then try attacking again."
            },
            STEP_11: {
                TITLE: "CONTINUE BATTLE",
                TEXT: "Status effects last for several turns. Manage your HP carefully."
            },
            STEP_12: {
                TITLE: "TUTORIAL END",
                TEXT: "Various effects and rules await you. Good luck on the battlefield!"
            },
            STEP_13: {
                TITLE: "CARD SWAP",
                TEXT: "Use the SWAP button to replace up to 2 cards randomly when you need better cards."
            },
            STEP_14: {
                TITLE: "BOSS RULE",
                TEXT: "Each boss has unique rules like banning suits/ranks, flipping cards (BLIND), or banning hands."
            },
            STEP_15: {
                TITLE: "BOSS RULE: BLIND",
                TEXT: "Under the BLIND rule, cards are flipped. You can still use them and guess their value via hand indicators."
            },
            STEP_16: {
                TITLE: "PRACTICE: BLIND (1/2)",
                TEXT: "Try attacking while some cards are flipped! (1/2)"
            },
            STEP_17: {
                TITLE: "PRACTICE: BLIND (2/2)",
                TEXT: "Attack once more in the Blind state! (2/2)"
            },
            STEP_14_DESC: "In this game, each stage has a boss with unique settings and rules. You must strategically form hands based on these rules to win.\n\n- BAN_RANK 2: Two random ranks are banned from being used in attack points.\n- BAN_SUIT: One random suit is banned from being used in attack points.\n- BAN_BLIND 2: Two random cards in your hand are flipped face down.\n- BAN_HAND: One random poker hand is banned from being used for attacks.",
            NEXT: "NEXT",
            PREV: "PREV",
            EXIT: "BACK TO MAIN"
        },
        COMBAT: {
            VICTORY: "VICTORY!",
            DEFEAT: "DEFEAT...",
            SELECT_CARDS: "SELECT CARDS!",
            MAX_SWAP: "MAXIMUM 2 CARDS CAN BE SWAPPED!",
            CARDS_SWAPPED: "CARDS SWAPPED!",
            NO_SWAPS: "NO SWAPS REMAINING!",
            BANNED_HAND: "BANNED HAND: ",
            PARALYZED: "PARALYZED! CANNOT ATTACK!",
            CRITICAL_HIT: "CRITICAL HIT!",
            AWAKENING: "BOSS AWAKENING! HP RESTORED!",
            BOSS_SKIPPED: "BOSS SKIPPED ATTACKING",
            ATTACK_AVOIDED: "ATTACK AVOIDED!",
            BOSS_ATTACKS: "BOSS ATTACKS!",
            BOSS_MISSED: "THE BOSS ATTACK MISSED!",
            ST_AWAKENING: "BOSS IS AWAKENING... TURN SKIPPED.",
            TUTORIAL_RESTORED: "TUTORIAL: BOSS HP RESTORED",
            PROCEED_STAGE7: "DEFEAT... PROCEEDING TO STAGE 7...",
            STAGE6_BONUS: "VICTORY! MAX HP +{percent}% BONUS!",
            CLEARED_INFO: "CLEARED CHAPTER {chapter}_STAGE {stage}!",
            BOSS_BLEEDING: "BOSS BLEEDING!",
            BOSS_POISONING: "BOSS POISONING!",
            BOSS_HEAVY_BLEEDING: "BOSS HEAVY BLEEDING!",
            BOSS_REGENERATING: "BOSS REGENERATING!",
            PLAYER_CLEARED: "{cond} CLEARED!",
            PLAYER_REGEN: "REGENERATING!",
            PLAYER_POISONING: "PLAYER POISON DAMAGE!",
            PLAYER_HEAVY_BLEEDING: "PLAYER HEAVY BLEED DAMAGE!",
            PLAYER_BLEEDING: "PLAYER BLEED DAMAGE!",
            ONE_PAIR_REQ: "SELECT A ONE PAIR.",
            SELECT_SWAP_CARDS: "SELECT CARDS TO SWAP.",
            SWAP_GUIDE: "SELECT UP TO 2 CARDS AND PRESS SWAP TO REFRESH THEM.",
            DAMAGE: "DAMAGE",
            BANNED: "BANNED",
            REVIVE_MSG: "RULE: REVIVE!",
            FORCE_SWAP_MSG: "RULE: FORCE SWAP!",
            NO_DMG_UNDER_30_MSG: "RULE: NO DMG UNDER 30",
            NEURO_MISSED: "MISSED! (NEUROTOXICITY)",
            ACCURACY_MISSED: "MISSED! (ACCURACY DOWN)",
            PUZZLE_SUCCESS: "PUZZLE SUCCESS! (Target x 2) + {bonus} Fixed Damage!",
        },
        CONDITIONS: {
            BLEEDING: {
                NAME: "Bleeding",
                DESC: "Takes 5 fixed damage per turn. Stacks to Heavy Bleeding."
            },
            HEAVY_BLEEDING: {
                NAME: "Heavy Bleeding",
                DESC: "Takes 15 fixed damage per turn. Prevents additional Bleeding."
            },
            POISONING: {
                NAME: "Poisoning",
                DESC: "Takes stacking damage per turn. Stacks to Debilitating."
            },
            REGENERATING: {
                NAME: "Regenerating",
                DESC: "Restores a portion of HP each turn."
            },
            PARALYZING: {
                NAME: "Paralyzing",
                DESC: "Player cannot attack (turn passes to boss)."
            },
            DEBILITATING: {
                NAME: "Debilitating",
                DESC: "Reduces Max HP by 20% and damage dealt by 20%."
            },
            DAMAGE_REDUCING: {
                NAME: "Reduction",
                DESC: "Reduces incoming damage by {percent}%."
            },
            AVOIDING: {
                NAME: "Avoiding",
                DESC: "{percent}% chance to avoid attacks."
            },
            IMMUNE: {
                NAME: "Immune",
                DESC: "Immune to debuff effects (Bleeding, Poison, Paralyze, Debilitate)."
            },
            AWAKENING: {
                NAME: "Awakened",
                DESC: "The target has awakened."
            },
            DAMAGE_RECOILING: {
                NAME: "Damage Recoiling",
                DESC: "{chance}% chance on hit to deal +{bonus} dmg and take +{recoil} recoil dmg. (Max 3 turns)"
            },
            BERSERKER: {
                NAME: "Berserker",
                DESC: "Triggers below 30% HP. ATK +{atkBonus} and heals of damage dealt."
            },
            REVIVAL: {
                NAME: "Revival",
                DESC: "Revives with 50% HP when HP reaches 0."
            },
            INVINCIBLE_SPIRIT: {
                NAME: "Invincible spirit",
                DESC: "Instantly restores HP when it falls below a certain threshold."
            },
            ADRENALINE_SECRETION: {
                NAME: "Adrenaline secretion",
                DESC: "Chance to nullify incoming small damage."
            },
            NEUROTOXICITY: {
                NAME: "Neurotoxicity",
                DESC: "Takes 15 fixed damage per turn and has a 30% miss chance."
            },
            TRIPLE_ATTACK: {
                NAME: "Triple Attack",
                DESC: "Chance to attack 2 or 3 times in a row."
            },
            DEHYDRATION: {
                NAME: "Dehydration",
                DESC: "Loses {dmg} HP at the end of each turn."
            },
            REVIVED: {
                NAME: "Revived",
                DESC: "The target has revived!"
            },
            PROVOCATION: {
                NAME: "Provocation",
                DESC: "Chance to decrease the target's accuracy."
            },
            DECREASING_ACCURACY: {
                NAME: "Decreasing Accuracy",
                DESC: "Certain chance for attacks to miss."
            }
        },
        RULES: {
            NONE: "NONE",
            BANNED_2_CARDS: "BANNED_2 CARDS",
            BLIND_2_CARDS: "BLIND_2 CARDS",
            BANNED_SUIT: "BANNED_SUIT",
            POISON: "POISON GAS (Envenom every turn)",
            BANNED_HAND: "BANNED HAND: ",
            ATK_UP: "ATK UP (+10 every turn)",
            REGEN_REDUCE: "REGEN+REDUCE {percent}%",
            ATK_GROWTH: "ATK {type} on hit",
            RULE_HINT: "RULE: ",
            // Chapter 2A Rules
            REVIVE_50_STRAIGHT_FLUSH_DMG_0: "RULE: 50% REVIVE & STRAIGHT FLUSH DMG 0",
            ONE_PAIR_DMG_0: "RULE: ONE PAIR DMG 0",
            TWO_PAIR_DMG_0: "RULE: TWO PAIR DMG 0",
            UNDER_30_POINTS_NO_DMG: "RULE: UNDER 30 POINTS NO DMG",
            FORCE_SWAP_2_NEUROTOXIC: "RULE: FORCE SWAP 2 & NEUROTOXIC",
            TRIPLE_DMG_0_TRIPLE_ATTACK: "RULE: TRIPLE DMG 0 & TRIPLE ATTACK",
            FULL_HOUSE_DMG_0_PARALYZE_40: "RULE: FULL HOUSE DMG 0 & PARALYZE 40%",
            STRAIGHT_DMG_0_BLIND_1_BAN_1: "RULE: STRAIGHT DMG 0 & BLIND 1, BAN 1",
            FLUSH_DMG_0_BLIND_3: "RULE: FLUSH DMG 0 & BLIND 3",
            PUZZLE_DMG_50_BLIND_1_AWAKEN: "RULE: PUZZLE HIT (Targetx2 + Poker Bonus) FIXED DMG & BLIND 1 & AWAKEN",

            PUZZLE_TARGET: "TARGET: {target}",
            REVIVE_50: "RULE: REVIVE 50% HP (ONCE)",
            NO_DMG_UNDER_30: "RULE: NO DMG UNDER 30",
            FORCE_SWAP: "RULE: FORCE SWAP 1 CARD",
            TRIPLE_ATTACK: "RULE: CHANCE FOR DOUBLE/TRIPLE ATTACK",
            TWO_TIMES_PARALYZE_50: "RULE: ACT EVERY 2 TURNS + 50% PARALYZE",
            NO_DMG_STRAIGHT_BLIND_1: "RULE: STRAIGHT DMG 0 + BLIND 1",
            RANDOM_BLIND_BAN_1: "RULE: RANDOM BLIND 1 + BAN HAND 1",
            PUZZLE: "RULE: PUZZLE (SUM MATCH)",

            // Chapter 2B Rules
            ORC_SAVAGE_RULE: "40% Recoil Damage (+10 damage / 12 recoil)",
            HALF_ORC_RULE: "Double Attack (Max 2 attacks)",
            ORC_WARRIOR_RULE: "Berserker (HP < 20%: ATK +15 & 10% Lifesteal)",
            ORC_CHIEFTAIN_RULE: "Provoke 30% & Invincible Spirit (HP <= 80: Heal 100)",
            HIGH_ORC_RULE: "Adrenaline Secretion (Ignore dmg <= 60)",
            HIGH_ORC_WARRIOR_RULE: "Berserker (HP < 30%: ATK +20 & 10% Lifesteal)",
            HIGH_ORC_ASSASSIN_RULE: "Critical 25% (Atk +50%)",
            HIGH_ORC_CHIEFTAIN_RULE: "Provoke 35% & Invincible Spirit (HP <= 100: Heal 150)",
            HIGH_ORC_LORD_RULE: "Provoke 40% & Berserker (HP < 30%: ATK +25 & 15% Lifesteal)"
        },
        UI: {
            BACK_TO_MAIN: "BACK TO MAIN PAGE",
            ATTACK: "ATTACK",
            SWAP: "SWAP",
            BOSS: "BOSS",
            PLAYER: "PLAYER",
            ATK: "ATK",
            HP: "HP",
            QUIT_CONFIRM: "DO YOU WANT TO GO BACK TO MAIN PAGE?",
            SAVE_SUCCESS: "GAME SAVED!",
            DIFFICULTY_EASY: "EASY",
            DIFFICULTY_NORMAL: "NORMAL",
            DIFFICULTY_HARD: "HARD",
            DIFFICULTY_HELL: "HELL",
            STAGE_NUM: "STAGE",
            CHAPTER_NUM: "CHAPTER",
            PERMANENT: "PERMANENT",
            TURNS_REMAINING: "TURNS REMAINING",
            WILD: " (WILD)",
            JOKER_CUE: "JOKER",
            BLINDED_CUE: "BLINDED !",
            CLICK_CUE: "CLICK!",
            NEW_GAME: "NEW GAME",
            START_GAME: "START GAME",
            TUTORIAL: "TUTORIAL",
            ALTAR_SYSTEM: "ALTAR SYSTEM",
            QUIT: "QUIT",
            QUIT_ASK: "DO YOU REALLY WANT TO QUIT THE GAME?",
            SELECT_DIFFICULTY: "SELECT DIFFICULTY",
            YES: "YES",
            NO: "NO",
            CONFIRM: "CONFIRM",
            CANCEL: "CANCEL",
            DELETE: "DELETE",
            SAVE: "SAVE",
            LOAD: "LOAD",
            EMPTY: "EMPTY",
            PAUSE: "PAUSE",
            RESUME: "RESUME",
            SAVE_GAME: "SAVE GAME",
            LOAD_GAME: "LOAD GAME",
            SLOT: "SLOT",
            DELETE_CONFIRM: "DO YOU AGREE WITH DELETING THIS SAVED DATA?",
            OVERWRITE_CONFIRM: "REALLY WANT TO OVERWRITE THIS SAVED DATA SLOT?"
        }
    }
};
