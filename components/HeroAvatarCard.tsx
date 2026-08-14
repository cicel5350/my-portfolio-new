"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ForwardedRef,
  type RefObject,
} from "react";

const FRAME_COUNT = 40;
/** Input / follow smoothing (per 60fps tick) */
const POINTER_LERP = 0.28;
const FRAME_LERP = 0.22;
const TILT_LERP = 0.16;
/** Never skip frames — max frames advanced per 60fps tick */
const MAX_FRAME_STEP = 1.6;
const MAX_TILT_DEG = 18;
/** 1-based frame 17 → 0-based index 16 (natural center look) */
const REST_FRAME = 16;
const FRAME_EPSILON = 0.02;

/** Extreme look settles in the first / last frames */
const LEFT_EXTREME = 0;
const RIGHT_EXTREME = FRAME_COUNT - 1;
/** Partial look for upper/lower diagonal regions */
const LEFT_PARTIAL = 8;
const RIGHT_PARTIAL = FRAME_COUNT - 9;

function frameSrc(index: number) {
  return `/assets/Frame_${String(index).padStart(5, "0")}.png`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smootherstep(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function lerpFactor(base: number, dtMs: number) {
  return 1 - Math.pow(1 - base, dtMs / (1000 / 60));
}

type FrameSource = CanvasImageSource & { width: number; height: number };

/** Draw avatar at 90% scale, centered on the full card (card chrome stays 100%). */
const AVATAR_DRAW_SCALE = 0.95;

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: FrameSource,
  width: number,
  height: number,
) {
  const ir = img.width / img.height;
  const cr = width / height;
  let dw: number;
  let dh: number;

  if (ir > cr) {
    dh = height;
    dw = height * ir;
  } else {
    dw = width;
    dh = width / ir;
  }

  dw *= AVATAR_DRAW_SCALE;
  dh *= AVATAR_DRAW_SCALE;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;

  // Fill card blue under transparent PNG to avoid clear flicker
  ctx.fillStyle = "#636BFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Avatar-relative look zones (no dead zone):
 * - Horizontal left of card  → first frames (extreme left)
 * - Upper / lower left       → partial left
 * - Near card center         → frame 17
 * - Upper / lower right      → partial right
 * - Horizontal right of card → last frames (extreme right)
 */
function frameFromCardPointer(
  clientX: number,
  clientY: number,
  cardRect: DOMRect,
) {
  const cx = cardRect.left + cardRect.width / 2;
  const cy = cardRect.top + cardRect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;

  // Same vertical band as the avatar → "水平左侧 / 右侧"
  const isHorizontalSide = Math.abs(dy) <= cardRect.height / 2;
  const reach = cardRect.width * 0.9;
  const outward = smootherstep(clamp(Math.abs(dx) / reach, 0, 1));

  if (dx <= 0) {
    if (isHorizontalSide) {
      return mix(REST_FRAME, LEFT_EXTREME, outward);
    }
    // 左上 / 左下
    return mix(REST_FRAME, LEFT_PARTIAL, outward);
  }

  if (isHorizontalSide) {
    return mix(REST_FRAME, RIGHT_EXTREME, outward);
  }
  // 右上 / 右下
  return mix(REST_FRAME, RIGHT_PARTIAL, outward);
}

async function preloadFrames(): Promise<FrameSource[]> {
  const images = await Promise.all(
    Array.from({ length: FRAME_COUNT }, (_, index) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(new Error(`Failed to load ${frameSrc(index)}`));
        img.src = frameSrc(index);
      });
    }),
  );

  await Promise.all(
    images.map((img) =>
      typeof img.decode === "function"
        ? img.decode().catch(() => undefined)
        : Promise.resolve(),
    ),
  );

  // ImageBitmap blits faster / more consistently than HTMLImageElement
  if (typeof createImageBitmap === "function") {
    try {
      return await Promise.all(images.map((img) => createImageBitmap(img)));
    } catch {
      return images;
    }
  }

  return images;
}

