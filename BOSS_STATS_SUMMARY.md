# 챕터 및 보스 스탯 요약 (Chapter & Boss Stats Summary)

본 문서는 전 스테이지 보스들의 상세 스텟과 메커니즘을 정리한 레포트입니다.

## 🛠️ 난이도별 보정 수치 (Stat Scalings)

| 난이도 | 보스 HP 배율 | 보스 ATK 배율 | 공격력 상한 (ATK CAP) | 10스테이지 규칙 개수 |
| :--- | :---: | :---: | :---: | :---: |
| **EASY** | 0.8x | 0.8x | 100 | 1개 |
| **NORMAL** | 1.0x | 1.0x | 100 | 1개 |
| **HARD** | 1.2x | 1.2x | 100 | 2개 |
| **HELL** | 1.5x | 2.0x | 100 | 2개 |

---

```markdown
## 🌿 챕터 1 - 들판 (Chapter 1 - Meadow field)
```

| 스테이지 | 보스 이름 | 체력 (HP) | 공격력 (ATK) | 주요 규칙 (RULE) | 부여 가능 상태이상 (Application) | 적용 받는 상태이상 (Susceptibility) | 특수 조건 및 기믹 |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | Goblin | 150 | 10 | BLEED_PROB | 출혈 (60%) | 독, 출혈, 마비, 쇠약 | 기본형 보스 |
| **2** | Goblin Skirmisher | 200 | 15 | BAN_RANK | 출혈 (난이도별) | 독, 출혈, 마비, 쇠약 | 특정 숫자(Rank) 사용 금지 |
| **3** | Goblin Rider | 250 | 20 | BLIND | 출혈 (난이도별) | 독, 출혈, 마비, 쇠약 | 카드 2장이 뒷면으로 보임 |
| **4** | Hobgoblin | 250 | 20 | BAN_SUIT | 출혈 (난이도별) | 독, 출혈, 마비, 쇠약 | 특정 문양(Suit) 사용 금지 |
| **5** | Goblin Shaman | 300 | 10 | POISON_PROB | 중독 (40%) | 독, 출혈, 마비, 쇠약 | 매 턴 피해량이 중첩되는 독 |
| **6** | Golden Goblin | 350 | 5 | BAN_HAND | NONE | 독, 출혈, 마비, 쇠약 | 특정 족보 금지, **승리 시 최대 체력 +20%**, HP 50%↓ 시 **재생(+10/Turn)** |
| **7** | Elite Goblin | 300 | 15 | ATK_UP | 마비 (20%) | 독, 출혈, 마비, 쇠약 | **공격 적중 시** ATK +10 (상한 100), **상시 경감 10%** |
| **8** | Troll | 350 | 40 | SKIP_TURN_REGEN | NONE | 독, 출혈, 마비, 쇠약 | **2턴에 한 번 공격**, 상시 **재생(+10/Turn)**, **상시 경감 20%** |
| **9** | Giant Goblin | 350 | 5 | ATK_DOUBLE | NONE | 독, 출혈, 마비, 쇠약 | **매 턴** 공격력 2배 증가 (상한 100), **상시 경감 20%** |
| **10** | **Goblin Lord** | 400 | 15 | CHAOS | 무작위 (중독 포함) | 독, 출혈, 마비, 쇠약 | **매 턴 무작위 규칙**, **상시 재생(+10/Turn)**, **상시 경감 30%**, **각성(HP 50%↓ 시 1회 풀회복 & ATK 상승 & 턴 스킵 & 경감/재생 영구 제거)** |

---

## 🏜️ 챕터 2A - 사막 (Chapter 2A - Desert)

| 스테이지 | 보스 이름 | 체력 (HP) | 공격력 (ATK) | 주요 규칙 (RULE) |
| :---: | :--- | :---: | :---: | :---: |
| **2A-1** | MUMMY | 180 | 20 | NONE |
| **2A-2** | SAND SNAKE | 200 | 25 | NONE |
| **2A-3** | CHIMERA SNAKE HUMAN | 200 | 30 | NONE |
| **2A-4** | SAND NIDDLE LIZARD | 250 | 30 | NONE |
| **2A-5** | SAND SCORPION | 250 | 20 | NONE |
| **2A-6** | DESERT VULTURES | 200 | 20 | NONE |
| **2A-7** | SAND GOLEM | 350 | 35 | NONE |
| **2A-8** | SAND WYVERN | 400 | 15 | NONE |
| **2A-9** | SAND DEATHWARM | 400 | 20 | NONE |
| **2A-10** | SPHINX | 300 | 40 | NONE |

---

## 🌲 챕터 2B - 깊은 숲 (Chapter 2B - Deep Forest)

| 스테이지 | 보스 이름 | 체력 (HP) | 공격력 (ATK) | 주요 규칙 (RULE) |
| :---: | :--- | :---: | :---: | :---: |
| **2B-1** | ORC | 180 | 15 | NONE |
| **2B-2** | ORC SAVAGE | 220 | 20 | NONE |
| **2B-3** | HALF ORC | 240 | 25 | NONE |
| **2B-4** | ORC WARRIOR | 260 | 25 | NONE |
| **2B-5** | ORC CHIEFTAIN | 280 | 25 | NONE |
| **2B-6** | HIGH ORC | 300 | 30 | NONE |
| **2B-7** | HIGH ORC WARRIOR | 350 | 35 | NONE |
| **2B-8** | HIGH ORC ASSASSIN | 300 | 30 | NONE |
| **2B-9** | HIGH ORC CHIEFTAIN | 350 | 40 | NONE |
| **2B-10** | HIGH ORC LORD | 400 | 50 | NONE |

---

## ☣️ 상태이상 상세 요약 (Status Effects)

1.  **출혈 (Bleeding)**: 매 턴 5/10 데미지. (중첩 시 과출혈로 진화 가능)
2.  **중독 (Poisoning)**: 매 턴 턴수만큼 데미지 증폭 (5->10->15->20). (중첩 시 쇠약으로 진화 가능)
3.  **마비 (Paralyzing)**: 공격 불가 (Turn Skip).
4.  **쇠약 (Debilitating)**: 가하는 데미지 20% 감소, 최대 체력 20% 감소.
5.  **재생 (Regenerating)**: 매 턴 고정 체력 회복.
6.  **경감 (Reduction)**: 받는 데미지 정해진 %만큼 감소. (현재 챕터 1 보스 전용)

---

## ⚡ 특수 기믹 분석 (Special Mechanics)

*   **각성 (Awakening)**: 특정 보스 한정. 체력이 50% 이하로 떨어지는 순간 **즉시 체력을 100% 회복**하며 공격력이 난이도별로 **증가**합니다. 각성 시 보스는 해당 턴에 공격하지 않고 턴을 넘기며, 기존에 보유한 방어적 효과가 영구 제거될 수 있습니다.
*   **성장형 공격 (Stat Growth)**: 특정 보스는 매 턴 유저를 피격할 때마다 공격력이 상승하거나 배가됩니다. 이는 설정된 **공격력 상한(CAP)**까지만 작동합니다.
*   **스테이지 보너스**: 특정 보스 처치 시 유저는 영구적인 스탯 버프를 획득할 수 있습니다.
