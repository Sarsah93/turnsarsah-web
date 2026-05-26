// constants/chapterRoutes.ts
// 챕터별 스테이지 라우트 그래프 정의

// ─── Types ────────────────────────────────────────────────────
export type NodeType = 'stage' | 'rest' | 'event' | 'entry' | 'exit';

export interface MapNode {
  id: string;              // 고유 ID (예: 's-1', 'rest-1', 'event-1', 'exit-desert')
  type: NodeType;          // 노드 유형
  label: string;           // KR 표시 이름
  labelEN: string;         // EN 표시 이름
  stageKey?: number;       // stages.ts의 스테이지 번호 매핑 (전투 노드만)
  x: number;               // 맵 이미지 위 X 좌표 (%)
  y: number;               // 맵 이미지 위 Y 좌표 (%)
  nextNodes: string[];     // 연결된 다음 노드 ID 배열
  forkGroup?: string;      // 갈림길 그룹 ID (같은 그룹의 nextNodes 중 하나만 선택)
  exitChapterId?: string;  // exit 노드일 때 연결되는 챕터 ID
  restHealPercent?: number;// 휴식처 회복 비율 (기본 0.3 = 30%)
}

export interface ChapterRoute {
  id: string;              // 챕터 ID ('1', '2A', '2B', '3A', '3B')
  name: string;            // 챕터 이름 KR
  nameEN: string;          // 챕터 이름 EN
  mapImage: string;        // 디테일 맵 이미지 경로
  bgm: string;             // 맵 화면 BGM
  startNodeId: string;     // 시작 노드 ID
  nodes: MapNode[];        // 모든 노드
}

export interface StageMapProgress {
  chapterId: string;               // 현재 챕터 ID
  completedNodes: string[];        // 완료된 노드 ID 목록
  currentNodeId: string;           // 현재 위치 노드 ID
  chosenForks: Record<string, string>; // forkGroup → 선택한 nextNode ID
}

// ─── Helper ────────────────────────────────────────────────────
export function getChapterRoute(chapterId: string): ChapterRoute | undefined {
  return CHAPTER_ROUTES[chapterId];
}

export function getNode(chapterId: string, nodeId: string): MapNode | undefined {
  const route = CHAPTER_ROUTES[chapterId];
  return route?.nodes.find(n => n.id === nodeId);
}

/** 현재 진행 상태에서 선택 가능한 다음 노드 ID 목록 반환 */
export function getAvailableNodes(progress: StageMapProgress): string[] {
  const route = CHAPTER_ROUTES[progress.chapterId];
  if (!route) return [];

  const currentNode = route.nodes.find(n => n.id === progress.currentNodeId);
  if (!currentNode) return [];

  // 현재 노드가 아직 완료되지 않았으면 현재 노드 자체가 available
  if (!progress.completedNodes.includes(progress.currentNodeId)) {
    return [progress.currentNodeId];
  }

  // 현재 노드가 완료된 경우 → nextNodes 중 접근 가능한 것들
  return currentNode.nextNodes.filter(nextId => {
    // 이미 완료된 노드는 제외
    if (progress.completedNodes.includes(nextId)) return false;

    // forkGroup 체크: 이 fork에서 이미 다른 선택을 했으면 제외
    if (currentNode.forkGroup) {
      const chosenId = progress.chosenForks[currentNode.forkGroup];
      if (chosenId && chosenId !== nextId) return false;
    }

    return true;
  });
}

/** 해당 노드가 dimming 처리되어야 하는지 (선택하지 않은 갈림길) */
export function isDimmedNode(progress: StageMapProgress, nodeId: string): boolean {
  const route = CHAPTER_ROUTES[progress.chapterId];
  if (!route) return false;

  // Fork에서 선택하지 않은 경로의 노드들을 추적
  for (const [forkGroup, chosenId] of Object.entries(progress.chosenForks)) {
    // 이 fork의 부모 노드를 찾기
    const parentNode = route.nodes.find(n => n.forkGroup === forkGroup);
    if (!parentNode) continue;

    // 선택하지 않은 nextNode에서 시작하는 경로상의 모든 노드를 dimmed 처리
    const unchosen = parentNode.nextNodes.filter(id => id !== chosenId);
    for (const unchosenId of unchosen) {
      if (nodeId === unchosenId) return true;
      // 해당 unchosen 노드에서 이어지는 경로도 dim (재귀적으로 따라감)
      if (isDescendantOf(route, unchosenId, nodeId, chosenId)) return true;
    }
  }

  return false;
}

