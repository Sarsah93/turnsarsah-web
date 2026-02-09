# 턴살사 (TurnSarsah) - 웹 버전 v2.0.0.7

포커와 턴제 배틀의 결합, 턴살사(TurnSarsah)에 오신 것을 환영합니다!
이 저장소는 기존 C# 기반 게임의 고퀄리티 웹 포팅 프로젝트입니다.

## 주요 특징
- **작업 내용**:
    - [x] 카드 콤보 평가 알고리즘 (High Card ~ Royal Flush)
    - [x] 조커(Joker) 와일드카드 및 우선순위 수정
    - [x] K-A-2 Wrap-around Straight 구현
    - [x] 데미지 계산 및 보너스 시스템 최적화
    - [x] 크리티컬 히트 및 상태 이상 정비
    - [x] 스테이지별 보스 특수 규칙 (Blind, Ban 등)
- **진행률**: 100% (UI 및 전투 로직 최적화 완료)
출혈(Bleed), 중독(Poison), 마비(Paralysis) 등 전략적인 요소가 포함되어 있습니다.
- **반응형 UI**: 웹 브라우저에서 최적화된 게임 UI를 제공합니다.

## 기술 스택
- **프레임워크**: React 18
- **빌드 도구**: Vite
- **언어**: TypeScript
- **상태 관리**: Zustand
- **스타일링**: Vanilla CSS

## 실행 방법

### 개발 모드 실행
```bash
npm install
npm run dev
```

### 정적 빌드
```bash
npm run build
npm run preview
```

## 참고 문서
- [PORTING_STATUS.md](file:///c:/Users/voinosis-pc/Desktop/project%20TurnSarsah/turnsarsah-web/PORTING_STATUS.md): 개발 진행 현황 및 상세 포팅 리포트
- [INSTRUCTION FOR USE.md](file:///c:/Users/voinosis-pc/Desktop/project%20TurnSarsah/turnsarsah-web/INSTRUCTION%20FOR%20USE.md): 게임 조작법 및 규칙 가이드
