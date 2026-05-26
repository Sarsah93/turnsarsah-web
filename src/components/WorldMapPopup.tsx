import React, { useRef, useState, useCallback, useEffect } from 'react';
import './styles/WorldMapPopup.css';
import { useGameStore } from '../state/gameStore';
import { GameState } from '../constants/gameConfig';

interface WorldMapPopupProps {
  currentChapter: string; // '1', '2A', '2B', '3A', '3B'
  onClose: () => void;
  onOpenStageMap?: () => void;
}

interface SectorDef {
  id: string;
  label: string;
  implemented: boolean;
  labelX: number;
  labelY: number;
  pinX: number;
  pinY: number;
  svgPath: string;
}

// =====================================================================
// SVG 구역 정의 (viewBox: 0 0 1024 682)
// 디버그 오버레이로 직접 추적한 실제 좌표 기반
// =====================================================================
const SECTORS: SectorDef[] = [
  // ── 챕터 1: 들판
  {
    id: '1',
    label: '들판',
    implemented: true,
    labelX: 888, labelY: 205,
    pinX:   888, pinY:   168,
    svgPath: `M 1007 74 L 955 68 L 931 81 L 909 97 L 861 119 L 813 133
      L 838 167 L 780 167 L 739 156 L 691 177 L 706 190 L 658 210
      L 658 227 L 693 233 L 702 246 L 713 255 L 735 257 L 712 265
      L 697 272 L 696 279 L 694 286 L 673 291 L 668 299 L 670 311
      L 650 320 L 637 333 L 636 359 L 665 373 L 683 387 L 718 392
      L 757 385 L 787 374 L 800 368 L 818 362 L 842 351 L 859 346
      L 879 340 L 903 335 L 918 328 L 909 316 L 915 294 L 941 284
      L 958 283 L 993 282 L 996 268 L 963 261 L 951 255 L 961 238
      L 1003 234 L 1010 233 L 1015 232 L 1020 225 L 1020 77 L 1009 76 Z`,
  },

  // ── 챕터 2A: 사막
  {
    id: '2A',
    label: '사막',
    implemented: true,
    labelX: 497, labelY: 203,
    pinX:   497, pinY:   168,
    svgPath: `M 369 48 L 452 49 L 476 38 L 497 48 L 555 55 L 560 70
      L 586 70 L 588 91 L 568 105 L 601 117 L 634 122 L 649 141
      L 669 160 L 674 170 L 645 202 L 635 219 L 654 233 L 687 245
      L 707 259 L 685 277 L 671 288 L 644 311 L 624 320 L 597 333
      L 588 340 L 605 363 L 580 380 L 567 388 L 544 387 L 517 374
      L 493 357 L 482 342 L 463 326 L 438 320 L 426 319 L 421 306
      L 408 296 L 392 286 L 365 277 L 355 263 L 322 257 L 290 255
      L 276 248 L 265 238 L 245 227 L 232 220 L 216 213 L 212 190
      L 232 160 L 269 140 L 306 133 L 325 129 L 355 122 L 382 113
      L 400 106 L 392 96 L 369 87 L 361 78 L 365 57 L 371 49 L 372 43 Z`,
  },

  // ── 챕터 3A: 동굴
  {
    id: '3A',
    label: '동굴',
    implemented: true,
    labelX: 63,  labelY: 232,
    pinX:   63,  pinY:   197,
    svgPath: `M 11 199 L 43 181 L 85 185 L 119 198 L 155 199 L 166 225
      L 204 234 L 242 243 L 263 259 L 301 262 L 313 272 L 286 283
      L 256 284 L 228 288 L 204 299 L 171 302 L 154 313 L 119 319
      L 83 323 L 83 297 L 56 299 L 30 291 L 41 285 L 24 280
      L 6 272 L 4 203 Z`,
  },

  // ── 챕터 2B: 깊은 숲
  {
    id: '2B',
    label: '깊은 숲',
    implemented: true,
    labelX: 923, labelY: 485,
    pinX:   923, pinY:   450,
    svgPath: `M 1017 286 L 967 291 L 916 306 L 926 329 L 887 339 L 900 353
      L 842 354 L 830 369 L 803 387 L 822 403 L 789 405 L 764 436
      L 772 469 L 808 474 L 782 494 L 801 505 L 806 509 L 790 520
      L 794 531 L 797 540 L 789 545 L 797 563 L 816 577 L 801 592
      L 800 606 L 813 617 L 852 649 L 859 650 L 891 655 L 914 662
      L 922 663 L 962 662 L 986 660 L 1000 657 L 1010 649 L 1018 644
      L 1021 640 L 1020 286 Z`,
  },

  // ── 챕터 3B: 늪지대
  {
    id: '3B',
    label: '늪지대',
    implemented: true,
    labelX: 559, labelY: 633,
    pinX:   559, pinY:   598,
    svgPath: `M 409 563 L 471 553 L 527 530 L 541 549 L 584 548 L 600 562
      L 627 557 L 647 568 L 679 566 L 709 580 L 739 591 L 751 563
      L 780 576 L 770 611 L 790 631 L 757 656 L 704 673 L 655 680
      L 576 674 L 514 662 L 451 660 L 398 645 L 392 625 L 396 600
      L 423 588 L 408 563 Z`,
  },

  // ── 미구현: 흰 산 (설산)
  {
    id: 'unimpl-snowpeak',
    label: '???',
    implemented: false,
    labelX: 742, labelY: 97,
    pinX:   742, pinY:   70,
    svgPath: `M 649 2 L 539 51 L 585 78 L 575 104 L 603 107 L 626 113
      L 641 117 L 647 123 L 669 130 L 685 124 L 687 145 L 688 148
      L 712 156 L 729 157 L 747 157 L 766 151 L 773 142 L 783 119
      L 795 106 L 818 104 L 834 106 L 858 112 L 878 112 L 893 102
      L 928 94 L 934 94 L 943 87 L 949 79 L 956 73 L 951 60 L 924 49
      L 896 48 L 885 41 L 875 30 L 865 21 L 847 24 L 838 27 L 827 19
      L 820 9 L 820 8 L 818 7 L 817 3 L 650 3 Z`,
  },

  // ── 미구현: 유적지 (좌상단 성채)
  {
    id: 'unimpl-castle',
    label: '???',
    implemented: false,
    labelX: 110, labelY: 90,
    pinX:   110, pinY:   65,
    svgPath: `M 313 1 L 327 38 L 351 49 L 344 77 L 322 73 L 307 93
      L 290 94 L 272 112 L 258 116 L 231 112 L 220 124 L 210 145
      L 208 157 L 180 170 L 171 176 L 151 180 L 123 170 L 104 170
      L 64 165 L 40 168 L 24 165 L 11 162 L 6 162 L 3 160 L 1 160
      L 3 3 Z`,
  },

  // ── 미구현: 빙하
  {
    id: 'unimpl-ice',
    label: '???',
    implemented: false,
    labelX: 65,  labelY: 412,
    pinX:   65,  pinY:   382,
    svgPath: `M 4 301 L 42 301 L 72 328 L 94 320 L 131 364 L 158 368
      L 189 383 L 219 398 L 241 422 L 248 443 L 211 463 L 178 471
      L 146 484 L 91 475 L 65 479 L 29 475 L 1 460 L 4 302 Z`,
  },

  // ── 미구현: 어둠 (좌하단 암흑 지역)
  {
    id: 'unimpl-dark',
    label: '???',
    implemented: false,
    labelX: 61,  labelY: 577,
    pinX:   61,  pinY:   548,
    svgPath: `M 3 463 L 52 495 L 110 513 L 159 532 L 173 679 L 4 678 Z`,
  },

  // ── 미구현: 폐광
  {
    id: 'unimpl-mine',
    label: '???',
    implemented: false,
    labelX: 243, labelY: 570,
    pinX:   243, pinY:   540,
    svgPath: `M 214 483 L 314 471 L 354 507 L 337 517 L 361 530 L 397 554
      L 414 572 L 408 588 L 376 597 L 376 621 L 358 628 L 370 652
      L 348 672 L 306 678 L 176 678 L 165 565 L 205 534 L 216 482 Z`,
  },

  // ── 미구현: 해상도시
  {
    id: 'unimpl-seacity',
    label: '???',
    implemented: false,
    labelX: 326, labelY: 379,
    pinX:   326, pinY:   349,
    svgPath: `M 329 267 L 252 289 L 202 311 L 142 323 L 138 348 L 165 373
      L 192 389 L 224 383 L 242 396 L 266 383 L 261 376 L 282 369
      L 289 388 L 308 410 L 329 421 L 363 416 L 399 393 L 447 388
      L 489 388 L 505 374 L 487 349 L 478 340 L 449 329 L 423 325
      L 412 324 L 394 308 L 393 305 L 388 294 L 378 293 L 372 286
      L 362 277 L 351 270 L 342 267 L 322 266 Z`,
  },

  // ── 미구현: 용암 지대
  {
    id: 'unimpl-volcano',
    label: '???',
    implemented: false,
    labelX: 532, labelY: 495,
    pinX:   532, pinY:   465,
    svgPath: `M 299 444 L 316 432 L 336 437 L 375 416 L 416 408 L 445 404
      L 475 385 L 504 402 L 531 403 L 556 412 L 582 408 L 605 404
      L 629 397 L 654 391 L 672 400 L 685 420 L 707 426 L 736 420
      L 757 432 L 760 437 L 756 466 L 734 473 L 757 486 L 776 494
      L 780 507 L 792 534 L 784 543 L 779 559 L 760 568 L 737 568
      L 721 566 L 690 564 L 652 563 L 628 555 L 614 551 L 597 541
      L 575 538 L 558 552 L 542 553 L 536 535 L 531 531 L 503 530
      L 494 542 L 464 547 L 438 545 L 405 543 L 381 541 L 357 528
      L 351 519 L 348 506 L 327 483 L 313 479 L 306 474 L 309 461
      L 303 452 L 299 451 L 296 446 Z`,
  },
];