/** targetNodeId가 fromNodeId의 하위 경로에 있는지 확인 (BFS) */
function isDescendantOf(
  route: ChapterRoute,
  fromNodeId: string,
  targetNodeId: string,
  excludeNodeId: string,
  visited: Set<string> = new Set()
): boolean {
  if (visited.has(fromNodeId)) return false;
  visited.add(fromNodeId);

  const node = route.nodes.find(n => n.id === fromNodeId);
  if (!node) return false;

  for (const nextId of node.nextNodes) {
    if (nextId === excludeNodeId) continue; // 선택된 경로는 제외
    if (nextId === targetNodeId) return true;
    if (isDescendantOf(route, nextId, targetNodeId, excludeNodeId, visited)) return true;
  }
  return false;
}

// ─── Chapter 1: 들판 (Meadow Field) ────────────────────────────
const MEADOW_ROUTE: ChapterRoute = {
  id: '1',
  name: '들판 지대',
  nameEN: 'Meadow Field',
  mapImage: '/assets/worldmap/meadow field_detail.png',
  bgm: '/assets/backgrounds/audio sounds/meadow field_background.mp3',
  startNodeId: 's-1',
  nodes: [
    // ── 직선 구간 (스테이지 1~3) ──
    { id: 's-1', type: 'stage', label: '스테이지 1', labelEN: 'Stage 1', stageKey: 1,
      x: 80, y: 8, nextNodes: ['s-2'] },
    { id: 's-2', type: 'stage', label: '스테이지 2', labelEN: 'Stage 2', stageKey: 2,
      x: 58, y: 6, nextNodes: ['s-3'] },
    { id: 's-3', type: 'stage', label: '스테이지 3', labelEN: 'Stage 3', stageKey: 3,
      x: 45, y: 5, nextNodes: ['s-4-1', 's-4-2'], forkGroup: 'fork-path' },

    // ── 좌측 경로 (4-1 루트) ──
    { id: 's-4-1', type: 'stage', label: '스테이지 4-1', labelEN: 'Stage 4-1', stageKey: 4,
      x: 27, y: 15, nextNodes: ['rest-1'] },
    { id: 'rest-1', type: 'rest', label: '휴식처 1', labelEN: 'Rest Area 1',
      x: 20, y: 30, nextNodes: ['s-5-1'], restHealPercent: 0.3 },
    { id: 's-5-1', type: 'stage', label: '스테이지 5-1', labelEN: 'Stage 5-1', stageKey: 7,
      x: 35, y: 36, nextNodes: ['s-6-1'] },
    { id: 's-6-1', type: 'stage', label: '스테이지 6-1', labelEN: 'Stage 6-1', stageKey: 5,
      x: 38, y: 53, nextNodes: ['s-7-1'] },
    { id: 's-7-1', type: 'stage', label: '스테이지 7-1', labelEN: 'Stage 7-1', stageKey: 10,
      x: 38, y: 70, nextNodes: ['event-1'] },

    // ── 우측 경로 (4-2 루트) ──
    { id: 's-4-2', type: 'stage', label: '스테이지 4-2', labelEN: 'Stage 4-2', stageKey: 6,
      x: 72, y: 15, nextNodes: ['rest-2'] },
    { id: 'rest-2', type: 'rest', label: '휴식처 2', labelEN: 'Rest Area 2',
      x: 80, y: 30, nextNodes: ['s-5-2'], restHealPercent: 0.3 },
    { id: 's-5-2', type: 'stage', label: '스테이지 5-2', labelEN: 'Stage 5-2', stageKey: 8,
      x: 65, y: 36, nextNodes: ['s-6-2'] },
    { id: 's-6-2', type: 'stage', label: '스테이지 6-2', labelEN: 'Stage 6-2', stageKey: 9,
      x: 68, y: 53, nextNodes: ['s-7-2'] },
    { id: 's-7-2', type: 'stage', label: '스테이지 7-2', labelEN: 'Stage 7-2', stageKey: 10,
      x: 68, y: 70, nextNodes: ['event-1'] },

    // ── 합류 + 이벤트 ──
    { id: 'event-1', type: 'event', label: '이벤트 스테이지', labelEN: 'Event Stage',
      x: 48, y: 83, nextNodes: ['exit-desert', 'exit-forest'], forkGroup: 'fork-exit' },

    // ── 출구 ──
    { id: 'exit-desert', type: 'exit', label: '사막 챕터로 연결', labelEN: 'To Desert',
      x: 33, y: 95, nextNodes: [], exitChapterId: '2A' },
    { id: 'exit-forest', type: 'exit', label: '깊은 숲 챕터로 연결', labelEN: 'To Deep Forest',
      x: 85, y: 95, nextNodes: [], exitChapterId: '2B' },
  ],
};

