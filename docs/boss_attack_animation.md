# 보스 공격 애니메이션 (스프라이트 시트) 구현 가이드

> 마지막 업데이트: 2026-04-15 (v2 — 모바일 WebKit 버그 수정)
> 적용 완료: 챕터1 (스테이지 1~10)

---

## 개요

보스가 공격할 때(`animState === 'ATTACK'`) 기존의 단순 이미지 이동 연출(아래로 내려갔다 올라오는 `thrust-down`) 대신,
**3×3 스프라이트 시트(9 프레임)** 를 재생하는 방식으로 교체한다.

스프라이트 시트는 챕터별·보스별로 별도 준비하며, 적용 챕터와 스테이지 범위를 제한한다.

---

## 에셋 규칙

### 정지 이미지 (기존)
- 위치: `public/assets/boss_<챕터명>/`
- 파일명: `<스테이지번호(2자리)>_<보스이름>.png`
- 예: `public/assets/boss_goblin/01_goblin.png`

### 스프라이트 시트 (공격 애니메이션)
- 위치: 정지 이미지와 동일한 폴더
- 파일명: `<스테이지번호(2자리)>_<보스이름>_transparent.png`
- 예: `public/assets/boss_goblin/01_goblin_transparent.png`
- 스펙: **3열 × 3행, 총 9프레임**, 배경 투명 PNG

> ⚠️ 파일명의 공백은 유지한다. URL 인코딩 불필요 (React 빌드가 자동 처리).

---

## 구현 작업 순서

### STEP 1. 스프라이트 경로 반환 함수 추가 (`bossImageMapper.ts`)

**파일**: `src/utils/bossImageMapper.ts`

기존 `getBossImage()` 함수 아래에 `getBossAttackSprite()` 함수를 추가한다.

```typescript
/**
 * 해당 챕터·스테이지 전용 보스 공격 애니메이션 스프라이트 시트 경로 반환.
 * 스프라이트가 없는 챕터/스테이지는 null 반환.
 */
export const getBossAttackSprite = (chapter: string, stage: number): string | null => {
    if (chapter !== '1') return null; // ← 챕터 추가 시 이 조건을 확장
    const mapping: Record<number, string> = {
        1:  '01_goblin_transparent.png',
        2:  '02_goblin skirmisher_transparent.png',
        3:  '03_goblin rider_transparent.png',
        4:  '04_hobgoblin_transparent.png',
        5:  '05_goblin shaman_transparent.png',
        6:  '06_golden goblin_transparent.png',
        7:  '07_elite goblin_transparent.png',
        8:  '08_troll_transparent.png',
        9:  '09_giant goblin_transparent.png',
        10: '10_goblin lord_transparent.png',
    };
    const filename = mapping[stage];
    if (!filename) return null;
    return `/assets/boss_goblin/${filename}`; // ← 챕터별 폴더명 변경 필요
};
```

**새 챕터 추가 시 체크리스트**:
- `chapter !== '1'` 조건을 `chapter !== '1' && chapter !== '2A'` 형태로 확장
- `mapping` 과 `return` 경로(`/assets/boss_<챕터폴더>/`)를 챕터별로 분기

---

### STEP 2. CSS 키프레임 및 클래스 추가/수정 (`BattleField.css`)

**파일**: `src/components/styles/BattleField.css`

#### 2-1. `thrust-down` 제거

아래 블록을 **삭제**한다:

```css
/* 삭제 대상 */
@keyframes thrust-down {
  0%   { transform: translateX(-50%) translateY(0); }
  30%  { transform: translateX(-50%) translateY(100px); }
  100% { transform: translateX(-50%) translateY(0); }
}

.animate-thrust-down {
  animation: thrust-down 0.4s ease-out;
}
```

#### 2-2. 스프라이트 시트 CSS 추가

파일 하단에 추가한다:

```css
/* 모바일 Safari 호환을 위해 @-webkit-keyframes도 함께 선언 */
@-webkit-keyframes ch1-boss-attack {
  0%     { background-position: 0%   0%; }
  11.11% { background-position: 50%  0%; }
  22.22% { background-position: 100% 0%; }
  33.33% { background-position: 0%   50%; }
  44.44% { background-position: 50%  50%; }
  55.55% { background-position: 100% 50%; }
  66.66% { background-position: 0%   100%; }
  77.77% { background-position: 50%  100%; }
  88.88% { background-position: 100% 100%; }
  100%   { background-position: 100% 100%; }
}
@keyframes ch1-boss-attack {
  0%     { background-position: 0%   0%; }
  11.11% { background-position: 50%  0%; }
  22.22% { background-position: 100% 0%; }
  33.33% { background-position: 0%   50%; }
  44.44% { background-position: 50%  50%; }
  55.55% { background-position: 100% 50%; }
  66.66% { background-position: 0%   100%; }
  77.77% { background-position: 50%  100%; }
  88.88% { background-position: 100% 100%; }
  100%   { background-position: 100% 100%; }
}

.boss-sprite-attack {
  background-repeat: no-repeat;
  background-size: 300% 300%; /* 3×3 그리드 */
  background-position: 0% 0%;
  -webkit-animation: ch1-boss-attack 0.6s steps(1, end) forwards; /* iOS Safari */
  animation: ch1-boss-attack 0.6s steps(1, end) forwards;
  image-rendering: auto;
  will-change: background-position; /* GPU 레이어 사전 턨트 */

  /*
   * ⚠️ clip-path 미사용 이유:
   * CSS animation이 적용된 요소에 clip-path를 함께 쓰면
   * 모바일 WebKit(iOS Safari)에서 GPU compositing 실패로 인해
   * 요소가 완전히 투명하게 렌더링되는 버그가 발생한다.
   * 검정 테두리 시 PNG 재생성(투명 배경)으로 해결할 것.
   */
}
```

