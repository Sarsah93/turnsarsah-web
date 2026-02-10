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
            BACK: "뒤로가기"
        },
        TUTORIAL: {
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
                TEXT: "같은 숫자쌍(PAIR), 같은 모양(FLUSH), 연속된 숫자(STRAIGHT) 등으로 족보를 만들 수 있습니다. ONE PAIR는 같은 숫자 2장을 선택할 때 적용되며 족보 보너스 10점을 얻습니다."
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
                TEXT: "뒤집힌 카도가 있는 상태에서 공격을 진행해 보세요! (1/2)"
            },
            STEP_17: {
                TITLE: "실습: 블라인드 (2/2)",
                TEXT: "한 번 더 블라인드 상태에서 공격을 해봅시다! (2/2)"
            },
            NEXT: "다음",
            PREV: "이전",
            EXIT: "메인 화면으로"
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
            NEXT: "NEXT",
            PREV: "PREV",
            EXIT: "BACK TO MAIN"
        }
    }
};
