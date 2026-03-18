import React from 'react';

type GaugeVariant = "boss" | "player";

type Props = {
    src: string;         // png 경로
    variant: GaugeVariant;
    hp01: number;        // 0~1 (1=풀, 0=빈)
    width?: number;      // 화면 표시 크기(선택)
    height?: number;
};

const BASE = { w: 1280, h: 387 };

const CYL = {
    boss: { x: 356, y: 116, w: 732, h: 165, r: 15 },    // Sharper corners (closer to rectangle)
    player: { x: 353, y: 122, w: 707, h: 164, r: 15 },  // Sharper corners
} as const;

// 조정값
const THRESH = 0.6;          // 60% 지점
const BASE_DIM_A = 0.40;     // 기본 dim(감소 영역 전체)
const EXTRA_MAX_A = 0.55;    // 추가 dim 최대치(THRESH 이후 자연 증가)

function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
}

// 부드러운 커브(경계 티 안나게)
function smoothstep(edge0: number, edge1: number, x: number) {
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

export function HpBarMasked({
    src,
    variant,
    hp01,
}: Props) {
    const p = clamp01(hp01);
    const c = CYL[variant];

    // 1) 기본 dim 영역 (오른쪽부터 어두워짐)
    const dimX = c.x + c.w * p;
    const dimW = c.w * (1 - p);

    // 2) 강화 dim: 60% 지점보다 오른쪽(즉, x >= 0.6*w) 구간 중 dim에 포함된 부분만
    const threshX = c.x + c.w * THRESH;
    const strongX = Math.max(dimX, threshX);
    const strongW = Math.max(0, (c.x + c.w) - strongX);

    // hp가 THRESH 아래로 내려갈수록(=더 많이 깎일수록) 추가 dim을 점점 키움
    const extraT = smoothstep(THRESH, 0.0, p);
    const extraA = EXTRA_MAX_A * extraT;

    const clipId = `cylClip-${variant}`;
    // 그라디언트 id 충돌 방지
    const gid = `strongGrad-${variant}-${Math.round(p * 10000)}`;

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${BASE.w} ${BASE.h}`}
            style={{ display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* 원본 이미지 */}
            <image href={src} x={0} y={0} width={BASE.w} height={BASE.h} />

            <defs>
                <clipPath id={clipId}>
                    <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={c.r} ry={c.r} />
                </clipPath>

                {/* 강화 dim 그라디언트: strongX(좌) -> 오른쪽 끝(우)로 갈수록 더 진해지게 */}
                <linearGradient id={gid} x1={strongX} y1={0} x2={c.x + c.w} y2={0} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="55%" stopColor={`rgba(0,0,0,${extraA * 0.6})`} />
                    <stop offset="100%" stopColor={`rgba(0,0,0,${extraA})`} />
                </linearGradient>
            </defs>

            {/* 실린더 내부만 dim */}
            <g clipPath={`url(#${clipId})`}>
                {/* (1) 기본 dim LAYER */}
                {dimW > 0 && (
                    <rect
                        x={dimX}
                        y={c.y}
                        width={dimW}
                        height={c.h}
                        fill={`rgba(0,0,0,${BASE_DIM_A})`}
                        style={{ transition: 'x 0.3s ease-out, width 0.3s ease-out' }}
                    />
                )}

                {/* (2) 강화 dim LAYER (그라디언트) */}
                {strongW > 0 && extraA > 0.001 && (
                    <rect
                        x={strongX}
                        y={c.y}
                        width={strongW}
                        height={c.h}
                        fill={`url(#${gid})`}
                        style={{ transition: 'x 0.3s ease-out, width 0.3s ease-out' }}
                    />
                )}
            </g>
        </svg>
    );
}
