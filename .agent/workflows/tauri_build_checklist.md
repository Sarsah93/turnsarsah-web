# TurnSarsah — Tauri Build 사전 처리 체크리스트

> 이 PC에서 처리 가능한 항목 우선 정렬 (Rust/빌드 환경 불필요한 것 먼저)

---

## 🔴 그룹 A — 이 PC에서 즉시 처리 가능 (코드/설정 변경)

### A-1. `window.close()` → Tauri API로 교체
**파일**: `src/components/MainMenu.tsx` L134
```tsx
// ❌ 현재: 웹 브라우저 전용, Tauri에서 동작 안 함
onYes={() => window.close()}

// ✅ 수정: Tauri 2.x API 사용
import { getCurrentWindow } from '@tauri-apps/api/window';
onYes={() => getCurrentWindow().close()}
```
Tauri WebView에서 `window.close()`는 **무시**됨. 게임의 종료 버튼이 동작하지 않는 명백한 버그.

---

### A-2. `vite.config.ts` — Tauri 공식 권고 설정 추가
**파일**: `vite.config.ts`
```ts
// ❌ 현재: Tauri 관련 설정 전혀 없음
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})

// ✅ 수정
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,   // 포트 충돌 시 다른 포트로 자동 변경 방지
    host: false,        // 외부 노출 차단 (보안)
  },
  envPrefix: ['VITE_', 'TAURI_ENV_'],  // Tauri 환경변수 노출 허용
  build: {
    // Tauri는 chromium 기반이므로 최신 타겟 지정 가능
    target: 'chrome105',
    minify: 'esbuild',
    sourcemap: false,   // 프로덕션에서 소스맵 제거
  },
})
```

---

### A-3. `tauri.conf.json` — CSP + 윈도우 설정 강화
**파일**: `src-tauri/tauri.conf.json`

현재 `"csp": null` → 프로덕션 빌드에서 Firebase 연결, 폰트 CDN 차단 위험.

```json
{
  "productName": "Turn Sarsah",
  "version": "0.1.0",
  "identifier": "com.turnsarsah.game",
  "build": {
    "beforeDevCommand": "npm run dev:steam",
    "beforeBuildCommand": "npm run build:steam",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self'"
    },
    "windows": [
      {
        "title": "Turn Sarsah",
        "width": 1600,
        "height": 900,
        "minWidth": 960,
        "minHeight": 540,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis"],
    "icon": [
      "icons/icon.ico",
      "icons/icon.png"
    ]
  }
}
```

---

### A-4. Google Fonts 번들링 (오프라인 대응)
**파일**: `index.html` L15-L19

현재 Google Fonts CDN에 의존 → 오프라인/방화벽 환경에서 폰트 깨짐.

이미 `BebasNeue-Regular.ttf`는 `/assets/fonts/`에 로컬 존재함 (App.css에서 이미 로드 중).  
**Press Start 2P**, **Roboto**는 CDN에만 있음.

```html
<!-- ❌ 제거: CDN 의존 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Press+Start+2P&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
```

조치:
- `BebasNeue`는 이미 로컬 → `App.css` `@font-face`로 완성됨, CDN 제거 가능
- `Press Start 2P`, `Roboto`는 폰트 파일을 `/assets/fonts/`에 추가하고 `App.css` `@font-face`로 로드해야 함
- 또는: 두 폰트의 실제 사용처를 확인해서 미사용이면 제거

---

### A-5. `fullscreenchange` 이벤트 리스너 버그
**파일**: `src/layouts/GameViewport/GameViewport.tsx` L59

```tsx
// ❌ 버그: cleanup에서 removeEventListener가 아닌 addEventListener 재호출
return () => document.addEventListener('fullscreenchange', handleFullscreenChange);

// ✅ 수정
return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
```
Tauri 앱에서 풀스크린 전환 시 이벤트 리스너가 누적되어 메모리 누수 발생.

---

