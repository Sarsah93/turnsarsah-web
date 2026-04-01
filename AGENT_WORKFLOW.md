# 🔄 Agent 작업 워크플로우 (Standard Operating Procedure)

이 문서는 이 프로젝트에서 AI Agent가 **다중 수정 요청**을 받았을 때, 일관된 품질과 결과를 보장하기 위해 반드시 따라야 하는 **작업 흐름 표준**입니다.

> **전제 조건**: 이 문서를 따르기 전에 반드시 `AGENT_GUIDELINES.md`의 Strict Rules를 먼저 준수해야 합니다.

---

## Phase 0: 사전 준비 (Standby)

### 필수 읽기 파일
작업 시작 전 아래 파일들을 **반드시** 순서대로 읽습니다:

| 순서 | 파일 | 목적 |
|------|------|------|
| 1 | `AGENT_GUIDELINES.md` | 작업 원칙 확인 |
| 2 | `README.md` | 프로젝트 개요, 기술 스택 파악 |
| 3 | `PORTING_STATUS.md` | 현재 구현 상태 확인 |
| 4 | 챕터별 SUMMARY 파일들 | 보스, 스테이지, 상태이상 정보 |
| 5 | `STATUS_EFFECTS.md` | 상태이상 체계 파악 |
| 6 | `developer_handoff.md` | 번역 키 사용법, 다국어 지원 |

### Git 상태 확인
```bash
git log -n 5 --oneline
```

---

## Phase 1: 요구사항 분석 및 코드 조사 (PLANNING)

### 1-1. 요구사항 목록화

사용자가 제시한 요청을 **번호가 매겨진 독립 항목**으로 정리합니다:

```markdown
# task.md 예시
## 1. [요구사항 제목]
- [ ] 관련 코드 조사
- [ ] 구현
- [ ] 검증
```

### 1-2. 코드 조사 (반드시 수정 전에 수행)

각 요구사항에 대해 아래 방법으로 **관련 코드를 전부** 파악합니다:

#### 조사 도구 활용 원칙

| 도구 | 사용 시점 |
|------|----------|
| `grep_search` | 특정 키워드/함수명/상수명으로 관련 파일 전체 탐색 |
| `view_file` | 발견된 파일의 실제 코드 확인 (수정 전 반드시) |
| `find_by_name` | 에셋 파일, 디렉토리 구조 확인 |
| `list_dir` | 폴더 내 파일 목록 확인 |

#### 조사 범위 체크리스트

```
✅ 수정 대상 파일의 현재 코드 전체 확인
✅ 해당 함수/컴포넌트를 호출하는 모든 위치 파악
✅ 관련 상수/타입 정의 파일 확인
✅ 관련 CSS/스타일 파일 확인
✅ 번역 키(translations.ts) 확인
✅ 에셋 파일 실제 존재 여부 확인 (이미지, 오디오 등)
✅ 게임 상태 관리(gameStore.ts) 관련 코드 확인
✅ 신규 상태 추가 시 **저장 및 불러오기(Save/Load) 지속성** 여부 확인
✅ 유저 피드백(UI/툴팁/테두리 등)의 명시적 표현 방법 확인
```

### 1-3. 조사 시 병렬 처리 원칙

- **독립적인 조사 작업은 병렬로** 실행하여 효율성을 높입니다.
- 예: 서로 다른 파일을 동시에 `view_file`, 서로 다른 키워드를 동시에 `grep_search`
- **종속 관계가 있는 조사는 순차적으로** 실행합니다.
- 예: grep 결과에서 발견된 파일을 view_file로 확인

---

## Phase 2: 구현 계획서 작성 및 승인 (PLANNING → 사용자 승인)

### 2-1. implementation_plan.md 작성

구현 계획서는 다음 형식을 **정확히** 따릅니다:

```markdown
# [작업 제목]

[작업 배경 및 목적 1~2줄]

## Proposed Changes

---

### [번호]. [요구사항 제목]

[현재 문제점에 대한 간결한 설명]

#### [MODIFY/NEW/DELETE] [파일명](file:///절대/경로)

**변경 내용 (line XX~YY):**

\```diff
-기존 코드
+수정 코드
\```

**설명:**
- 왜 이렇게 바꾸는지 핵심 이유 설명

---

## Verification Plan

### 검증 항목
1. TypeScript 빌드 에러 확인
2. 각 수정사항별 수동 테스트 시나리오
3. **저장/불러오기 후 상태 유지 여부** 테스트
4. UX/UI 피드백의 직관성(색상, 툴팁 등) 재평가
```

### 2-2. 핵심 원칙

- **파일별 변경 내용을 diff로 명확히** 제시
- **변경 라인 번호를 명시**하여 사용자가 위치를 바로 파악 가능
- **변경 이유**를 각 항목마다 설명
- 에셋/이미지 등 확인만 필요한 항목은 NOTE 블록으로 표시

### 2-3. 사용자 승인

```
반드시 notify_user를 통해 implementation_plan.md 리뷰를 요청합니다.
사용자 승인 전까지 코드 수정을 절대 시작하지 않습니다.
```

---

## Phase 3: 구현 (EXECUTION)

### 3-1. 수정 도구 선택 기준

| 상황 | 도구 |
|------|------|
| 한 파일에서 한 곳만 수정 | `replace_file_content` |
| 한 파일에서 여러 곳 수정 | `multi_replace_file_content` |
| 새 파일 생성 | `write_to_file` |
| **절대 사용 금지** | 파일 전체 덮어쓰기 |