// ─── Chapter 2A: 사막 (Desert) ──────────────────────────────────
const DESERT_ROUTE: ChapterRoute = {
  id: '2A',
  name: '사막 지대',
  nameEN: 'Desert',
  mapImage: '/assets/worldmap/desert field_detail.png',
  bgm: '/assets/backgrounds/audio sounds/desert_background.mp3',
  startNodeId: 's-1',
  nodes: [
    // ── 입구 & 직선 ──
    { id: 's-1', type: 'stage', label: '스테이지 1', labelEN: 'Stage 1', stageKey: 1,
      x: 90, y: 45, nextNodes: ['s-2'] },
    { id: 's-2', type: 'stage', label: '스테이지 2', labelEN: 'Stage 2', stageKey: 2,
      x: 65, y: 12, nextNodes: ['s-3', 'rest-oasis'], forkGroup: 'fork-A' },

    // ── 상단 경로 (스테이지 3 루트) ──
    { id: 's-3', type: 'stage', label: '스테이지 3', labelEN: 'Stage 3', stageKey: 3,
      x: 58, y: 10, nextNodes: ['s-4-1'] },
    { id: 's-4-1', type: 'stage', label: '스테이지 4-1', labelEN: 'Stage 4-1', stageKey: 4,
      x: 32, y: 8, nextNodes: ['s-5-1'] },
    { id: 's-5-1', type: 'stage', label: '스테이지 5-1', labelEN: 'Stage 5-1', stageKey: 5,
      x: 20, y: 25, nextNodes: ['s-6-1'] },

    // ── 하단 경로 (오아시스 루트) ──
    { id: 'rest-oasis', type: 'rest', label: '오아시스 마을', labelEN: 'Oasis Village',
      x: 62, y: 25, nextNodes: ['s-5-2', 'event-camp'], forkGroup: 'fork-B', restHealPercent: 0.3 },
    { id: 'event-camp', type: 'event', label: '수상한 캠프', labelEN: 'Suspicious Camp',
      x: 78, y: 45, nextNodes: ['s-4-2'] },
    { id: 's-4-2', type: 'stage', label: '스테이지 4-2', labelEN: 'Stage 4-2', stageKey: 4,
      x: 80, y: 58, nextNodes: ['s-5-3', 'rest-temple'], forkGroup: 'fork-C' },
    { id: 's-5-3', type: 'stage', label: '스테이지 5-3', labelEN: 'Stage 5-3', stageKey: 7,
      x: 58, y: 78, nextNodes: ['event-main'] },
    { id: 'rest-temple', type: 'rest', label: '제단 휴식처', labelEN: 'Temple Rest Area',
      x: 60, y: 62, nextNodes: ['s-5-2'], restHealPercent: 0.3 },
    { id: 's-5-2', type: 'stage', label: '스테이지 5-2', labelEN: 'Stage 5-2', stageKey: 6,
      x: 52, y: 42, nextNodes: ['s-6-1'] },
    { id: 'event-main', type: 'event', label: '이벤트 스테이지', labelEN: 'Event Stage',
      x: 48, y: 82, nextNodes: ['s-6-2'] },
    { id: 's-6-1', type: 'stage', label: '스테이지 6-1', labelEN: 'Stage 6-1', stageKey: 8,
      x: 35, y: 40, nextNodes: ['s-7'] },
    { id: 's-6-2', type: 'stage', label: '스테이지 6-2', labelEN: 'Stage 6-2', stageKey: 8,
      x: 38, y: 72, nextNodes: ['s-7'] },

    // ── 합류 ──
    { id: 's-7', type: 'stage', label: '스테이지 7', labelEN: 'Stage 7', stageKey: 9,
      x: 30, y: 58, nextNodes: ['s-8'] },
    { id: 's-8', type: 'stage', label: '스테이지 8', labelEN: 'Stage 8', stageKey: 10,
      x: 12, y: 68, nextNodes: ['exit-cave'] },

    // ── 출구 ──
    { id: 'exit-cave', type: 'exit', label: '동굴 지대', labelEN: 'To Cave',
      x: 8, y: 50, nextNodes: [], exitChapterId: '3A' },
  ],
};

