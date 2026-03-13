# 챕터 및 보스 스탯 요약 (Chapter & Boss Stats Summary)

본 문서는 전 스테이지 보스들의 상세 스텟과 메커니즘을 정리한 레포트입니다. (v3.0.0 기준)

## 🛠️ 난이도별 보정 수치 (Stat Scalings)

| 난이도 | 보스 HP 배율 | 보스 ATK 배율 | 10스테이지 규칙 개수 | 핵심 보너스 |
| :--- | :---: | :---: | :---: | :--- |
| **EASY** | 0.8x | 0.8x | 1개 | 초기 HP 240, SWAP 3회 |
| **NORMAL** | 1.0x | 1.0x | 1개 | 초기 HP 200, SWAP 2회 |
| **HARD** | 1.2x | 1.2x | 1개 | 초기 HP 180, SWAP 2회 |
| **HELL** | 1.5x | 2.0x | 2개 | 초기 HP 180, SWAP 1회 |

---

## 🌿 챕터 1 - 들판 (Chapter 1 - Meadow field)

| 스테이지 | 보스이름 | HP | ATK | 보스의 상태이상(명중률 정보도 포함) | 부여 가능한 상태이상 | 규칙 | 특수룰 | 기타 |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Goblin | 150 | 10 | ACC 100% | 출혈 | CH1_RULE_1 | 기본형 | - |
| **2** | Goblin Skirmisher | 200 | 15 | ACC 100% | - | CH1_RULE_2 | 특정 숫자 금지 | - |
| **3** | Goblin Rider | 250 | 20 | ACC 100% | - | CH1_RULE_3 | 블라인드 2장 | - |
| **4** | Hobgoblin | 250 | 20 | ACC 100% | - | CH1_RULE_4 | 특정 문양 금지 | 전리품(TR_1_4) |
| **5** | Goblin Shaman | 300 | 10 | ACC 100% | 중독 | CH1_RULE_5 | 중독 확률 부여 | 전리품(TR_1_5) |
| **6** | Golden Goblin | 350 | 5 | ACC 100% | - | CH1_RULE_6 | 족보 금지 | 승리 시 최대 HP 보너스 |
| **7** | Elite Goblin | 300 | 15 | ACC 100% | - | CH1_RULE_7 | 공격력 상승 (+10/hit) | - |
| **8** | Troll | 350 | 40 | ACC 100%, 경감(15%) | - | CH1_RULE_8 | 2턴 마다 공격 + 재생 | - |
| **9** | Giant Goblin | 350 | 5 | ACC 100%, 재생(Hard+) | - | CH1_RULE_9 | 공격력 배수 증가 | - |
| **10** | **Goblin Lord** | 400 | 15 | ACC 100%, 경감(30%) | - | CH1_RULE_10 | 매 턴 무작위 규칙 + 각성 | 전리품(TR_1_10) |

---

## 🏜️ 챕터 2A - 사막 (Chapter 2A - Desert)

| 스테이지 | 보스이름 | HP | ATK | 보스의 상태이상(명중률 정보도 포함) | 부여 가능한 상태이상 | 규칙 | 특수룰 | 기타 |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | MUMMY | 180 | 15 | ACC 100% | 중독, 쇠약 | REVIVE_50%_STRAIGHT_FLUSH_DMG_0 | 부활(50%), 스플 무효 | - |
| **2** | SAND SNAKE | 200 | 20 | ACC 100%, 재생, 경감, 회피 | 중독, 쇠약 | ONE_PAIR_DMG_0 | 원페어 무효, 재생, 경감, 회피 | - |
| **3** | CHIMERA SNAKE HUMAN | 200 | 20 | ACC 100%, 재생, 경감, 회피 | 출혈, 중독, 쇠약 | TWO_PAIR_DMG_0 | 투페어 무효, 재생, 경감, 회피 | - |
| **4** | SAND NIDDLE LIZARD | 250 | 20 | ACC 100%, 재생, 경감 | 출혈 | UNDER_30_POINTS_NO_DMG | 30점 미만 무효, 재생, 경감 | - |
| **5** | SAND SCORPION | 250 | 15 | ACC 100%, 재생, 경감 | **신경성 맹독** | FORCE_SWAP_2_NEUROTOXIC | 강제 교체 2장, 재생, 경감 | 전리품(TR_2A_5) |
| **6** | DESERT VULTURES | 200 | 15 | ACC 100%, 회피 | 출혈, 중독, 쇠약 | TRIPLE_DMG_0_TRIPLE_ATTACK | 트리플 무효, 삼중 공격, 회피 | - |
| **7** | SAND GOLEM | 320 | 35 | ACC 100%, 경감 | **마비** | FULL_HOUSE_DMG_0_PARALYZE_40% | 풀하우스 무효, 경감, 2턴 마다 공격 | - |
| **8** | SAND WYVERN | 300 | 20 | ACC 100%, 재생, 경감, 회피 | 중독, 쇠약 | STRAIGHT_DMG_0_BLIND_1_BAN_1 | 스트레이트 무효, 블라인드1, 밴1 | - |
| **9** | SAND DEATHWORM | 340 | 20 | ACC 100%, 재생, 경감 | 출혈, 중독, 쇠약 | FLUSH_DMG_0_BLIND_3 | 플러시 무효, 블라인드 3 | - |
| **10** | **SPHINX** | 300 | 40 | ACC 100%, 재생, 경감 | 출혈, 중독, 쇠약 | PUZZLE_DMG+50%_AWAKEN | 퍼즐, 각성, 재생, 경감 | 전리품(TR_2A_10) |
| **11** | **SAND DRAGON** | 400 | 15 | ACC 100%, 재생, 경감 | **화상** | SAND_STORM_AWAKEN_BURN | 모래폭풍(3턴), 각성, 화상 | 전리품(TR_2A_SP) |