type HeroAvatarCardProps = {
  heroRef: RefObject<HTMLElement | null>;
};

const HeroAvatarCard = forwardRef<HTMLDivElement, HeroAvatarCardProps>(
  function HeroAvatarCard({ heroRef }, ref) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const framesRef = useRef<FrameSource[]>([]);
    const readyRef = useRef(false);
    const pausedRef = useRef(false);

    /** Raw pointer (updated on mousemove only) */
    const rawXRef = useRef(0.5);
    const rawYRef = useRef(0.5);
    /** Smoothed pointer (eased in rAF) */
    const smoothXRef = useRef(0.5);
    const smoothYRef = useRef(0.5);

    const currentFrameRef = useRef(REST_FRAME);
    const targetFrameRef = useRef(REST_FRAME);
    const tiltCurrentRef = useRef({ x: 0, y: 0 });
    const tiltTargetRef = useRef({ x: 0, y: 0 });
    const lastDrawnIndexRef = useRef(-1);
    const rafRef = useRef(0);
    const lastTsRef = useRef(0);

    const setCardNode = (node: HTMLDivElement | null) => {
      cardRef.current = node;
      assignRef(ref, node);
    };

    useEffect(() => {
      let cancelled = false;
      const canvas = canvasRef.current;
      const card = cardRef.current;
      const hero = heroRef.current;
      if (!canvas || !card) return;

      const ctx = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });
      if (!ctx) return;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = card.clientWidth;
        const height = card.clientHeight;
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastDrawnIndexRef.current = -1;
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(card);

      const drawFrameIndex = (index: number) => {
        const frame = framesRef.current[index];
        if (!frame) return;
        drawCover(ctx, frame, card.clientWidth, card.clientHeight);
        lastDrawnIndexRef.current = index;
      };

      const pauseFrameFollow = () => {
        // Lock head to frame 17 only — tilt still tracks the pointer
        pausedRef.current = true;
        targetFrameRef.current = REST_FRAME;
        currentFrameRef.current = REST_FRAME;
        drawFrameIndex(REST_FRAME);
      };

      const resumeFrameFollow = () => {
        pausedRef.current = false;
      };

      const onMove = (event: MouseEvent) => {
        if (!readyRef.current || !hero) return;

        const rect = hero.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        // Always update pointer so tilt keeps following
        rawXRef.current = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        rawYRef.current = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        const target = event.target;
        const overCta =
          target instanceof Element &&
          Boolean(target.closest("[data-pause-avatar-follow]"));

        const cardRect = card.getBoundingClientRect();
        const overCard =
          event.clientX >= cardRect.left &&
          event.clientX <= cardRect.right &&
          event.clientY >= cardRect.top &&
          event.clientY <= cardRect.bottom;

        if (overCta || overCard) {
          pauseFrameFollow();
          return;
        }

        resumeFrameFollow();
      };

      const onLeave = () => {
        if (!readyRef.current) return;
        // Leave hero: lock frame 17 and flatten tilt
        pausedRef.current = true;
        rawXRef.current = 0.5;
        rawYRef.current = 0.5;
        smoothXRef.current = 0.5;
        smoothYRef.current = 0.5;
        targetFrameRef.current = REST_FRAME;
        currentFrameRef.current = REST_FRAME;
        tiltTargetRef.current = { x: 0, y: 0 };
        tiltCurrentRef.current = { x: 0, y: 0 };
        card.style.transform = "rotateX(0deg) rotateY(0deg)";
        drawFrameIndex(REST_FRAME);
      };

      const tick = (timestamp: number) => {
        if (cancelled) return;

        const last = lastTsRef.current || timestamp;
        const dt = clamp(timestamp - last, 0, 32);
        lastTsRef.current = timestamp;

        if (!readyRef.current) {
          rafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        const pointerAlpha = lerpFactor(POINTER_LERP, dt);
        const frameAlpha = lerpFactor(FRAME_LERP, dt);
        const tiltAlpha = lerpFactor(TILT_LERP, dt);

        // Smooth pointer — drives tilt always, frames when not paused
        smoothXRef.current +=
          (rawXRef.current - smoothXRef.current) * pointerAlpha;
        smoothYRef.current +=
          (rawYRef.current - smoothYRef.current) * pointerAlpha;

        const sx = smoothXRef.current;
        const sy = smoothYRef.current;

        const nx = sx * 2 - 1;
        const ny = sy * 2 - 1;
        tiltTargetRef.current = {
          x: -ny * MAX_TILT_DEG,
          y: nx * MAX_TILT_DEG,
        };

        tiltCurrentRef.current = {
          x:
            tiltCurrentRef.current.x +
            (tiltTargetRef.current.x - tiltCurrentRef.current.x) * tiltAlpha,
          y:
            tiltCurrentRef.current.y +
            (tiltTargetRef.current.y - tiltCurrentRef.current.y) * tiltAlpha,
        };

        card.style.transform = `rotateX(${tiltCurrentRef.current.x.toFixed(3)}deg) rotateY(${tiltCurrentRef.current.y.toFixed(3)}deg)`;

        if (pausedRef.current) {
          if (lastDrawnIndexRef.current !== REST_FRAME) {
            currentFrameRef.current = REST_FRAME;
            targetFrameRef.current = REST_FRAME;
            drawFrameIndex(REST_FRAME);
          }
        } else {
          // Reconstruct pointer in viewport space from smoothed hero ratios
          const heroRect = hero?.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          if (heroRect && heroRect.width > 0 && heroRect.height > 0) {
            const clientX = heroRect.left + sx * heroRect.width;
            const clientY = heroRect.top + sy * heroRect.height;
            targetFrameRef.current = frameFromCardPointer(
              clientX,
              clientY,
              cardRect,
            );
          }

          const target = targetFrameRef.current;
          let current = currentFrameRef.current;
          const desired = current + (target - current) * frameAlpha;
          const maxStep = MAX_FRAME_STEP * (dt / (1000 / 60));
          const delta = clamp(desired - current, -maxStep, maxStep);
          current += delta;
          if (Math.abs(target - current) < FRAME_EPSILON) current = target;
          currentFrameRef.current = current;

          const index = Math.round(clamp(current, 0, FRAME_COUNT - 1));
          if (index !== lastDrawnIndexRef.current) {
            drawFrameIndex(index);
          }
        }

        rafRef.current = window.requestAnimationFrame(tick);
      };

      preloadFrames()
        .then((frames) => {
          if (cancelled) return;
          framesRef.current = frames;
          readyRef.current = true;
          currentFrameRef.current = REST_FRAME;
          targetFrameRef.current = REST_FRAME;
          drawFrameIndex(REST_FRAME);

          if (hero) {
            hero.addEventListener("mousemove", onMove, { passive: true });
            hero.addEventListener("mouseleave", onLeave);
          }
        })
        .catch(() => {
          // Leave canvas blank if preload fails
        });

      rafRef.current = window.requestAnimationFrame(tick);

      return () => {
        cancelled = true;
        observer.disconnect();
        window.cancelAnimationFrame(rafRef.current);
        if (hero) {
          hero.removeEventListener("mousemove", onMove);
          hero.removeEventListener("mouseleave", onLeave);
        }
        for (const frame of framesRef.current) {
          if (typeof ImageBitmap !== "undefined" && frame instanceof ImageBitmap) {
            frame.close();
          }
        }
      };
    }, [heroRef]);

    return (
      <div
        className="relative z-10 h-[300px] w-[300px]"
        style={{ perspective: 1000 }}
      >
        <div
          ref={setCardNode}
          className="avatar-card relative h-full w-full overflow-hidden rounded-[48px] bg-[#636BFF] shadow-[0_22px_50px_rgba(0,0,0,0.18)] will-change-transform"
          style={{
            borderRadius: 48,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          <canvas
            id="avatar-canvas"
            ref={canvasRef}
            aria-label="Cicel avatar"
            className="pointer-events-none h-full w-full"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>
    );
  },
);

export default HeroAvatarCard;
