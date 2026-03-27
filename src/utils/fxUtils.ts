/**
 * type DeathFXOptions = {
 *   durationMs?: number;      // 전체 길이
 *   glitchMs?: number;        // 노이즈/글리치 구간
 *   flashMs?: number;         // 플래시 구간
 *   dissolveMs?: number;      // 입자화 구간
 *   particleCount?: number;   // 입자 수
 *   pixelStep?: number;       // 픽셀 샘플 간격(작을수록 더 촘촘/무거움)
 * };
 */

export type DeathFXOptions = {
    durationMs?: number;
    glitchMs?: number;
    flashMs?: number;
    dissolveMs?: number;
    particleCount?: number;
    pixelStep?: number;
};

/**
 * 몬스터 DOM 요소 위에 "노이즈화 → 플래시 → 입자화 소멸" 연출 재생.
 */
export async function playCoreDeathFX(
    monsterEl: HTMLElement,
    opts: DeathFXOptions = {}
): Promise<void> {
    const durationMs = opts.durationMs ?? 850;
    const glitchMs = opts.glitchMs ?? 220;
    const flashMs = opts.flashMs ?? 120;
    const dissolveMs = opts.dissolveMs ?? (durationMs - glitchMs - flashMs);
    const particleCount = opts.particleCount ?? 520;
    const pixelStep = opts.pixelStep ?? 6;

    // 1) 위치/크기
    const rect = monsterEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // 오버레이 캔버스 생성
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    document.body.appendChild(canvas);

    // 2) 원본 렌더 캡처
    const source = await getDrawableSource(monsterEl);
    if (!source) {
        canvas.remove();
        return;
    }

    // 원본을 캔버스에 그려 기준 프레임으로 사용
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.drawImage(source, 0, 0, rect.width, rect.height);

    // 픽셀 데이터 뽑아 파티클 생성에 사용
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const particles = buildParticles(imgData, particleCount, pixelStep);

    // 원본 몬스터는 숨기기
    const prevVisibility = monsterEl.style.visibility;
    monsterEl.style.visibility = "hidden";

    // 타이밍
    const t0 = performance.now();

    return new Promise<void>((resolve) => {
        const loop = (now: number) => {
            const t = now - t0;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, rect.width, rect.height);

            // 구간별 진행도
            const glitchT = clamp01(t / glitchMs);
            const flashT = clamp01((t - glitchMs) / flashMs);
            const disT = clamp01((t - glitchMs - flashMs) / dissolveMs);

            if (t < glitchMs) {
                drawGlitch(ctx, source, rect.width, rect.height, glitchT);
            } else if (t < glitchMs + flashMs) {
                drawGlitch(ctx, source, rect.width, rect.height, 1);
                drawCenterFlash(ctx, rect.width, rect.height, 1 - flashT);
            } else {
                drawDissolve(ctx, particles, rect.width, rect.height, disT);
                if (disT < 0.25) drawCenterFlash(ctx, rect.width, rect.height, 0.35 * (1 - disT / 0.25));
            }

            if (t < durationMs) {
                requestAnimationFrame(loop);
            } else {
                monsterEl.style.visibility = prevVisibility;
                canvas.remove();
                resolve();
            }
        };

        requestAnimationFrame(loop);
    });
}

async function getDrawableSource(
    el: HTMLElement
): Promise<CanvasImageSource | null> {
    if (el instanceof HTMLImageElement) {
        if (!el.complete || el.naturalWidth === 0) {
            try {
                await Promise.race([
                    new Promise<void>((resolve, reject) => {
                        el.addEventListener("load", () => resolve(), { once: true });
                        el.addEventListener("error", () => reject(), { once: true });
                    }),
                    new Promise<void>((_, reject) => setTimeout(() => reject(), 3000))
                ]);
            } catch {
                return null;
            }
        }
        if (el.naturalWidth === 0) return null;
        return el;
    }
    if (el instanceof HTMLCanvasElement) return el;
    if (el instanceof HTMLVideoElement) return el;
    return null;
}

function drawGlitch(
    ctx: CanvasRenderingContext2D,
    src: CanvasImageSource,
    w: number,
    h: number,
    k: number
) {
    ctx.globalAlpha = 1;
    ctx.drawImage(src, 0, 0, w, h);

    const slices = Math.floor(6 + 10 * k);
    const maxShift = 8 + 22 * k;

    for (let i = 0; i < slices; i++) {
        const sh = rand(4, 14);
        const sy = rand(0, h - sh);
        const dx = rand(-maxShift, maxShift);
        ctx.drawImage(src, 0, sy, w, sh, dx, sy, w, sh);
    }

    ctx.globalAlpha = 0.12 + 0.2 * k;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    const dots = Math.floor(120 + 420 * k);
    for (let i = 0; i < dots; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * (1.2 + 1.8 * k);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawCenterFlash(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(1, 0.85 * strength);

    const r0 = Math.min(w, h) * 0.05;
    const r1 = Math.min(w, h) * (0.55 + 0.25 * (1 - strength));
    const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.75)");
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r1, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
}

type Particle = {
    x: number; y: number;
    vx: number; vy: number;
    a: number;
    size: number;
};

function buildParticles(imgData: ImageData, count: number, step: number): Particle[] {
    const { width, height, data } = imgData;
    const candidates: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];
            if (alpha > 40) candidates.push({ x, y });
        }
    }

    const particles: Particle[] = [];
    const n = Math.min(count, candidates.length);
    const dpr = window.devicePixelRatio || 1;
    for (let i = 0; i < n; i++) {
        const p = candidates[(Math.random() * candidates.length) | 0];

        const dx = p.x - width * 0.5;
        const dy = p.y - height * 0.45;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = dx / len;
        const ny = dy / len;

        const speed = rand(40, 170);
        particles.push({
            x: p.x / dpr,
            y: p.y / dpr,
            vx: nx * speed + rand(-35, 35),
            vy: ny * speed + rand(-25, 25),
            a: 1,
            size: rand(1, 2.4),
        });
    }

    return particles;
}

function drawDissolve(
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    w: number,
    h: number,
    t: number
) {
    const dt = 1 / 60;
    const fade = 1 - t;

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,1)";

    const gravity = 120;
    for (const p of particles) {
        const accel = 1 + 1.8 * t;
        p.x += (p.vx * accel) * dt;
        p.y += (p.vy * accel + gravity * t) * dt;
        p.a = Math.max(0, fade * fade);

        if (p.a <= 0.001) continue;

        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (t < 0.8) {
        ctx.globalAlpha = 0.08 * (1 - t);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }
}

function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
}
function rand(a: number, b: number) {
    return a + Math.random() * (b - a);
}
