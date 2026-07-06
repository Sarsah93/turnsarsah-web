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
            GAME_SPEED: "배속 설정",
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
            VICTORY: "노드 정화 완료!",
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
            PLAYER_BURN: "플레이어 화상 피해!",
            PLAYER_DECAY: "플레이어 부패 피해!",
            AREA_CLEARED: "{area} 구역 정화 완료!",
            NODE_CLEARED: "노드 정화 완료!",
            PATTERN_DISRUPTION_MSG: "패턴 교란 발동: 족보 단계 승급!",
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
            DEFENSE_REDUCED: {
                NAME: "방어력 감소",
                DESC: "방어력이 {amount}만큼 감소합니다."
            },
            DAMAGE_TAKEN_INCREASED: {
                NAME: "받는 피해 증가",
                DESC: "받는 피해량이 {percent}% 증가합니다."
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
            },
            REFLECTION: {
                NAME: "데미지 반사",
                DESC: "대상이 일반 공격 피해를 받을 경우, 받은 피해량의 일부를 상대에게 되돌려준다."
            },
            BURN: {
                NAME: "화상",
                DESC: "매 턴 최대 HP의 3%에 해당하는 화염 피해를 입습니다. (3턴 지속)"
            },
            DECAY: {
                NAME: "부패",
                DESC: "턴이 지날수록 증가하는 부패 피해를 입습니다. (최대 HP의 3% → 5% → 8% → 10%, 4턴 지속)"
            },
            ECHO: {
                NAME: "메아리",
                DESC: "동굴 챕터에서 보스는 일반 공격 시, 20% 확률로 30% 경감된 일반 공격을 한 번 더 적용한다. (각 공격의 회피가 적용될 확률은 별도로 계산한다.)"
            },
            HEMATOPHAGY: {
                NAME: "흡혈",
                DESC: "피해를 입힐 때, 입힌 피해량의 {percent}%만큼 자신의 HP를 회복한다."
            },
            SWAMPING: {
                NAME: "잠김",
                DESC: "늪에 발이 묶입니다.\n5피격 이후 회피율이\n급감합니다."
            },
            STEM_CELL: {
                NAME: "줄기세포",
                DESC: "매 턴 종료 시: 최대 HP +10 상승, 최대 HP의 20% 회복, 공격력 +2 상승, 회피 확률 +2% 상승. (순서대로 적용)"
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
            // Chapter 1 Rules
            CH1_RULE_1: "없음",
            CH1_RULE_2: "턴 마다 특정 숫자 금지 (2장)",
            CH1_RULE_3: "턴 마다 블라인드 (2장)",
            CH1_RULE_4: "턴 마다 무작위 문양 금지",
            CH1_RULE_5: "중독 (확률적)",
            CH1_RULE_6: "보너스(최대체력증가) + 족보 금지(매 턴 변경)",
            CH1_RULE_7: "공격력 증가",
            CH1_RULE_8: "2턴 마다 공격",
            CH1_RULE_9: "공격력 배수 증가",
            CH1_RULE_10: "매 턴 무작위 규칙 + 각성",

            // Chapter 2A Rules
            REVIVE_50_STRAIGHT_FLUSH_DMG_0: "50% 확률 부활 & 스트레이트 플러시 점수 0",
            ONE_PAIR_DMG_0: "원페어 점수 0",
            TWO_PAIR_DMG_0: "투페어 점수 0",
            UNDER_30_POINTS_NO_DMG: "30점 미만 무효",
            FORCE_SWAP_2_NEUROTOXIC: "강제 교체 2장 & 신경성 맹독",
            TRIPLE_DMG_0_TRIPLE_ATTACK: "트리플 점수 0 + 3연속 공격(확률적)",
            FULL_HOUSE_DMG_0_PARALYZE_40: "풀하우스 점수 0 + 2턴 마다 공격",
            STRAIGHT_DMG_0_BLIND_1_BAN_1: "스트레이트 점수 0 & 블라인드 1장 & 밴 1장",
            FLUSH_DMG_0_BLIND_2: "플러시 점수 0 & 블라인드 2장",
            PUZZLE_DMG_50_BLIND_1_AWAKEN: "퍼즐 + 각성",

            PUZZLE_TARGET: "타겟: {target}",
            REVIVE_50: "체력 0 도달 시 50% 회복 (1회)",
            NO_DMG_UNDER_30: "30 미만 데미지 무효",
            FORCE_SWAP: "매 턴 카드 강제 교체 (1장)",
            TRIPLE_ATTACK: "트리플 점수 0 + 3연속 공격(확률적)",
            TWO_TIMES_PARALYZE_50: "풀하우스 점수 0 + 2턴 마다 공격",
            NO_DMG_STRAIGHT_BLIND_1: "스트레이트 데미지 0 + 블라인드 1장",
            RANDOM_BLIND_BAN_1: "플러쉬 데미지 0 + 블라인드 1 + 금지 1",
            PUZZLE: "퍼즐 + 각성",

            // Chapter 2B Rules
            DEEP_FOREST_NONE: "없음",
            ORC_SAVAGE_RULE: "데미지 반동(확률적)",
            HALF_ORC_RULE: "영악함 (최대 2회 공격)",
            ORC_WARRIOR_RULE: "버서커",
            ORC_CHIEFTAIN_RULE: "강인한 의지 및 도발",
            HIGH_ORC_RULE: "아드레날린 분비(60이하 공격 무시)",
            HIGH_ORC_WARRIOR_RULE: "강력한 버서커",
            HIGH_ORC_ASSASSIN_RULE: "치명타 25% (공격력 +50%)",
            HIGH_ORC_CHIEFTAIN_RULE: "불굴의 의지 및 도발",
            HIGH_ORC_LORD_RULE: "강력한 버서커 및 도발",
            SAND_STORM_TRIPLE_AWAKEN: "규칙: 모래폭풍+삼중공격+각성",
            BLIND_BAN_REFLECTION_AWAKEN: "규칙: BLIND/BAN+데미지반사+각성(부패 폭발)",

            // Chapter 3A Rules
            ACID_ATTACK: "규칙: 산성공격 (3턴마다 15 고정피해 + 20% 화상)",
            HEMATOPHAGY: "규칙: 흡혈 (가한 피해의 30% 회복)",
            MUCUS: "규칙: 점액분비 (2턴마다 20 고정피해 + 50% 명중률저하/중독)",
            SHOOTING_WEB: "규칙: 거미줄발사 (2턴마다 10 고정피해 + 회피율 -5%)",
            GHOST: "규칙: 유체화 (족보 보너스 피해만 유효)",
            HONEY_DANGUN: "규칙: 꿀섭취/단군신화 (20% 공격 스킵+HP회복 / 3·7 포함 시 +8)",
            BRITTLE: "규칙: 취성 (매 턴 경감 +10%, 5회 누적 후 초기화 / 다이아 포함 시 +8)",
            ROLL_BOULDER: "규칙: 바위굴리기 (2턴마다 20 고정피해, 40% 회피)",
            PETRIFIED_RULE: "규칙: 석화 (공격 성공 시 40% 확률로 카드 1장 석화)",
            TYPHON_MYTH: "규칙: 티폰전승 (부활 3회 / 4문양 플러시 성공 시 즉사)",

            // Chapter 3A Echo
            CHAPTER_ECHO: "챕터 규칙: 메아리 (20% 확률, 70% 피해 추가 공격)",

            // Chapter 3B Rules
            HARDNESS: "규칙: 단단함 (투페어 이상 족보만 피해 적용)",
            MUDDED_20PCT: "규칙: 진흙뿌리기 (보스 공격 시 20% 확률로 카드 1장 진흙 상태)",
            DEATHROLL: "규칙: 데스롤 (플레이어가 SWAP 시 즉시 보스 1회 공격)",
            AUTOTOMY: "규칙: 자절 (2턴마다 플레이어 공격 피해 30% 감소)",
            CAMOUFLAGE: "규칙: 위장 (3턴마다 플레이어 공격 100% 회피)",
            INITIALTORY: "규칙: 초기의식 (매 턴 핸드 초기화 + 조커 확률 -5% 영구 감소)",
            HOLD_BREATH: "규칙: 숨참기 (보스 공격 2회 성공 시, 다음 턴 공격 100% 차단 후 스킵)",
            MUDDED_40PCT: "규칙: 진흙뿌리기 (보스 공격 시 40% 확률로 카드 2장 진흙 상태)",
            AWAKENING_3B: "규칙: 각성 (HP 40% 이하 시 ATK +30, 매 턴 회복 +20)",
            STEM_CELL: "규칙: 줄기세포 (매 턴 보스 HP+10, ATK+2, 회피+2%)",

            // Chapter 3B Swamping
            CHAPTER_SWAMPING: "챕터 규칙: 잠김 (5공격 전 회피 -5%, 5공격 후 -20%)",
        },
        UI: {
            CHAPTER_SELECT_TITLE: "들판 구역 안정화 완료",
            CHAPTER_SELECT_SUBTITLE: "다음 확장 구역을 선택하세요.",
            BACK_TO_MAIN: "메인 화면으로",
            ATTACK: "공격",
            SWAP: "교체",
            BOSS: "코어 안정도",
            PLAYER: "플레이어 코어",
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
            COLLECTION: "컬렉션",
            COLLECTION_TITLE: "컬렉션",
            COLLECTION_ATTACK_ANIM: "공격 애니메이션",
            COLLECTION_LOCKED: "잠금",
            COLLECTION_ACTIVE: "적용 중",
            COLLECTION_INACTIVE: "미적용",
            COLLECTION_APPLY: "적용하기",
            COLLECTION_REMOVE: "적용 해제",
            COLLECTION_PREVIEW: "▶ 미리보기",
            COLLECTION_PROGRESS: "달성 현황",
            COLLECTION_COMING_SOON: "추후 업데이트 예정",
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
            OVERWRITE_CONFIRM: "해당 슬롯에 덮어씌우시겠습니까?",
            CLEAR_CONGRATS: "축하합니다!",
            CLEAR_EASY_BODY: "쉬움 난이도의 모든 스테이지를 클리어 하셨습니다!\n이제부터 보통 난이도를 플레이할 수 있으며,\n보스들로부터 전리품을 얻고, 제단 스킬을 활성화하여,\n더 다양한 챕터들을 클리어 해 보세요!",
            CLEAR_NORMAL_BODY: "보통 난이도의 모든 스테이지를 클리어 하셨습니다!\n이제부터 어려움 난이도를 플레이할 수 있으며,\n보스들로부터 전리품을 얻고, 제단 스킬을 활성화하여,\n더 다양한 챕터들을 클리어 해 보세요!",
            BACK_TO_MAIN_MENU: "메인 화면으로 돌아가기",
            UNDER_PREPARATION: "현재 준비중입니다.",
            FINAL_CLEAR_BODY: "현재까지 구현된 챕터를 모두 클리어 하셨습니다.\n추후 업데이트될 챕터를 기대해주세요! 감사합니다.",
            // Chapter Next Popup (v3.0)
            CHAPTER_NEXT_CLEAR: "{area} 구역 안정화 완료!",
            CHAPTER_NEXT_ACTIVATED: "다음 섹터가 활성화되었습니다.",
            CHAPTER_NEXT_ENTER: "이동",
            CHAPTER_3A_NAME: "챕터 3A 동굴",
            CHAPTER_3B_NAME: "챕터 3B 늪지대",
            HYDRA_FLUSH_COUNT: "티폰 전승: {count}/4"
        },
        STATUS_POPUP: {
            title: "상태 정보 (STATUS)",
            difficulty: "난이도",
            maxHp: "최대 코어 안정도",
            swapCount: "카드 교체 횟수",
            flatAtk: "추가 데미지 (고정)",
            percentAtk: "추가 데미지 (%)",
            critMult: "크리티컬 배수",
            critChance: "카드당 크리티컬 확률",
            evasion: "회피율",
            defense: "방어력",
            active: "적용 중",
            inactive: "미적용",
            potential: "조건부",
            baseVal: "기본값",
            appliedFactors: "적용 요인 목록",
            noFactors: "적용된 추가 요인이 없습니다.",
            jokerCard: "A/JOKER 카드 기준",
            factors: {
                prepper: "생존주의자 [1A] (최대 코어 안정도 +25, 생체 리듬 가속 장착 시 +30)",
                stage6: "6단계 클리어 보너스 (최대 코어 안정도 +20%, 생체 리듬 가속 장착 시 +24%)",
                debilitated: "상태이상: 쇠약 (최대 코어 안정도 -20%)",
                fragments: "파편 회수 [5B-3] (HP 25% 이하 시 카드 교체 횟수 +2)",
                sharpen: "날카로운 카드 [1B] (고정 데미지 +25)",
                collapse: "노드 붕괴 [5B-2] (HP 구간에 따라 고정 데미지 +10 / +20 / +30)",
                overloaded: "과부하 [5A-2] (동일 족보 연속 사용 시 데미지 +10% ~ +30%)",
                resonance: "불안정 동조 [5A-3] (보스 HP 비율에 따라 데미지 +5% / +10%)",
                adaptive: "적용 연산 [6A-1] (공격 성공마다 데미지 +5% 누적, 최대 +50%)",
                coreResonance: "코어 공명 [6B-1] (보스 HP 50% 이하 시 데미지 +15%)",
                bottomDeal: "밑장빼기 [4A-2] (조커 등장 확률 +5%)",
                oneness: "물아일체 [2B] (회피율 +5% 및 환경 제약 무시)",
                envPenalty2B: "챕터 2B 환경 패널티 (회피율 비활성화)",
                defenseReduced: "이벤트 방어력 감소 (방어력 -{amount})",
                equipmentGear: "장비 기어 [3B-1] (피해량 -30%)",
                damageTakenIncreased: "받는 피해 증가 (피해량 +{percent}%)",
                eventPctAtk: "이벤트 보너스 (추가 데미지 +{val}%)",
                eventCritMult: "이벤트 보너스 (크리티컬 배수 +{val}%)",
                eventCritChance: "이벤트 보너스 (크리티컬 확률 +{val}%)",
                eventEvasion: "이벤트 보너스 (회피율 +{val}%)",
                eventMaxHp: "이벤트 보너스 (최대 HP {val}%)",
                eventSwap: "이벤트 보너스 (교체 횟수 {val})",
                eventDmgTaken: "이벤트 보너스 (받는 피해 +{val}%)",
                eventSwapPenalty: "이벤트 패널티 (교체 횟수 {val}) [다음 전투 한정]",
                eventHpDrain: "이벤트 패널티 (매 턴 HP -{val}) [다음 전투 한정]"
            }
        },
        EVENT: {
            CAT_CREATURE: "불안정 생명체",
            CAT_MERCHANT: "수상한 그림자 행상인",
            CAT_NODE: "균열된 노드 잔해",
            CAT_ALTAR: "이름 모를 제단",
            YES: "예",
            NO: "아니오",
            CONFIRM: "확인",
            C_SMALL_PROMPT: "작은 동물로 추정되는 개념체를 조우했습니다.\n노드화가 진행되고 있는 것으로 추정됩니다.\n코어 안정도를 추출하여 노드화 수복을 도와주시겠습니까? (성공 확률 70%)",
            C_SMALL_HP_COST: "플레이어의 코어 안정도(HP)를 5% 소모하였습니다.",
            C_SMALL_SUCCESS: "노드화 수복에 성공하였습니다. 추가 데미지가 +2% 상승합니다.",
            C_SMALL_FAIL: "수복 실패. 다음 전투에서 매 턴 HP가 5씩 감소하는 디버프가 적용됩니다.",
            C_SMALL_NO: "도움을 거절하였습니다.",
            C_MED_PROMPT: "중형 동물로 추정되는 개념체를 조우했습니다.\n노드화가 상당히 진행되었습니다.\n코어 안정도를 추출하여 노드화 수복을 도와주시겠습니까? (성공 확률 50%)",
            C_MED_HP_COST: "플레이어의 코어 안정도(HP)를 8% 소모하였습니다.",
            C_MED_SUCCESS: "노드화 수복에 성공하였습니다. 추가 데미지가 +4% 상승합니다.",
            C_MED_FAIL: "수복 실패. 즉시 HP가 10 감소합니다.",
            C_MED_NO: "도움을 거절하였습니다.",
            C_LRG_PROMPT: "대형 동물로 추정되는 개념체를 조우했습니다.\n노드화가 거의 완료 단계입니다.\n코어 안정도를 추출하여 노드화 수복을 도와주시겠습니까? (성공 확률 30%)",
            C_LRG_HP_COST: "플레이어의 코어 안정도(HP)를 12% 소모하였습니다.",
            C_LRG_SUCCESS: "노드화 수복에 성공하였습니다. 추가 데미지가 +6% 상승합니다.",
            C_LRG_FAIL: "수복 실패. 즉시 HP가 20 감소합니다.",
            C_LRG_NO: "도움을 거절하였습니다.",
            M_CANDY_PROMPT: "수상한 그림자 행상인이 과자를 팔고 있습니다.\n'이거 먹으면 힘이 넘쳐흐를 거야.' (구매 비용: 코어 안정도 5%)",
            M_CANDY_HP_COST: "코어 안정도(HP)를 5% 소모하였습니다.",
            M_CANDY_SUCCESS: "과자가 효과를 발휘합니다! 크리티컬 배수가 +10% 상승합니다.",
            M_CANDY_FAIL: "과자가 상했습니다! 다음 전투에서 매 턴 HP가 8씩 감소하는 디버프가 적용됩니다.",
            M_CANDY_NO: "구매를 거절하였습니다.",
            M_DRINK_PROMPT: "수상한 그림자 행상인이 음료를 팔고 있습니다.\n'이거 마시면 몸이 가벼워질 거야.' (구매 비용: 코어 안정도 8%)",
            M_DRINK_HP_COST: "코어 안정도(HP)를 8% 소모하였습니다.",
            M_DRINK_GREAT: "음료가 완벽하게 흡수됩니다! 회피율이 +6% 영구 상승합니다.",
            M_DRINK_OK: "음료가 어느 정도 효과를 발휘합니다. 회피율이 +3% 영구 상승합니다.",
            M_DRINK_FAIL: "음료가 상했습니다! 즉시 HP가 15 감소합니다.",
            M_DRINK_NO: "구매를 거절하였습니다.",
            M_CUBE_PROMPT: "수상한 그림자 행상인이 작은 큐브를 팔고 있습니다.\n'이걸 흡수하면 코어가 강화될 거야.' (구매 비용: 코어 안정도 10%)",
            M_CUBE_HP_COST: "코어 안정도(HP)를 10% 소모하였습니다.",
            M_CUBE_SUCCESS: "큐브가 흡수됩니다! 최대 코어 안정도(HP)가 +10% 증가합니다.",
            M_CUBE_FAIL: "큐브가 거부반응을 일으킵니다! 최대 코어 안정도(HP)가 -8% 감소합니다.",
            M_CUBE_NO: "구매를 거절하였습니다.",
            N_ANAL_PROMPT: "균열된 노드 잔해가 발견되었습니다.\n데이터 패턴을 분석하여 전략적 이점을 얻겠습니까? (성공 확률 60%)",
            N_ANAL_SUCCESS: "분석 성공! 카드 교체 횟수가 +1 영구 증가합니다.",
            N_ANAL_FAIL: "분석 실패. 다음 전투에서 카드 교체 횟수가 1 감소합니다.",
            N_ANAL_NO: "분석을 포기하였습니다.",
            N_ABS_PROMPT: "균열된 노드 잔해가 발견되었습니다.\n잔해를 직접 흡수하여 코어를 강화하겠습니까? (성공 확률 50%)",
            N_ABS_SUCCESS: "흡수 성공! 최대 코어 안정도(HP)가 +8% 증가합니다.",
            N_ABS_FAIL: "흡수 실패. 즉시 HP가 20 감소합니다.",
            N_ABS_NO: "흡수를 포기하였습니다.",
            N_DEST_PROMPT: "균열된 노드 잔해가 발견되었습니다.\n잔해를 충격으로 파괴하여 에너지를 회수하겠습니까? (성공 확률 55%)",
            N_DEST_SUCCESS: "파괴 성공! 추가 데미지가 +3% 상승합니다.",
            N_DEST_FAIL: "파괴 실패. 역폭발로 추가 데미지가 -3% 감소합니다.",
            N_DEST_NO: "파괴를 포기하였습니다.",
            A_MINOR_PROMPT: "이름 모를 제단이 있습니다.\n소제물을 봉헌하면 보상을 받을 수 있습니다.\n소제물 봉헌: 랜덤 스탯 -3%를 제물로 바칩니다.",
            A_MINOR_SACRIFICE: "제물을 바쳤습니다. {stat}이(가) -3% 감소하였습니다.",
            A_MINOR_REWARD_CRIT: "제단이 응답합니다. 크리티컬 확률이 +3% 상승합니다.",
            A_MINOR_REWARD_ATK: "제단이 응답합니다. 추가 데미지가 +3% 상승합니다.",
            A_MINOR_REWARD_NONE: "제단이 침묵합니다. 아무 일도 일어나지 않았습니다.",
            A_MINOR_NO: "봉헌을 거절하였습니다.",
            A_MAJOR_PROMPT: "이름 모를 제단이 있습니다.\n대제물을 봉헌하면 강력한 보상을 받을 수 있습니다.\n제물로 바칠 스탯을 선택하세요. (-10% 감소)",
            A_MAJOR_OPT_ATK: "추가 데미지 -10%를 제물로 봉헌",
            A_MAJOR_OPT_HP: "최대 HP -10%를 제물로 봉헌",
            A_MAJOR_OPT_SWAP: "카드 교체 횟수 -1을 제물로 봉헌",
            A_MAJOR_SUCCESS_HP: "제단이 크게 응답합니다! 최대 코어 안정도(HP)가 +10% 증가합니다.",
            A_MAJOR_SUCCESS_ATK: "제단이 크게 응답합니다! 추가 데미지가 +5% 상승합니다.",
            A_MAJOR_SUCCESS_CRIT: "제단이 크게 응답합니다! 크리티컬 배수가 +15% 상승합니다.",
            A_MAJOR_FAIL: "제단이 분노합니다! 모든 스탯이 손실됩니다.",
            A_MAJOR_NO: "봉헌을 거절하였습니다.",
            A_BLOOD_PROMPT: "이름 모를 제단이 피를 요구합니다.\n코어 안정도의 15%를 제물로 바치면 강력한 힘을 얻을 수 있습니다. (성공 확률 40%)",
            A_BLOOD_HP_COST: "코어 안정도(HP)를 15% 소모하였습니다.",
            A_BLOOD_SUCCESS: "[추가 데미지 +25%, 받는 피해 +25%] 추가 데미지 +25%, 방어력 감소 -25% 동시 상승합니다.",
            A_BLOOD_FAIL: "제단이 반응하지 않습니다. 아무 일도 일어나지 않았습니다.",
            A_BLOOD_NO: "봉헌을 거절하였습니다.",
            STAT_ATK: "추가 데미지",
            STAT_CRIT_MULT: "크리티컬 배수",
            STAT_EVASION: "회피율",
            STAT_MAX_HP: "최대 HP",
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
            GAME_SPEED: "GAME SPEED",
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
            PLAYER_BURN: "PLAYER BURN DAMAGE!",
            PLAYER_DECAY: "PLAYER DECAY DAMAGE!",
            AREA_CLEARED: "{area} Area Purified!",
            NODE_CLEARED: "Node Purified!",
            PATTERN_DISRUPTION_MSG: "PATTERN DISRUPTED: TIER UP!",
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
            DEFENSE_REDUCED: {
                NAME: "Reduced Defense",
                DESC: "Reduces Defense by {amount}."
            },
            DAMAGE_TAKEN_INCREASED: {
                NAME: "Damage Taken Increased",
                DESC: "Increases incoming damage by {percent}%."
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
            },
            REFLECTION: {
                NAME: "Reflection",
                DESC: "When the target takes normal attack damage, reflects a portion of it back to the attacker."
            },
            BURN: {
                NAME: "Burn",
                DESC: "Takes fire damage equal to 3% of max HP each turn. (Lasts 3 turns)"
            },
            DECAY: {
                NAME: "Decay",
                DESC: "Takes escalating decay damage each turn. (3% → 5% → 8% → 10% of max HP, lasts 4 turns)"
            },
            SWAMPING: {
                NAME: "Swamping",
                DESC: "In the swamp chapter, the player's evasion rate is reduced by -5% before the 5th attack, and by -20% after the 5th attack of each stage. (Negative evasion is treated as 0%)"
            },
            STEM_CELL: {
                NAME: "Stem Cell",
                DESC: "At the end of each turn: Max HP +10, Heals 20% of Max HP, ATK +2, Evasion +2%. (Applied in order)"
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
            // Chapter 1 Rules
            CH1_RULE_1: "None",
            CH1_RULE_2: "Banned Ranks (2) Every Turn",
            CH1_RULE_3: "Blind Cards (2) Every Turn",
            CH1_RULE_4: "Banned Suit Every Turn",
            CH1_RULE_5: "Poison (Probabilistic)",
            CH1_RULE_6: "Bonus (Max HP Up) + Banned Hand (Changes every turn)",
            CH1_RULE_7: "ATK Growth (+10)",
            CH1_RULE_8: "Attack Every 2 Turns",
            CH1_RULE_9: "ATK Double Growth",
            CH1_RULE_10: "Random Rule Every Turn + Awakening",

            // Chapter 2A Rules
            REVIVE_50_STRAIGHT_FLUSH_DMG_0: "50% Revive & Straight Flush DMG 0",
            ONE_PAIR_DMG_0: "One Pair DMG 0",
            TWO_PAIR_DMG_0: "Two Pair DMG 0",
            UNDER_30_POINTS_NO_DMG: "No DMG Under 30 Points",
            FORCE_SWAP_2_NEUROTOXIC: "Force Swap 2 & Neurotoxic",
            TRIPLE_DMG_0_TRIPLE_ATTACK: "Triple DMG 0 + Triple Attack (Prob.)",
            FULL_HOUSE_DMG_0_PARALYZE_40: "Full House DMG 0 + Attack Every 2 Turns",
            STRAIGHT_DMG_0_BLIND_1_BAN_1: "Straight DMG 0 & Blind 1, Ban 1",
            FLUSH_DMG_0_BLIND_2: "Flush DMG 0 & Blind 2",
            PUZZLE_DMG_50_BLIND_1_AWAKEN: "Puzzle + Awakening",

            PUZZLE_TARGET: "Target: {target}",
            REVIVE_50: "Revive 50% HP (Once)",
            NO_DMG_UNDER_30: "No DMG Under 30",
            FORCE_SWAP: "Force Swap 1 Card",
            TRIPLE_ATTACK: "Triple DMG 0 + Triple Attack (Prob.)",
            TWO_TIMES_PARALYZE_50: "Full House DMG 0 + Attack Every 2 Turns",
            NO_DMG_STRAIGHT_BLIND_1: "Straight DMG 0 + Blind 1",
            RANDOM_BLIND_BAN_1: "Random Blind 1 + Ban 1",
            PUZZLE: "Puzzle + Awakening",

            // Chapter 2B Rules
            DEEP_FOREST_NONE: "None",
            ORC_SAVAGE_RULE: "Damage Recoil (Prob.)",
            HALF_ORC_RULE: "Double Attack (Max 2)",
            ORC_WARRIOR_RULE: "Berserker",
            ORC_CHIEFTAIN_RULE: "Spirit & Provoke",
            HIGH_ORC_RULE: "Adrenaline (Ignore dmg <= 60)",
            HIGH_ORC_WARRIOR_RULE: "Heavy Berserker",
            HIGH_ORC_ASSASSIN_RULE: "Critical 25% (Atk +50%)",
            HIGH_ORC_CHIEFTAIN_RULE: "Unyielding Spirit & Provoke",
            HIGH_ORC_LORD_RULE: "Heavy Berserker & Provoke",
            SAND_STORM_TRIPLE_AWAKEN: "RULE: SAND STORM + TRIPLE ATK + AWAKEN",
            BLIND_BAN_REFLECTION_AWAKEN: "RULE: BLIND/BAN + REFLECT + AWAKEN (DECAY)",

            // Chapter 3A Rules
            ACID_ATTACK: "RULE: ACID ATTACK (Fixed 15 dmg every 3 turns + 20% Burn)",
            HEMATOPHAGY: "RULE: HEMATOPHAGY (Heal 30% of damage dealt)",
            MUCUS: "RULE: MUCUS (Fixed 20 dmg every 2 turns + 50% Accuracy Down/Poison)",
            SHOOTING_WEB: "RULE: SHOOTING WEB (Fixed 10 dmg every 2 turns + Evasion -5%)",
            GHOST: "RULE: GHOST (Only hand bonus damage applies)",
            HONEY_DANGUN: "RULE: HONEY YUMMY/DANGUN MYTH (20% skip+heal / 3·7 included +8)",
            BRITTLE: "RULE: BRITTLE (DR+10% each turn, resets at 5 / Diamond included +8)",
            ROLL_BOULDER: "RULE: ROLL BOULDER (Fixed 20 dmg every 2 turns, 40% dodge)",
            PETRIFIED_RULE: "RULE: PETRIFIED (40% chance to Petrify 1 card on hit)",
            TYPHON_MYTH: "RULE: KEY MYTHS OF TYPHON (Revive x3 / Instakill on 4-suit Flush)",

            // Chapter 3A Echo
            CHAPTER_ECHO: "CHAPTER RULE: Echo (20% chance for 70% dmg bonus attack)",

            // Chapter 3B Rules
            HARDNESS: "RULE: HARDNESS (Takes damage only from Two Pair or higher hands)",
            MUDDED_20PCT: "RULE: MUD SPRAY-20% (20% chance to Mud 1 card when boss attacks)",
            DEATHROLL: "RULE: DEATHROLL (Boss attacks immediately when player SWAPs)",
            AUTOTOMY: "RULE: AUTOTOMY (Reduces player attack damage by 30% every 2 turns)",
            CAMOUFLAGE: "RULE: CAMOUFLAGE (100% evasion against player attacks every 3 turns)",
            INITIALTORY: "RULE: INITIALTORY (Resets hand every turn + Perm -5% Joker chance)",
            HOLD_BREATH: "RULE: HOLD BREATH (Blocks all damage next turn after 2 successful boss attacks)",
            MUDDED_40PCT: "RULE: MUD SPRAY-40% (40% chance to Mud 2 cards when boss attacks)",
            AWAKENING_3B: "RULE: AWAKENING (HPフル회복 + AWAKEN + ATK +20 at 50% HP or below)",
            STEM_CELL: "RULE: STEM CELL (Clear Stem Cell by succeeding with Straight-type hands within 3 turns)",

            // Chapter 3B Swamping
            CHAPTER_SWAMPING: "CHAPTER RULE: Swamping (Evasion -5% before 5th atk, -20% after)",
        },
        UI: {
            CHAPTER_SELECT_TITLE: "Field Area Stabilized",
            CHAPTER_SELECT_SUBTITLE: "Select Next Expansion Area",
            BACK_TO_MAIN: "BACK TO MAIN PAGE",
            ATTACK: "ATTACK",
            SWAP: "SWAP",
            BOSS: "Core Stability",
            PLAYER: "Player Core",
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
            USES_REMAINING: "USES REMAINING",
            WILD: " (WILD)",
            JOKER_CUE: "JOKER",
            BLINDED_CUE: "BLINDED !",
            CLICK_CUE: "CLICK!",
            NEW_GAME: "NEW GAME",
            START_GAME: "START GAME",
            TUTORIAL: "TUTORIAL",
            ALTAR_SYSTEM: "ALTAR SYSTEM",
            COLLECTION: "COLLECTION",
            COLLECTION_TITLE: "COLLECTION",
            COLLECTION_ATTACK_ANIM: "ATTACK ANIMATIONS",
            COLLECTION_LOCKED: "LOCKED",
            COLLECTION_ACTIVE: "ACTIVE",
            COLLECTION_INACTIVE: "INACTIVE",
            COLLECTION_APPLY: "APPLY",
            COLLECTION_REMOVE: "REMOVE",
            COLLECTION_PREVIEW: "▶ PREVIEW",
            COLLECTION_PROGRESS: "PROGRESS",
            COLLECTION_COMING_SOON: "COMING IN FUTURE UPDATES",
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
            OVERWRITE_CONFIRM: "REALLY WANT TO OVERWRITE THIS SAVED DATA SLOT?",
            CLEAR_CONGRATS: "Congratulations!",
            CLEAR_EASY_BODY: "You have cleared all stages of EASY difficulty!\nNow you can play NORMAL difficulty, obtain loot from bosses,\nactivate Altar skills, and clear even more diverse chapters!",
            CLEAR_NORMAL_BODY: "You have cleared all stages of NORMAL difficulty!\nNow you can play HARD difficulty, obtain loot from bosses,\nactivate Altar skills, and clear even more diverse chapters!",
            BACK_TO_MAIN_MENU: "Back to Main Menu",
            UNDER_PREPARATION: "Under Preparation.",
            FINAL_CLEAR_BODY: "You have cleared all the chapters implemented so far.\nPlease look forward to future updates! Thank you.",
            // Chapter Next Popup (v3.0)
            CHAPTER_NEXT_CLEAR: "{area} Area Stabilized!",
            CHAPTER_NEXT_ACTIVATED: "Next sector has been activated.",
            CHAPTER_NEXT_ENTER: "ENTER",
            CHAPTER_3A_NAME: "Chapter 3A: Cave",
            CHAPTER_3B_NAME: "Chapter 3B: Swamp",
            HYDRA_FLUSH_COUNT: "Typhon Myth: {count}/4"
        },
        STATUS_POPUP: {
            title: "Player Status (STATUS)",
            difficulty: "Difficulty",
            maxHp: "Max Core Stability",
            swapCount: "Card Swap Count",
            flatAtk: "Extra Damage (Flat)",
            percentAtk: "Extra Damage (%)",
            critMult: "Critical Multiplier",
            critChance: "Crit Chance Per Card",
            evasion: "Evasion Rate",
            defense: "Defense",
            active: "Active",
            inactive: "Inactive",
            potential: "Conditional",
            baseVal: "Base Value",
            appliedFactors: "Applied Factors List",
            noFactors: "No additional factors applied.",
            jokerCard: "Based on A/JOKER Cards",
            factors: {
                prepper: "Prepper [1A] (Max HP +25, +30 with Biorhythm Acceleration)",
                stage6: "Stage 6 Clear Bonus (Max HP +20%, +24% with Biorhythm Acceleration)",
                debilitated: "Condition: Debilitated (Max HP -20%)",
                fragments: "Fragments Recovery [5B-3] (+2 swap chances when HP <= 25%)",
                sharpen: "Sharpen Cards [1B] (+25 flat damage)",
                collapse: "Node Collapse [5B-2] (+10 / +20 / +30 flat damage based on HP)",
                overloaded: "Overloaded [5A-2] (+10% to +30% damage on consecutive same hand)",
                resonance: "Instability Resonance [5A-3] (+5% / +10% damage based on Boss HP)",
                adaptive: "Adaptive Calc [6A-1] (+5% damage per hit stack, max +50%)",
                coreResonance: "Core Resonance [6B-1] (+15% damage when Boss HP <= 50%)",
                bottomDeal: "Bottom Deal [4A-2] (+5% Joker appearance probability)",
                oneness: "Oneness with Nature [2B] (+5% Evasion, ignores env restrictions)",
                envPenalty2B: "Ch. 2B Env Penalty (Evasion disabled)",
                defenseReduced: "Event Defense Reduction (Defense -{amount})",
                equipmentGear: "Equipment Gear [3B-1] (Damage Taken -30%)",
                damageTakenIncreased: "Damage Taken Increased (Damage Taken +{percent}%)",
                eventPctAtk: "Event Bonus (Damage +{val}%)",
                eventCritMult: "Event Bonus (Crit Multiplier +{val})",
                eventCritChance: "Event Bonus (Crit Chance +{val}%)",
                eventEvasion: "Event Bonus (Evasion +{val}%)",
                eventMaxHp: "Event Bonus (Max HP {val}%)",
                eventSwap: "Event Bonus (Swap Count {val})",
                eventDmgTaken: "Event Bonus (Damage Taken +{val}%)",
                eventSwapPenalty: "Event Penalty (Swap Count {val}) [Next Battle Only]",
                eventHpDrain: "Event Penalty (HP -{val} Per Turn) [Next Battle Only]"
            }
        },
        EVENT: {
            CAT_CREATURE: "Unstable Creature",
            CAT_MERCHANT: "Shady Shadow Merchant",
            CAT_NODE: "Cracked Node Fragment",
            CAT_ALTAR: "Unknown Altar",
            YES: "Yes",
            NO: "No",
            CONFIRM: "Confirm",
            C_SMALL_PROMPT: "You encountered a small conceptual entity suspected to be an animal.\nNode conversion appears to be in progress.\nWould you extract core stability to help restore it? (Success rate: 70%)",
            C_SMALL_HP_COST: "Player's core stability (HP) decreased by 5%.",
            C_SMALL_SUCCESS: "Node restoration succeeded. Extra damage increased by +2%.",
            C_SMALL_FAIL: "Restoration failed. A debuff dealing 5 HP per turn applies in the next battle.",
            C_SMALL_NO: "You declined to help.",
            C_MED_PROMPT: "You encountered a medium conceptual entity suspected to be an animal.\nNode conversion is significantly advanced.\nWould you extract core stability to help restore it? (Success rate: 50%)",
            C_MED_HP_COST: "Player's core stability (HP) decreased by 8%.",
            C_MED_SUCCESS: "Node restoration succeeded. Extra damage increased by +4%.",
            C_MED_FAIL: "Restoration failed. HP immediately decreases by 10.",
            C_MED_NO: "You declined to help.",
            C_LRG_PROMPT: "You encountered a large conceptual entity suspected to be an animal.\nNode conversion is nearly complete.\nWould you extract core stability to help restore it? (Success rate: 30%)",
            C_LRG_HP_COST: "Player's core stability (HP) decreased by 12%.",
            C_LRG_SUCCESS: "Node restoration succeeded. Extra damage increased by +6%.",
            C_LRG_FAIL: "Restoration failed. HP immediately decreases by 20.",
            C_LRG_NO: "You declined to help.",
            M_CANDY_PROMPT: "A shady shadow merchant is selling snacks.\n'Eat this and you'll feel invincible.' (Cost: 5% core stability)",
            M_CANDY_HP_COST: "Core stability (HP) decreased by 5%.",
            M_CANDY_SUCCESS: "The snack works! Critical multiplier increased by +10%.",
            M_CANDY_FAIL: "The snack was spoiled! A debuff dealing 8 HP per turn applies in the next battle.",
            M_CANDY_NO: "You declined to purchase.",
            M_DRINK_PROMPT: "A shady shadow merchant is selling a drink.\n'Drink this and you'll feel lighter.' (Cost: 8% core stability)",
            M_DRINK_HP_COST: "Core stability (HP) decreased by 8%.",
            M_DRINK_GREAT: "The drink is perfectly absorbed! Evasion rate permanently increased by +6%.",
            M_DRINK_OK: "The drink partially works. Evasion rate permanently increased by +3%.",
            M_DRINK_FAIL: "The drink was spoiled! HP immediately decreases by 15.",
            M_DRINK_NO: "You declined to purchase.",
            M_CUBE_PROMPT: "A shady shadow merchant is selling a small cube.\n'Absorb this and your core will be strengthened.' (Cost: 10% core stability)",
            M_CUBE_HP_COST: "Core stability (HP) decreased by 10%.",
            M_CUBE_SUCCESS: "The cube is absorbed! Maximum core stability (HP) increased by +10%.",
            M_CUBE_FAIL: "The cube causes a rejection reaction! Maximum core stability (HP) decreased by -8%.",
            M_CUBE_NO: "You declined to purchase.",
            N_ANAL_PROMPT: "A cracked node fragment has been discovered.\nWould you analyze the data pattern to gain a strategic advantage? (Success rate: 60%)",
            N_ANAL_SUCCESS: "Analysis succeeded! Card swap count permanently increased by +1.",
            N_ANAL_FAIL: "Analysis failed. Card swap count decreases by 1 in the next battle.",
            N_ANAL_NO: "You abandoned the analysis.",
            N_ABS_PROMPT: "A cracked node fragment has been discovered.\nWould you directly absorb the fragment to strengthen your core? (Success rate: 50%)",
            N_ABS_SUCCESS: "Absorption succeeded! Maximum core stability (HP) increased by +8%.",
            N_ABS_FAIL: "Absorption failed. HP immediately decreases by 20.",
            N_ABS_NO: "You abandoned the absorption.",
            N_DEST_PROMPT: "A cracked node fragment has been discovered.\nWould you destroy the fragment with force to recover energy? (Success rate: 55%)",
            N_DEST_SUCCESS: "Destruction succeeded! Extra damage increased by +3%.",
            N_DEST_FAIL: "Destruction failed. Back-explosion decreases extra damage by -3%.",
            N_DEST_NO: "You abandoned the destruction.",
            A_MINOR_PROMPT: "There is an unknown altar.\nOffering a minor tribute may yield a reward.\nMinor offering: sacrifice a random stat -3%.",
            A_MINOR_SACRIFICE: "You offered a tribute. {stat} decreased by -3%.",
            A_MINOR_REWARD_CRIT: "The altar responds. Critical chance increased by +3%.",
            A_MINOR_REWARD_ATK: "The altar responds. Extra damage increased by +3%.",
            A_MINOR_REWARD_NONE: "The altar is silent. Nothing happened.",
            A_MINOR_NO: "You declined the offering.",
            A_MAJOR_PROMPT: "There is an unknown altar.\nOffering a major tribute may yield a powerful reward.\nChoose a stat to sacrifice. (-10% decrease)",
            A_MAJOR_OPT_ATK: "Sacrifice Extra Damage -10%",
            A_MAJOR_OPT_HP: "Sacrifice Max HP -10%",
            A_MAJOR_OPT_SWAP: "Sacrifice Card Swap Count -1",
            A_MAJOR_SUCCESS_HP: "The altar responds greatly! Maximum core stability (HP) increased by +10%.",
            A_MAJOR_SUCCESS_ATK: "The altar responds greatly! Extra damage increased by +5%.",
            A_MAJOR_SUCCESS_CRIT: "The altar responds greatly! Critical multiplier increased by +15%.",
            A_MAJOR_FAIL: "The altar is furious! All stats are lost.",
            A_MAJOR_NO: "You declined the offering.",
            A_BLOOD_PROMPT: "The unknown altar demands blood.\nSacrifice 15% of your core stability to gain great power. (Success rate: 40%)",
            A_BLOOD_HP_COST: "Core stability (HP) decreased by 15%.",
            A_BLOOD_SUCCESS: "[Extra Damage +25%, Damage Taken +25%] Extra damage +25% and defense reduction -25% simultaneously.",
            A_BLOOD_FAIL: "The altar does not respond. Nothing happened.",
            A_BLOOD_NO: "You declined the offering.",
            STAT_ATK: "Extra Damage",
            STAT_CRIT_MULT: "Critical Multiplier",
            STAT_EVASION: "Evasion Rate",
            STAT_MAX_HP: "Max HP",
        }
    }
};