### 3-2. 수정 순서

1. **독립적인 수정은 병렬로** 실행 (서로 다른 파일)
2. **같은 파일의 수정은 한 번에** 실행 (multi_replace)
3. **수정 후 task.md를 업데이트** (완료 항목 체크)

### 3-3. 수정 시 주의사항

- `TargetContent`는 현재 파일의 **정확한 문자열**을 사용
- 수정 전 `view_file`로 확인하지 않은 파일은 절대 수정하지 않음
- 줄 번호(StartLine/EndLine)를 `view_file` 결과와 일치시킴
- 한글 주석 유지, 기존 코드 스타일 일관성 유지

---

## Phase 4: 검증 (VERIFICATION)

### 4-1. 필수 검증 항목

#### A. TypeScript 빌드 검증 (필수)
```bash
node node_modules/typescript/bin/tsc --noEmit
```
- 에러 0건이어야 통과

#### B. 에셋 파일 검증 (이미지/오디오 관련 수정 시)
```javascript
// Node.js로 HTTP 상태 코드 확인
node -e "const http = require('http'); http.get('URL', res => console.log(res.statusCode));"
```

#### C. 개발 서버 실행 검증 (UI 수정 시)
```bash
node node_modules/vite/bin/vite.js --port 5173
```

### 4-2. 검증 결과 기록

검증 결과를 `walkthrough.md`에 다음 형식으로 기록합니다:

```markdown
# [작업 제목] Walkthrough

## 변경 사항 요약

### [번호]. [요구사항]
render_diffs(file:///절대/경로/파일명)
- 변경 핵심 내용 요약

---

## 검증

- ✅/❌ TypeScript 빌드
- ✅/❌ 에셋 로딩 테스트
- ✅/❌ 기능 테스트 결과
```

---

## Phase 5: 최종 보고 (사용자에게 전달)

### 보고 형식

`notify_user`를 통해 다음 내용을 **간결하게** 전달합니다:

```
1. 변경된 파일 목록 (파일명 + 변경 내용 한 줄 요약)
2. 검증 결과 (빌드, 테스트)
3. 주의사항 또는 추가 확인 필요 사항
```

### 금지 사항
- 코드 전체를 보고 메시지에 포함하지 않음
- 이미 walkthrough.md와 중복되는 상세 내용 반복하지 않음
- PathsToReview에 walkthrough.md를 포함하여 상세 내용은 파일로 전달

---

## 부록: 이 프로젝트 핵심 파일 맵

### 게임 로직
| 파일 | 역할 |
|------|------|
| `src/logic/useGameLoop.ts` | 전투 루프, 승리/패배 처리, 상태이상 해결 |
| `src/state/gameStore.ts` | Zustand 상태 관리 (게임 전체 상태) |
| `src/constants/gameConfig.ts` | 난이도, GameState, 상수 정의 |
| `src/constants/stages.ts` | 챕터별 스테이지 데이터 |
| `src/constants/translations.ts` | 한/영 번역 키 |
| `src/constants/guideData.ts` | 가이드 팝업 데이터 |
| `src/constants/altarSystem.ts` | 제단 스킬/전리품 데이터 |
| `src/logic/conditions.ts` | 상태이상 적용 로직 |

### 화면 컴포넌트
| 파일 | 역할 |
|------|------|
| `src/App.tsx` | 루트 — 게임 상태별 화면 렌더링 |
| `src/components/Battle/BattleScreen.tsx` | 전투 화면 (DEFEAT/VICTORY 텍스트 포함) |
| `src/components/Battle/BossDisplay.tsx` | 보스 정보 + 이미지 매핑 |
| `src/components/ChapterSelect.tsx` | 챕터 선택 화면 |
| `src/components/ChapterNextPopup.tsx` | 챕터 클리어 후 다음 챕터 팝업 |
| `src/components/ClearCongratulationsPopup.tsx` | 난이도 클리어 축하 팝업 |
| `src/components/GuidePopup.tsx` | 가이드 안내 팝업 |
| `src/components/GameOverScreen.tsx` | 게임 오버 화면 |

### 에셋 디렉토리
| 경로 | 내용 |
|------|------|
| `public/assets/boss_goblin/` | 챕터1 보스 이미지 |
| `public/assets/boss_desert/` | 챕터2A 보스 이미지 |
| `public/assets/boss_orc/` | 챕터2B 보스 이미지 |
| `public/assets/boss_cave/` | 챕터3A 보스 이미지 |
| `public/assets/boss_swamp/` | 챕터3B 보스 이미지 |

---

## 부록: 난이도별 챕터 진행 구조

```
쉬움(EASY):     챕터1 → 클리어 → 축하팝업 + 보통 해금 → 메인화면
보통(NORMAL):   챕터1 → 챕터2 선택(2A/2B) → 챕터3(3A/3B) → 클리어 → 어려움 해금
어려움(HARD):   보통과 동일 구조 → 클리어 → 지옥 해금
지옥(HELL):     보통과 동일 구조 → 클리어 → 최종 축하
```

---

**이 워크플로우를 따르면, 어떤 LLM이든 동일한 품질의 조사 → 계획 → 구현 → 검증 → 보고 결과를 생성할 수 있습니다.**