// ─── Chapter 2B: 깊은 숲 (Deep Forest) ──────────────────────────
const DEEP_FOREST_ROUTE: ChapterRoute = {
  id: '2B',
  name: '깊은 숲 지대',
  nameEN: 'Deep Forest',
  mapImage: '/assets/worldmap/deep forest_detail.png',
  bgm: '/assets/backgrounds/audio sounds/deep forest.mp3',
  startNodeId: 's-1',
  nodes: [
    // ── 입구 & 직선 ──
    { id: 's-1', type: 'stage', label: '스테이지 1', labelEN: 'Stage 1', stageKey: 1,
      x: 58, y: 82, nextNodes: ['s-2-1', 's-2-2'], forkGroup: 'fork-path' },

    // ── 좌측 경로 ──
    { id: 's-2-1', type: 'stage', label: '스테이지 2-1', labelEN: 'Stage 2-1', stageKey: 2,
      x: 38, y: 72, nextNodes: ['s-3-1'] },
    { id: 's-3-1', type: 'stage', label: '스테이지 3-1', labelEN: 'Stage 3-1', stageKey: 3,
      x: 30, y: 62, nextNodes: ['event-1'] },
    { id: 'event-1', type: 'event', label: '이벤트 스테이지 1', labelEN: 'Event Stage 1',
      x: 17, y: 58, nextNodes: ['s-4-1'] },
    { id: 's-4-1', type: 'stage', label: '스테이지 4-1', labelEN: 'Stage 4-1', stageKey: 4,
      x: 16, y: 42, nextNodes: ['s-5-1'] },
    { id: 's-5-1', type: 'stage', label: '스테이지 5-1', labelEN: 'Stage 5-1', stageKey: 6,
      x: 22, y: 28, nextNodes: ['rest-1'] },

    // ── 우측 경로 ──
    { id: 's-2-2', type: 'stage', label: '스테이지 2-2', labelEN: 'Stage 2-2', stageKey: 2,
      x: 68, y: 55, nextNodes: ['s-3-2'] },
    { id: 's-3-2', type: 'stage', label: '스테이지 3-2', labelEN: 'Stage 3-2', stageKey: 5,
      x: 65, y: 42, nextNodes: ['s-4-2'] },
    { id: 's-4-2', type: 'stage', label: '스테이지 4-2', labelEN: 'Stage 4-2', stageKey: 7,
      x: 68, y: 22, nextNodes: ['s-5-2'] },
    { id: 's-5-2', type: 'stage', label: '스테이지 5-2', labelEN: 'Stage 5-2', stageKey: 8,
      x: 55, y: 18, nextNodes: ['rest-2'] },

    // ── 휴식처 & 합류 ──
    { id: 'rest-1', type: 'rest', label: '휴식처 1', labelEN: 'Rest Area 1',
      x: 38, y: 12, nextNodes: ['s-6-1'], restHealPercent: 0.3 },
    { id: 'rest-2', type: 'rest', label: '휴식처 2', labelEN: 'Rest Area 2',
      x: 72, y: 32, nextNodes: ['event-2'], restHealPercent: 0.3 },
    { id: 'event-2', type: 'event', label: '이벤트 스테이지 2', labelEN: 'Event Stage 2',
      x: 90, y: 35, nextNodes: ['s-6-1'] },

    { id: 's-6-1', type: 'stage', label: '스테이지 6-1', labelEN: 'Stage 6-1', stageKey: 9,
      x: 40, y: 25, nextNodes: ['rest-mid'] },
    { id: 'rest-mid', type: 'rest', label: '휴식처', labelEN: 'Rest Area',
      x: 38, y: 48, nextNodes: ['s-7'], restHealPercent: 0.3 },
    { id: 's-7', type: 'stage', label: '스테이지 7', labelEN: 'Stage 7', stageKey: 10,
      x: 20, y: 12, nextNodes: ['exit-swamp'] },

    // ── 출구 ──
    { id: 'exit-swamp', type: 'exit', label: '늪 지대(다음 챕터)', labelEN: 'To Swamp',
      x: 5, y: 4, nextNodes: [], exitChapterId: '3B' },
  ],
};