---

## 🌲 챕터 2B - 깊은 숲 (Chapter 2B - Deep Forest)

| 스테이지 | 보스이름 | HP | ATK | 보스의 상태이상(명중률 정보도 포함) | 부여 가능한 상태이상 | 규칙 | 특수룰 | 기타 |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | ORC | 170 | 18 | ACC 65% | 출혈 | DEEP_FOREST_NONE | 기본형 | - |
| **2** | ORC SAVAGE | 200 | 22 | ACC 70% | 출혈 | ORC_SAVAGE_RULE | 데미지 반동(확률적) | - |
| **3** | HALF ORC | 220 | 20 | ACC 100% | 출혈 | HALF_ORC_RULE | 영악함 (2회 공격) | - |
| **4** | ORC WARRIOR | 250 | 25 | ACC 65% | 출혈 | ORC_WARRIOR_RULE | 버서커 (흡혈) | - |
| **5** | ORC CHIEFTAIN | 260 | 23 | ACC 75%, 경감, 도발 | 명중률 저하 | ORC_CHIEFTAIN_RULE | 강인한 의지/도발/불굴 | 전리품(TR_2B_5) |
| **6** | HIGH ORC | 280 | 20 | ACC 80% | 출혈 | HIGH_ORC_RULE | 아드레날린 (60이하 무시) | - |
| **7** | HIGH ORC WARRIOR | 310 | 35 | ACC 75% | 출혈 | HIGH_ORC_WARRIOR_RULE | 강력한 버서커 | - |
| **8** | HIGH ORC ASSASSIN | 290 | 30 | ACC 80% | 출혈, 중독 | HIGH_ORC_ASSASSIN_RULE | 치명타(25% 확률 1.5배) | - |
| **9** | HIGH ORC CHIEFTAIN | 330 | 35 | ACC 85%, 도발 | 출혈, 명중률 저하 | HIGH_ORC_CHIEFTAIN_RULE | 불굴의 의지(1회 회복) | - |
| **10** | **HIGH ORC LORD** | 370 | 40 | ACC 95%, 도발 | 출혈, 명중률 저하 | HIGH_ORC_LORD_RULE | 강력한 버서커, 도발 | 전리품(TR_2B_10) |
| **11** | **HIGH ORC SHAMAN** | 350 | 12 | ACC 100%, 각성, 반사 | 출혈, 중독, 쇠약 | BLIND_BAN_REFLECTION_AWAKEN | 반사, 각성, 부패 폭발 | 전리품(TR_2B_SP) |

---

## ⛰️ 챕터 3A - 동굴 (Chapter 3A - Cave)

| 스테이지 | 보스이름 | HP | ATK | 보스 패시브(기본 메아리 외) | 부여 상태이상 | 규칙(Rule) | 특수룰 요약 | 기타 |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | SLIME | 180 | 8 | 재생(+2) | 화상 | ACID_ATTACK | 3턴마다 고정 15뎀 + 화상(20%) | 전 보스 메아리 |
| **2** | VAMPIRE BAT | 200 | 15 | 흡혈(30%) | - | HEMATOPHAGY | 가한 피해 30% 흡혈 (영구) | - |
| **3** | CAVE WORM | 200 | 12 | - | 중독, 명중저하 | MUCUS | 2턴마다 고정 20뎀 + 50% 확률 | - |
| **4** | POISON SPIDER | 230 | 15 | - | 명중저하, 신경성맹독 | SHOOTING_WEB | 2턴마다 10뎀 + 명중저하(5%) 및 20% 확률 신경성맹독 | - |
| **5** | WRAITH | 250 | 18 | 유체화 | - | GHOST | 족보 데미지만 적용(기본/카드무효) | - |
| **6** | CAVE BEAR | 300 | 23 | 경감(15%) | - | HONEY_DANGUN | 20% 스킵 꿀섭취 재생, 숫자 3/7 타격시 +8 | - |
| **7** | CRYSTAL GOLEM | 350 | 23 | 취성(DR 누적) | - | BRITTLE | 매턴 DR+10% (5회 시 10%로 리셋), 다이아몬드 타격시 +8 | 전리품(TR_3A_07) |
| **8** | DRAKE | 350 | 20 | 경감(15%) | - | ROLL_BOULDER | 2턴마다 20뎀 (플레이어 40% 회피 가능) | - |
| **9** | BASILISK | 350 | 25 | 경감(15%) | 석화 | PETRIFIED_RULE | 30% 확률 카드 1장 2턴 석화 | - |
| **10** | **HYDRA** | 320 | 28 | 경감(15%), 부활(3회) | - | TYPHON_MYTH | HP 60% 부활 3회(1턴스킵), 플러시 4문양 즉사 | 전리품(TR_3A_10) |

---