const SVG_W = 1024;
const SVG_H = 682;

// =====================================================================
// 디버그 오버레이 (DEV 전용)
// 클릭 → 점 추가 / Z → 닫기 / Backspace → 취소 / Esc → 초기화
// =====================================================================
interface DebugPoint { x: number; y: number; }

const MapDebugOverlay: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
  const [mouse, setMouse] = useState<DebugPoint>({ x: 0, y: 0 });
  const [points, setPoints] = useState<DebugPoint[]>([]);
  const [closed, setClosed] = useState(false);
  const [copied, setCopied] = useState(false);

  const toSVGCoords = useCallback((clientX: number, clientY: number): DebugPoint => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.round((clientX - rect.left) / rect.width  * SVG_W),
      y: Math.round((clientY - rect.top)  / rect.height * SVG_H),
    };
  }, [containerRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => setMouse(toSVGCoords(e.clientX, e.clientY)), [toSVGCoords]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    setPoints(prev => [...prev, toSVGCoords(e.clientX, e.clientY)]);
    setClosed(false);
  }, [toSVGCoords]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey) setClosed(true);
    if (e.key === 'Backspace') { setPoints(prev => prev.slice(0, -1)); setClosed(false); }
    if (e.key === 'Escape')    { setPoints([]); setClosed(false); }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleClick, handleKeyDown, containerRef]);

  const pathStr = points.length === 0
    ? '(클릭해서 첫 점 추가)'
    : points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `  L ${p.x} ${p.y}`)).join('\n') + (closed ? '\n  Z' : '');

  const handleCopy = () => navigator.clipboard.writeText(pathStr).then(() => {
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  });

  return (
    <>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="none"
      >
        <line x1={mouse.x} y1={0} x2={mouse.x} y2={SVG_H} stroke="rgba(255,80,80,0.5)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={0} y1={mouse.y} x2={SVG_W} y2={mouse.y} stroke="rgba(255,80,80,0.5)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={mouse.x} cy={mouse.y} r={5} fill="rgba(255,80,80,0.85)" />
        {points.length >= 2 && (
          <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(241,196,15,0.9)" strokeWidth="2" strokeDasharray="6 3" />
        )}
        {closed && points.length >= 2 && (
          <line x1={points[points.length-1].x} y1={points[points.length-1].y} x2={points[0].x} y2={points[0].y} stroke="rgba(241,196,15,0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={6} fill={i === 0 ? '#2ecc71' : '#f1c40f'} opacity={0.9} />
            <text x={p.x + 8} y={p.y - 6} fill="#fff" fontSize="14" fontFamily="monospace">{i + 1}</text>
          </g>
        ))}
      </svg>

      {/* 마우스 좌표 표시 */}
      <div style={{
        position: 'absolute',
        left: `${(mouse.x / SVG_W) * 100}%`,
        top:  `${(mouse.y / SVG_H) * 100}%`,
        transform: mouse.x > SVG_W * 0.75 ? 'translate(calc(-100% - 8px), 8px)' : 'translate(12px, 8px)',
        background: 'rgba(0,0,0,0.85)', color: '#f1c40f',
        fontFamily: 'monospace', fontSize: '13px',
        padding: '2px 8px', borderRadius: '4px',
        border: '1px solid rgba(241,196,15,0.4)',
        pointerEvents: 'none', zIndex: 60, whiteSpace: 'nowrap',
      }}>
        {mouse.x}, {mouse.y}
      </div>

      {/* 디버그 패널 */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 70,
        background: 'rgba(0,0,0,0.88)', border: '1px solid rgba(241,196,15,0.5)',
        borderRadius: '8px', padding: '10px 14px', color: '#fff',
        fontFamily: 'monospace', fontSize: '12px', maxWidth: '420px',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{ color: '#f1c40f', fontWeight: 'bold', marginBottom: 6, fontSize: '13px' }}>🗺 SVG 경로 디버그</div>
        <div style={{ color: '#aaa', marginBottom: 8, lineHeight: '1.6', fontSize: '11px' }}>
          <span style={{ color: '#7fdbff' }}>클릭</span> 점 추가 &nbsp;│&nbsp;
          <span style={{ color: '#7fdbff' }}>Z키</span> 닫기 &nbsp;│&nbsp;
          <span style={{ color: '#7fdbff' }}>Backspace</span> 취소 &nbsp;│&nbsp;
          <span style={{ color: '#7fdbff' }}>Esc</span> 초기화
        </div>
        <div style={{ marginBottom: 6, color: '#ccc', fontSize: '11px' }}>
          점: <strong style={{ color: '#2ecc71' }}>{points.length}</strong>
          {closed && <span style={{ color: '#f1c40f', marginLeft: 8 }}>✓ 닫힘</span>}
        </div>
        <pre style={{
          background: 'rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 4,
          overflowX: 'auto', maxHeight: '140px', overflowY: 'auto',
          fontSize: '11px', color: '#e0e0e0', marginBottom: 8,
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>{pathStr}</pre>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={dbBtn(copied ? '#2ecc71' : '#f1c40f')}>{copied ? '✓ 복사됨' : '📋 복사'}</button>
          <button onClick={() => { setPoints([]); setClosed(false); }} style={dbBtn('#e74c3c')}>🗑 초기화</button>
          <button onClick={() => setClosed(true)} disabled={points.length < 2} style={dbBtn('#9b59b6')}>⬡ 닫기(Z)</button>
        </div>
      </div>
    </>
  );
};