// ─── Chapter 3A: 동굴 (Cave) ────────────────────────────────────
const CAVE_ROUTE: ChapterRoute = {
  id: '3A',
  name: '동굴 지대',
  nameEN: 'Cave',
  mapImage: '/assets/worldmap/cave_detail.png',
  bgm: '/assets/backgrounds/audio sounds/cave_background.mp3',
  startNodeId: 's-1',
  nodes: [
    // ── 직선 구간 ──
    { id: 's-1', type: 'stage', label: '스테이지 1', labelEN: 'Stage 1', stageKey: 1,
      x: 18, y: 62, nextNodes: ['s-2'] },
    { id: 's-2', type: 'stage', label: '스테이지 2', labelEN: 'Stage 2', stageKey: 2,
      x: 25, y: 55, nextNodes: ['s-3'] },
    { id: 's-3', type: 'stage', label: '스테이지 3', labelEN: 'Stage 3', stageKey: 3,
      x: 38, y: 52, nextNodes: ['s-4-1', 's-4-2'], forkGroup: 'fork-path' },

    // ── 상단 경로 ──
    { id: 's-4-1', type: 'stage', label: '스테이지 4-1', labelEN: 'Stage 4-1', stageKey: 4,
      x: 30, y: 22, nextNodes: ['event-1'] },
    { id: 'event-1', type: 'event', label: '이벤트 스테이지 1', labelEN: 'Event Stage 1',
      x: 42, y: 18, nextNodes: ['s-5-1'] },
    { id: 's-5-1', type: 'stage', label: '스테이지 5-1', labelEN: 'Stage 5-1', stageKey: 5,
      x: 55, y: 18, nextNodes: ['s-6-1'] },
    { id: 's-6-1', type: 'stage', label: '스테이지 6-1', labelEN: 'Stage 6-1', stageKey: 6,
      x: 68, y: 18, nextNodes: ['rest-1'] },
    { id: 'rest-1', type: 'rest', label: '휴식처 1', labelEN: 'Rest Area 1',
      x: 78, y: 12, nextNodes: ['s-7'], restHealPercent: 0.3 },

    // ── 하단 경로 ──
    { id: 's-4-2', type: 'stage', label: '스테이지 4-2', labelEN: 'Stage 4-2', stageKey: 4,
      x: 45, y: 65, nextNodes: ['s-5-2'] },
    { id: 's-5-2', type: 'stage', label: '스테이지 5-2', labelEN: 'Stage 5-2', stageKey: 5,
      x: 60, y: 65, nextNodes: ['rest-2'] },
    { id: 'rest-2', type: 'rest', label: '휴식처 2', labelEN: 'Rest Area 2',
      x: 65, y: 75, nextNodes: ['event-2'], restHealPercent: 0.3 },
    { id: 'event-2', type: 'event', label: '이벤트 스테이지 2', labelEN: 'Event Stage 2',
      x: 85, y: 68, nextNodes: ['s-6-2'] },
    { id: 's-6-2', type: 'stage', label: '스테이지 6-2', labelEN: 'Stage 6-2', stageKey: 9,
      x: 78, y: 82, nextNodes: ['s-7'] },

    // ── 합류 ──
    { id: 's-7', type: 'stage', label: '스테이지 7', labelEN: 'Stage 7', stageKey: 10,
      x: 90, y: 25, nextNodes: ['exit-lava'] },

    // ── 출구 ──
    { id: 'exit-lava', type: 'exit', label: '용암 지대(다음 챕터)', labelEN: 'To Lava Zone',
      x: 95, y: 5, nextNodes: [], exitChapterId: 'LAVA' },
  ],
};