### A-6. AudioManager — `new Audio()` Tauri 환경 경로 처리
**파일**: `src/utils/AudioManager.ts` L53-L56

`currentSrc.includes(targetSrc)` 비교 로직은 현재 `decodeURI(this.bgmAudio.src)`를 사용함.  
Tauri 프로덕션 환경에서는 `tauri://localhost/assets/...` 형태의 URL이 되므로, 상대 경로 `/assets/...`를 포함하는지 여부로 체크하는 현재 방식은 **정상 동작**함 — 그러나 오디오 경로에 한글이 포함된 경우 (예: `화상(burn).mp3`) 인코딩 충돌 가능.

실제 경로 예: `/assets/audio/conditions/화상(burn).mp3`  
→ Tauri WebView에서 `encodeURIComponent` 처리 없이 `new Audio(src)` 전달 시 일부 WebView2 버전에서 한글/특수문자 경로 404 발생 가능.

```ts
// ✅ 방어적 처리 추가
public static playSFX(src: string) {
    const audio = new Audio(encodeURI(src));  // 경로 인코딩 보장
    ...
}

public static playBGM(src: string) {
    ...
    this.bgmAudio = new Audio(encodeURI(src));
    ...
}
```

---

### A-7. 파일명 공백/한글 문자 포함 경로 전수조사
**영향 파일**: `App.tsx`, `audioMapper.ts`, `VideoBackground.tsx`

현재 아래 경로들이 공백/괄호/한글을 포함함:
```
/assets/backgrounds/audio sounds/medieval_music_openning.mp3
/assets/backgrounds/video/meadow field_background.mp4
/assets/backgrounds/video/deep forest.mp4
/assets/audio/conditions/화상(burn).mp3
/assets/audio/conditions/데미지 반사(Damage reflection).mp3
/assets/conditions/데미지 반동(Damage recoiling).png
```
Web(브라우저)에서는 자동 인코딩이 되지만, Tauri의 커스텀 프로토콜 + WebView2에서는  
**실제 파일시스템 경로와 URL 경로가 불일치**할 수 있음.

조치 (2가지 선택지):
1. **파일명 일괄 정리** — 공백/한글 → 영어/언더스코어로 변경 (+ 코드 내 경로 전부 업데이트)
2. **`encodeURI()` 래핑** — 코드에서 경로 전달 시 인코딩 처리

---

### A-8. `.env.steam` 파일 — Firebase 키 없음
**파일**: `.env.steam`

```
VITE_BUILD_TARGET=steam
VITE_ENABLE_PWA=false
VITE_INTERNAL_FEATURES=false
```
Firebase 관련 `VITE_FIREBASE_*` 환경변수가 없음. Steam 빌드에서 Firebase를 사용하지 않는다면 **firebase.ts가 초기화 실패**해서 앱이 크래시할 수 있음.

조치:
- Steam 빌드에서 Firebase를 사용하지 않는다면 → `firebase.ts`를 빌드타겟 조건부로 처리
- 사용한다면 → `.env.steam`에 Firebase 키 추가 (단, 앱 배포 시 키 노출 고려)

```ts
// firebase.ts 조건부 초기화 예시
import { IS_STEAM } from './utils/buildTarget';

export const db = IS_STEAM ? null : getFirestore(app);
export const auth = IS_STEAM ? null : getAuth(app);
```

---

### A-9. `manifest.json` — PWA 매니페스트 (Tauri에서 불필요)
**파일**: `public/manifest.json`, `index.html` L11

`index.html`에 `<link rel="manifest" href="/manifest.json">` 포함.  
Tauri 앱에서 PWA 매니페스트는 무해하지만, `.env.steam`에서 `VITE_ENABLE_PWA=false`임에도 항상 로드됨.  
→ 빌드 타겟에 따라 조건부로 삽입하거나 그냥 유지해도 무방 (치명적이지 않음).

---

## 🟠 그룹 B — 이 PC에서 처리 가능하나 주의 필요

