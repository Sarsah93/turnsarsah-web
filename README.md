# 턴살사 (TurnSarsah) - 웹 버전 v3.5.0

포커와 턴제 배틀의 결합, 턴살사(TurnSarsah)에 오신 것을 환영합니다!  
이 저장소는 기존 C# 기반 게임의 고퀄리티 웹 포팅 프로젝트로, 현대적인 웹 기술을 사용하여 프리미엄 게이밍 경험을 제공합니다.

## ✨ 주요 특징

- **⚔️ 전략적 전투 시스템**:
    - [x] 정교한 카드 콤보 평가 알고리즘 (High Card ~ Royal Flush)
    - [x] K-A-2 Wrap-around Straight 및 조커 와일드카드 구현
    - [x] 출혈(Bleed), 중독(Poison), 마비(Paralysis) 등 15종 이상의 상태 이상 시스템
    - [x] 보스 스테이지별 특수 규칙 (Blind, Ban, Puzzle 등)

- **🎬 시네마틱 애니메이션**:
    - [x] **원페어 춤 (One Pair Dance)**: 8개의 독립적인 3D 궤적을 통한 화려한 연타 공격
    - [x] **투페어 태극 (Two Pair Taeguek)**: 음양의 조화를 형상화한 S-커브 궤적 및 폭발 효과
    - [x] **Leaf-Flutter 시스템**: 카드가 나뭇잎처럼 흩날리는 역동적인 3D GATHERING 효과

- **🎨 프리미엄 UI/UX**:
    - [x] **다이나믹 로딩 화면**: 맵 종류별 5종의 고화질 배경 랜덤 노출 및 실시간 팁 시스템
    - [x] **세련된 로딩 게이지**: 텍스트 가공 처리 및 애니메이션 쉬머(Shimmer) 효과가 적용된 하단 고정형 레이아웃
    - [x] **3D 카드 핸드**: 원근감이 살아있는 카드 배치 및 부드러운 호버 이펙트

- **🚀 시스템 최적화**:
    - [x] **Asset Preload Manager**: 대용량 에셋(이미지, SFX, 비디오)의 선제적 캐싱으로 끊김 없는 플레이 보장
    - [x] **진행 단계 기반 최적화**: 로딩 바 두께, 글자 크기, 이펙트 클리핑 등 사용자 피드백 기반 미세 조정 완료

## 🛠 기술 스택

- **Core**: React 18, TypeScript
- **State Management**: Zustand (전투 로직 및 게임 상태)
- **Styling**: Vanilla CSS (최대 성능 및 커스텀 애니메이션 제어)
- **Build Tool**: Vite (빠른 HMR 및 최적화된 빌드)
- **Assets**: 3D Trajectory Math, CSS Keyframe Animations

## 🕹 실행 방법

### 개발 모드 실행
```bash
npm install
npm run dev
```

### 정적 빌드 및 배포
```bash
npm run build
npm run preview
```

## 📖 참고 문서
- [PORTING_STATUS.md](PORTING_STATUS.md): 개발 진행 현황 및 상세 포팅 리포트
- [INSTRUCTION FOR USE.md](INSTRUCTION%20FOR%20USE.md): 게임 조작법 및 규칙 가이드
- [.agent/workflows/](.agent/workflows/): 보스 에셋 매핑 등 특수 작업 가이드

---
*Developed with focus on Premium Aesthetics and Dynamic Gameplay.*
