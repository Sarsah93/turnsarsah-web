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
            ATTACK_AVOIDED: "공격을 회피했습니다!",
            BOSS_ATTACKS: "보스의 공격!",
            ST_AWAKENING: "보스가 각성 중입니다... 턴 종료.",
            TUTORIAL_RESTORED: "튜토리얼: 보스 체력 회복",
            PROCEED_STAGE7: "스테이지 7로 이동합니다...",
            STAGE6_BONUS: "승리! 최대 HP +{percent}% 보너스!",
            CLEARED_INFO: "챕터 {chapter}_스테이지 {stage} 클리어!",
            BOSS_BLEEDING: "보스 출혈!",
            BOSS_POISONING: "보스 중독!",
            BOSS_HEAVY_BLEEDING: "보스 과출혈!",
            BOSS_REGENERATING: "보스 재생 중!",
            PLAYER_CLEARED: "{cond} 해제!",
            PLAYER_REGEN: "체력 재생 중!",
            ONE_PAIR_REQ: "ONE PAIR를 구성하세요.",
            SELECT_SWAP_CARDS: "교환할 카드를 선택하세요.",
            SWAP_GUIDE: "카드를 최대 두 장 까지 선택 후, SWAP 버튼을 눌러 새로운 카드로 교환하세요",
            DAMAGE: "데미지",
            BANNED: "금지됨"
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
            RULE_HINT: "규칙: "
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
            WILD: " (조커)",
            JOKER_CUE: "조커",
            BLINDED_CUE: "블라인드!",
            CLICK_CUE: "클릭!",
            NEW_GAME: "새 게임",
            START_GAME: "게임 시작",
            TUTORIAL: "튜토리얼",
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
            ST_AWAKENING: "BOSS IS AWAKENING... TURN SKIPPED.",
            TUTORIAL_RESTORED: "TUTORIAL: BOSS HP RESTORED",
            PROCEED_STAGE7: "PROCEEDING TO STAGE 7...",
            STAGE6_BONUS: "VICTORY! MAX HP +{percent}% BONUS!",
            CLEARED_INFO: "CLEARED CHAPTER {chapter}_STAGE {stage}!",
            BOSS_BLEEDING: "BOSS BLEEDING!",
            BOSS_POISONING: "BOSS POISONING!",
            BOSS_HEAVY_BLEEDING: "BOSS HEAVY BLEEDING!",
            BOSS_REGENERATING: "BOSS REGENERATING!",
            PLAYER_CLEARED: "{cond} CLEARED!",
            PLAYER_REGEN: "REGENERATING!",
            ONE_PAIR_REQ: "SELECT A ONE PAIR.",
            SELECT_SWAP_CARDS: "SELECT CARDS TO SWAP.",
            SWAP_GUIDE: "SELECT UP TO 2 CARDS AND PRESS SWAP TO REFRESH THEM.",
            DAMAGE: "DAMAGE",
            BANNED: "BANNED"
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
            RULE_HINT: "RULE: "
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
