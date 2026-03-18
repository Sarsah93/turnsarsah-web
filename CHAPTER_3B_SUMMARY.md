# Chapter 3B - 늪지대(Swamp) 구현 요약

## 1. 챕터 규칙: 잠김(Swamping)
- **효과**: 늪지대에서 플레이어의 발이 묶여 회피가 어려워집니다.
- **로직**:
  - 플레이어의 5번째 공격 이전까지: 회피율 -5% 감소.
  - 5번째 공격 이후부터: 회피율 -20% 감소.
  - 회피율이 마이너스가 될 경우 0%로 취급.
- **아이콘**: `잠김(Swamping).png` 매핑 완료.

## 2. 스테이지 및 보스 구성
| 스테이지 | 보스 이름 | HP | ATK | 주요 규칙 | 트로피/전리품 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 3B-1 | ALLIGATOR SNAPPING TURTLE | 160 | 20 | 단단함(HARDNESS) | NONE |
| 3B-2 | MURLOC | 180 | 20 | 진흙뿌리기-20% | NONE |
| 3B-3 | CROCODILE | 180 | 25 | 데스롤(DEATHROLL) | NONE |
| 3B-4 | LIZARD SKINK | 200 | 15 | 자절(AUTOTOMY) | NONE |
| 3B-5 | LIZARD MAN | 250 | 20 | 위장(CAMOUFLAGE) | NONE |
| 3B-6 | LIZARD SLANN | 200 | 15 | 초기의식(INITIALTORY) | TR_3B_06 |
| 3B-7 | LIZARD SAURUS | 300 | 25 | 숨참기(HOLD_BREATH) | NONE |
| 3B-8 | TROGLODON | 400 | 20 | 진흙뿌리기-40% | NONE |
| 3B-9 | LIZARD KROXIGOR | 350 | 30 | 각성(AWAKENING_3B) | NONE |
| 3B-10 | LIZARD KING | 380 | 35 | 줄기세포(STEM_CELL) | TR_3B_10 |

## 3. UI 및 리소스 반영
- **보스 이미지**: `public/assets/boss_swamp/` 경로의 이미지 매핑 (실제 파일명과 보스 이름 일치화).
- **배경 영상**: `swamp_background.mp4` 적용.
- **배경 음악**: `swamp_background.mp3` 적용.
- **전리품(트로피)**: 3B-6/10 전용 트로피 이미지 연동 완료.
- **디버그 버튼**: 메인 메뉴에 `3B SWAMP STAGE DEBUG` 버튼 추가.

## 4. 주요 수정 파일
- `src/constants/stages.ts`: 보스 이름 및 스탯 최종 정정.
- `src/constants/translations.ts`: 3B 전용 규칙 텍스트 반영.
- `src/constants/altarSystem.ts`: 3B 트로피 데이터(TR_3B_06, TR_3B_10) 정의.
- `src/logic/useGameLoop.ts`: 승리 시 트로피 획득 및 3B 특수 기믹 로직.
- `src/components/Battle/BossDisplay.tsx`: 3B 보스 이미지 파일 매핑 보정.
- `src/components/MainMenu.tsx`: 디버그 버튼 명칭 수정.
- `src/App.tsx`: 늪지대 배경 리소스 분기 처리.