const dbBtn = (color: string): React.CSSProperties => ({
  background: 'transparent', border: `1px solid ${color}`, color,
  borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
  fontSize: '11px', fontFamily: 'monospace',
});

// =====================================================================
// 메인 WorldMapPopup
// =====================================================================
export const WorldMapPopup: React.FC<WorldMapPopupProps> = ({ currentChapter, onClose, onOpenStageMap }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [debugMode, setDebugMode] = useState(false);
  const IS_DEV = import.meta.env.DEV;

  const handleSectorClick = (sectorId: string) => {
    if (sectorId !== currentChapter) return;
    const store = useGameStore.getState();

    // v3.1: 전투 진행 중에는 스테이지 지도를 읽기 전용 팝업으로 띄우도록 함
    const isBattle = store.gameState === GameState.BATTLE || store.gameState === GameState.TUTORIAL;
    if (isBattle) {
      if (onOpenStageMap) {
        onOpenStageMap();
      }
      onClose();
      return;
    }

    store.triggerTransition(() => {
      // 이미 진행 중인 스테이지 맵이 있다면 진행 상황을 보존하며 복귀
      if (store.stageMapProgress && store.stageMapProgress.chapterId === sectorId) {
        store.returnToStageMap();
      } else {
        store.enterStageMap(sectorId);
      }
    });
    onClose();
  };

  return (
    <div className="world-map-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="world-map-container" ref={containerRef} style={{ cursor: debugMode ? 'crosshair' : 'default' }}>

        {/* 지도 배경 */}
        <img className="world-map-img" src="/assets/worldmap/worldmap.png" alt="세계 지도" draggable={false} />

        {/* SVG 구역 오버레이 */}
        <svg className="world-map-svg" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none" aria-hidden="true">
          {SECTORS.map((sector) => {
            const isCurrent = sector.implemented && sector.id === currentChapter;
            return (
              <path
                key={sector.id}
                className={['sector-path', isCurrent ? 'sector-current' : '', !sector.implemented ? 'sector-unimplemented' : ''].filter(Boolean).join(' ')}
                d={sector.svgPath}
                onClick={() => isCurrent && handleSectorClick(sector.id)}
              />
            );
          })}
        </svg>

        {/* 챕터명 레이블 */}
        {SECTORS.filter(s => s.implemented).map(sector => {
          const isCurrent = sector.id === currentChapter;
          return (
            <div
              key={`label-${sector.id}`}
              className={`sector-label ${isCurrent ? 'current' : ''}`}
              style={{ left: `${(sector.labelX / SVG_W) * 100}%`, top: `${(sector.labelY / SVG_H) * 100}%` }}
              onClick={() => isCurrent && handleSectorClick(sector.id)}
            >
              {sector.label}
            </div>
          );
        })}

        {/* 현재 위치 핀 */}
        {(() => {
          const cur = SECTORS.find(s => s.implemented && s.id === currentChapter);
          if (!cur) return null;
          return (
            <div className="current-location-pin" style={{ left: `${(cur.pinX / SVG_W) * 100}%`, top: `${(cur.pinY / SVG_H) * 100}%` }}>
              <span className="current-location-text">현재 위치</span>
              <span className="current-location-arrow">▼</span>
            </div>
          );
        })()}

        {/* 디버그 오버레이 (DEV 전용) */}
        {IS_DEV && debugMode && <MapDebugOverlay containerRef={containerRef} />}

        {/* 닫기 버튼 */}
        <button className="world-map-close-btn" onClick={onClose} aria-label="지도 닫기">✕</button>

        {/* 디버그 토글 (DEV 전용) */}
        {IS_DEV && (
          <button className="world-map-debug-btn" onClick={() => setDebugMode(v => !v)} title="경로 디버그 모드 토글">
            {debugMode ? '🔴 디버그 ON' : '🔵 디버그'}
          </button>
        )}
      </div>
    </div>
  );
};