> ℹ️ 다른 챕터의 스프라이트를 추가할 경우, `@keyframes`와 클래스명에 챕터 접두사를 붙인다.
> 예: `@keyframes ch2a-boss-attack`, `.boss-sprite-attack-ch2a`

---

### STEP 3. 렌더링 로직 교체 (`BossDisplay.tsx`)

**파일**: `src/components/Battle/BossDisplay.tsx`

#### 3-1. import 추가

```tsx
import React, { useRef } from 'react';
import { getBossImage, getBossAttackSprite } from '../../utils/bossImageMapper';
```

#### 3-2. 공격 상태 변수 및 key 관리

컴포넌트 함수 내부, 기존 `const bossImg = ...` 아래에 추가:

```tsx
const attackSprite = getBossAttackSprite(chapterNum, stageNum);
const isAttacking = bot.animState === 'ATTACK' && attackSprite !== null;

// 연속 공격(triple attack 등) 시 스프라이트 재시작을 위한 key 카운터
const attackKeyRef = useRef(0);
const prevAnimState = useRef<string | undefined>(undefined);
if (bot.animState === 'ATTACK' && prevAnimState.current !== 'ATTACK') {
    attackKeyRef.current += 1;
}
prevAnimState.current = bot.animState;

// 스테이지별 스프라이트 크기 보정 (이미지 자체 크기가 다른 경우)
const spriteScaleOverride: React.CSSProperties =
    chapterNum === '1' && stageNum === 2
        ? { transform: 'scale(0.8)', transformOrigin: 'center center' }
        : chapterNum === '1' && stageNum === 10
        ? { transform: 'scale(1.2)', transformOrigin: 'center center' }
        : {};
```

#### 3-3. JSX — `animate-thrust-down` 제거

```tsx
// 수정 전
<div className={`boss-avatar-wrapper ${bot.animState === 'ATTACK' ? 'animate-thrust-down' : ...}`}>

// 수정 후
<div className={`boss-avatar-wrapper ${bot.animState === 'HIT' ? 'animate-hit-shake' : ''} ${bossWeakClass}`}>
```

#### 3-4. JSX — 이미지/스프라이트 조건부 렌더

```tsx
{/* 챕터1 ATTACK: 스프라이트 시트 div */}
{isAttacking && (
    <div
        key={attackKeyRef.current}
        className="boss-sprite-attack"
        style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('${attackSprite}')`,
            ...spriteScaleOverride, // 개별 스케일 보정 적용
        }}
    />
)}

{/* 정지 이미지: ATTACK 중에는 숨김 */}
{!isAttacking && (
    <img
        src={bossImg}
        alt={bot.name}
        style={{
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            // ... holeMask 스타일 유지
        }}
    />
)}
```

---

## 챕터별 적용 현황

| 챕터 | 스테이지 범위 | 에셋 폴더 | 스프라이트 적용 | 비고 |
|------|--------------|-----------|----------------|------|
| 1 | 1~10 | `boss_goblin` | ✅ 완료 | |
| 2A | 1~11 | `boss_desert` | ❌ 미적용 | |
| 2B | 1~11 | `boss_orc` | ❌ 미적용 | |
| 3A | 1~10 | `boss_cave` | ❌ 미적용 | |
| 3B | 1~10 | `boss_swamp` | ❌ 미적용 | |

---

## 새 챕터 적용 체크리스트

- [ ] `public/assets/boss_<챕터폴더>/` 에 `*_transparent.png` 스프라이트 시트 추가
- [ ] `bossImageMapper.ts` — `getBossAttackSprite()` 내 챕터 조건 분기 추가
- [ ] `BattleField.css` — 필요 시 챕터 전용 `@keyframes` 및 클래스 추가  
  (3×3 9프레임이라면 동일 CSS 재사용 가능)
- [ ] `BossDisplay.tsx` — `getBossAttackSprite()`가 `null`이 아닌 경우 자동 적용됨  
  (CSS 클래스명이 달라지면 `className` 조건 수정 필요)
- [ ] 타입스크립트 컴파일 확인: `node node_modules/typescript/bin/tsc --noEmit`

---

## 타이밍 참고

- 보스 `animState === 'ATTACK'` 지속 시간: 약 **600ms** (`wait(200)` + `wait(400)`)
- 스프라이트 재생 시간: `0.6s` — 게임 루프와 동기화됨
- 연속 공격 시: `ATTACK → NONE → ATTACK` 전환 시마다 `attackKeyRef` 증가 → 재시작 보장

---

## 트러블슈팅

### 모바일에서 스프라이트가 투명/안보임

**원인**: `clip-path` + CSS `animation`의 조합이 iOS Safari / Android WebKit에서
 GPU compositing 실패를 유발해 요소가 투명하게 렌더링됩니다.

**해결책**:
1. `.boss-sprite-attack`에서 `clip-path` 종류 삭제
2. `-webkit-animation` 및 `@-webkit-keyframes` 접두사 추가
3. `will-change: background-position` 추가

```css
/* 트러블: clip-path 제거 후 항상 -webkit- 접두사와 will-change 함께 사용 */
.boss-sprite-attack {
  -webkit-animation: ch1-boss-attack 0.6s steps(1, end) forwards;
  animation: ch1-boss-attack 0.6s steps(1, end) forwards;
  will-change: background-position;
  /* clip-path: inset(4px); ← 모바일에서 투명 현상 유발하므로 사용 금지 */
}
```

> ⚠️ 검정 테두리가 다시 보인다면, 이는 PNG 자체의 외곽 쾔버스가 검정으로 저장된 것입니다.
> 근본 수정은 스프라이트 시트 PNG를 **투명 배경**으로 재생성하는 것입니다.
