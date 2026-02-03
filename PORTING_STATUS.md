# TurnSarsah JavaScript 포팅 진행 상황

**시작일**: 2026-02-03  
**목표**: Pygame v2.0.0.3 → Vite + React + TypeScript

---

## ✅ 완료된 작업

### 문서 및 분석
- [x] Pygame 원본 코드 분석 (main.py, entities.py, mechanics.py, ui.py, constants.py)
- [x] docs 폴더 마크다운 검토 (task.md, implementation_plan.md, walkthrough.md)
- [x] 아키텍처 마이그레이션 문서 작성 (`JAVASCRIPT_PORT_GUIDE.md`)
- [x] 프로젝트 구조 설계

### 기본 인프라
- [x] Vite + React + TypeScript 스캐폴드 (frontend/)
- [x] 폴더 구조 생성 (constants/, types/, logic/, state/, storage/, components/, styles/)
- [x] package.json 의존성 추가 (zustand)

### 상수 및 타입 레이어
- [x] `constants/gameConfig.ts` - 화면, 게임 상태, 게임 규칙
- [x] `constants/cards.ts` - 카드 수치, 족보 보너스
- [x] `constants/stages.ts` - 보스 스테이지 데이터
- [x] `constants/colors.ts` - 색상 정의
- [x] `types/Card.ts` - Card 인터페이스 및 CardFactory
- [x] `types/Character.ts` - Character, Condition 인터페이스
- [x] `types/GameData.ts` - 세이브 데이터 구조

### 핵심 로직
- [x] `logic/Deck.ts` - 덱 구현 (뽑기, 리셔플)
- [x] `logic/mechanics.ts` - 족보 판정 엔진 (완전 구현)
  - Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight
  - Three of a Kind, Two Pair, One Pair, High Card
  - 조커 와일드카드 처리

### 상태 관리
- [x] `state/gameStore.ts` - Zustand 스토어 (게임 상태, 플레이어, 보스, 핸드, 선택 카드)

### 저장/로드
- [x] `storage/SaveManager.ts` - LocalStorage 기반 저장/로드 시스템

---

## 🚧 진행 중인 작업

- [ ] **UI 컴포넌트** (다음 단계)
  - Button, Card, HPBar, Modal, Tooltip 등
  - 메뉴 (MainMenu, StageSelect, SaveLoadMenu)
  - 전투 화면 (BattleField, DamagePopup)

---

## ⏳ 아직 할 작업

### Phase 2: 엔티티 및 데미지 로직
- [ ] 데미지 계산 함수 (크리티컬, 기본 공격)
- [ ] 상태이상 시스템 (Bleeding, Poison, Paralysis, Immune, Regen)
- [ ] 턴 시스템 진행 로직
- [ ] 스테이지별 특별 규칙 적용

### Phase 3: React 컴포넌트
- [ ] 기본 UI 컴포넌트 (Button, Input, Modal)
- [ ] 게임 화면 컴포넌트
  - BattleField (보스, 플레이어, HP바, 조건 아이콘)
  - CardHand (카드 렌더링, 선택)
  - DamagePopup (데미지 표시 애니메이션)
- [ ] 메뉴 컴포넌트
  - MainMenu (스테이지 선택, 설정, 종료)
  - StageSelect
  - SaveLoadMenu (슬롯 관리)
  - PauseMenu

### Phase 4: 리소스 및 미디어
- [ ] 이미지 자산 변환 (카드, 보스, 배경)
- [ ] 비디오 배경 (wilderness_background.mp4 → WebM)
- [ ] 오디오 시스템 (Web Audio API)

### Phase 5: 통합 및 최적화
- [ ] 캐싱 전략 (텍스처, 렌더링)
- [ ] 성능 프로파일링
- [ ] 반응형 디자인
- [ ] 크로스 브라우저 호환성

### Phase 6: 배포
- [ ] 빌드 및 번들링
- [ ] 호스팅 설정 (Vercel, Netlify 등)
- [ ] 테스트

---

## 📊 진행률

```
기초 인프라:        ████████████░░░░░░░░░░ 50%
타입 & 상수:       ████████████████░░░░░░░░ 65%
로직 & 저장소:      ███████████████░░░░░░░░░ 55%
UI 컴포넌트:       ░░░░░░░░░░░░░░░░░░░░░░░░ 0%
리소스 & 미디어:   ░░░░░░░░░░░░░░░░░░░░░░░░ 0%
통합 & 최적화:      ░░░░░░░░░░░░░░░░░░░░░░░░ 0%

전체:              ███████░░░░░░░░░░░░░░░░░░ 23%
```

---

## 🔗 주요 참고 파일

**Pygame 원본**
- [src/constants.py](../src/constants.py)
- [src/entities.py](../src/entities.py)
- [src/mechanics.py](../src/mechanics.py)
- [src/ui.py](../src/ui.py)
- [src/main.py](../src/main.py)

**문서**
- [docs/task.md](../docs/task.md)
- [docs/implementation_plan.md](../docs/implementation_plan.md)
- [docs/walkthrough.md](../docs/walkthrough.md)
- [JAVASCRIPT_PORT_GUIDE.md](../JAVASCRIPT_PORT_GUIDE.md)

---

## 🎯 다음 단계

### 즉시 (내일)
1. UI 컴포넌트 기초 구성 (Button, Card, HPBar)
2. BattleField 컴포넌트 스캐폴드
3. 데미지 계산 함수 구현

### 이후
4. 상태이상 시스템 완성
5. 메뉴 컴포넌트 구현
6. 이미지 자산 최적화 및 통합

---

**마지막 업데이트**: 2026-02-03 분석 및 초기 인프라 완성