### B-1. `localStorage` — Tauri에서의 지속성
**파일**: `src/utils/SaveManager.ts`, `AudioManager.ts`, `TitleManager.ts`

Tauri 2.x에서 `localStorage`는 `tauri://localhost` origin에 격리된 WebView2의 IndexedDB로 저장됨.  
→ 앱 재설치 시 유지되지 않을 수 있음 (Windows AppData 경로에 따라 다름).  
→ `tauri-plugin-store`를 사용하면 사용자 파일시스템에 안전하게 저장 가능.

**Steam 게임이라면**: 이 부분은 메인 PC에서 Rust 플러그인 추가가 필요해서 이 PC에서는 코드 구조만 준비.

---

## 🟡 그룹 C — 메인 PC(Tauri 빌드 환경)에서 처리

### C-1. `tauri-plugin-store` 추가 (Cargo.toml)
```toml
[dependencies]
tauri = { version = "2.5.0", features = [] }
tauri-plugin-store = "2"
```
+ `src-tauri/src/main.rs`에 플러그인 등록

### C-2. 아이콘 파일 완성도 확인
`src-tauri/icons/`에 `.ico`, `.png`만 있음.  
Tauri NSIS 패키저는 `.ico` 파일이 다양한 크기(16x16, 32x32, 48x48, 256x256)를 포함해야 정상 패키징됨.

### C-3. Rust 빌드 환경 체크 (WebView2 런타임)
NSIS/MSI 인스톨러에서 WebView2 런타임을 번들링할지 vs 다운로드하게 할지 설정:
```json
// tauri.conf.json
"bundle": {
  "windows": {
    "webviewInstallMode": { "type": "embedBootstrapper" }  // 또는 "offlineInstaller"
  }
}
```

---

## 📊 처리 우선순위 요약

| # | 항목 | 파일 | 심각도 | 이 PC 처리 가능 |
|---|------|------|--------|----------------|
| A-1 | `window.close()` → Tauri API | `MainMenu.tsx` | 🔴 크리티컬 | ✅ |
| A-5 | fullscreen 이벤트 리스너 버그 | `GameViewport.tsx` | 🔴 버그 | ✅ |
| A-2 | vite.config Tauri 최적화 | `vite.config.ts` | 🟠 중요 | ✅ |
| A-3 | CSP + 윈도우 설정 | `tauri.conf.json` | 🟠 중요 | ✅ |
| A-6 | 오디오 경로 encodeURI | `AudioManager.ts` | 🟠 중요 | ✅ |
| A-7 | 한글/공백 파일명 경로 | 다수 | 🟠 중요 | ✅ |
| A-8 | Firebase 조건부 초기화 | `firebase.ts` | 🟠 중요 | ✅ |
| A-4 | Google Fonts 번들링 | `index.html` | 🟡 권장 | ✅ |
| A-9 | PWA manifest 조건부 처리 | `index.html` | 🟢 낮음 | ✅ |
| B-1 | localStorage 지속성 구조화 | `SaveManager.ts` | 🟡 권장 | 부분 가능 |
| C-1 | tauri-plugin-store 추가 | `Cargo.toml` | 🟡 권장 | ❌ 메인 PC |
| C-2 | 아이콘 완성도 | `src-tauri/icons/` | 🟡 권장 | ❌ 메인 PC |
| C-3 | WebView2 런타임 번들 설정 | `tauri.conf.json` | 🟡 권장 | ❌ 메인 PC |

---

## 이전에 파악한 6개 항목과의 관계

기존 6개 → 위 목록으로 세분화/보강됨:
- CSP → **A-3** (세부 내용 확장)
- Google Fonts → **A-4**
- localStorage → **B-1 + C-1**
- Firebase Auth → **A-8** (조건부 초기화로 구체화)
- vite.config → **A-2**
- 윈도우 설정 → **A-3** (CSP와 통합)

**추가로 발견된 신규 항목**: A-1, A-5, A-6, A-7, A-9, C-2, C-3