// ─── Chapter 3B: 늪 (Swamp) ─────────────────────────────────────
const SWAMP_ROUTE: ChapterRoute = {
  id: '3B',
  name: '늪 지대',
  nameEN: 'Swamp',
  mapImage: '/assets/worldmap/swamp_detail.png',
  bgm: '/assets/backgrounds/audio sounds/swamp_background.mp3',
  startNodeId: 's-1',
  nodes: [
    // ── 직선 구간 ──
    { id: 's-1', type: 'stage', label: '스테이지 1', labelEN: 'Stage 1', stageKey: 1,
      x: 25, y: 14, nextNodes: ['s-2'] },
    { id: 's-2', type: 'stage', label: '스테이지 2', labelEN: 'Stage 2', stageKey: 2,
      x: 40, y: 14, nextNodes: ['s-3'] },
    { id: 's-3', type: 'stage', label: '스테이지 3', labelEN: 'Stage 3', stageKey: 3,
      x: 60, y: 14, nextNodes: ['rest-top', 's-4-2'], forkGroup: 'fork-path' },

    // ── 좌측 경로 ──
    { id: 'rest-top', type: 'rest', label: '휴식처', labelEN: 'Rest Area',
      x: 28, y: 22, nextNodes: ['s-4-1'], restHealPercent: 0.3 },
    { id: 's-4-1', type: 'stage', label: '스테이지 4-1', labelEN: 'Stage 4-1', stageKey: 4,
      x: 32, y: 38, nextNodes: ['event-1'] },
    { id: 'event-1', type: 'event', label: '이벤트 스테이지 1', labelEN: 'Event Stage 1',
      x: 22, y: 50, nextNodes: ['s-5-1'] },
    { id: 's-5-1', type: 'stage', label: '스테이지 5-1', labelEN: 'Stage 5-1', stageKey: 5,
      x: 30, y: 60, nextNodes: ['s-6-1'] },
    { id: 's-6-1', type: 'stage', label: '스테이지 6-1', labelEN: 'Stage 6-1', stageKey: 8,
      x: 28, y: 75, nextNodes: ['rest-1'] },
    { id: 'rest-1', type: 'rest', label: '휴식처 1', labelEN: 'Rest Area 1',
      x: 42, y: 80, nextNodes: ['s-7'], restHealPercent: 0.3 },

    // ── 우측 경로 ──
    { id: 's-4-2', type: 'stage', label: '스테이지 4-2', labelEN: 'Stage 4-2', stageKey: 7,
      x: 68, y: 22, nextNodes: ['s-5-2'] },
    { id: 's-5-2', type: 'stage', label: '스테이지 5-2', labelEN: 'Stage 5-2', stageKey: 6,
      x: 62, y: 42, nextNodes: ['rest-2'] },
    { id: 'rest-2', type: 'rest', label: '휴식처 2', labelEN: 'Rest Area 2',
      x: 62, y: 58, nextNodes: ['event-2'], restHealPercent: 0.3 },
    { id: 'event-2', type: 'event', label: '이벤트 스테이지 2', labelEN: 'Event Stage 2',
      x: 88, y: 50, nextNodes: ['s-6-2'] },
    { id: 's-6-2', type: 'stage', label: '스테이지 6-2', labelEN: 'Stage 6-2', stageKey: 9,
      x: 68, y: 75, nextNodes: ['s-7'] },

    // ── 합류 ──
    { id: 's-7', type: 'stage', label: '스테이지 7', labelEN: 'Stage 7', stageKey: 10,
      x: 52, y: 88, nextNodes: ['exit-mine'] },

    // ── 출구 ──
    { id: 'exit-mine', type: 'exit', label: '폐광(다음 챕터)', labelEN: 'To Abandoned Mine',
      x: 88, y: 88, nextNodes: [], exitChapterId: 'MINE' },
  ],
};

// ─── Registry ─────────────────────────────────────────────────
export const CHAPTER_ROUTES: Record<string, ChapterRoute> = {
  '1':  MEADOW_ROUTE,
  '2A': DESERT_ROUTE,
  '2B': DEEP_FOREST_ROUTE,
  '3A': CAVE_ROUTE,
  '3B': SWAMP_ROUTE,
};

/** 구현되지 않은 챕터 ID 목록 */
export const UNIMPLEMENTED_CHAPTERS = ['LAVA', 'MINE'];
