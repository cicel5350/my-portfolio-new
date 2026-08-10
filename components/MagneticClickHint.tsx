"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";

const SENSE_RADIUS = 150;
const MAX_REPEL = 64;

/**
 * Path matches the reference arc:
 * bottom-right → curve (bulge toward top-right) → top-left.
 * Left side uses the horizontal mirror of this path.
 */
const ARC_RADIUS = 88;
/** Bottom-right end (near +x) */
const ANGLE_START = (8 * Math.PI) / 180;
/** Top-left end */
const ANGLE_END = (-125 * Math.PI) / 180;
const ANGLE_MID = (ANGLE_START + ANGLE_END) / 2;
const ANGLE_HALF = (ANGLE_END - ANGLE_START) / 2;
/** How much the graphic tilts across the full arc (deg each way) — continuous, no flip */
const TILT_AMP = 16;

/** Full round-trip duration in ms — slow, natural shuttle */
const IDLE_PERIOD_MS = 6800;

const springConfig = {
  stiffness: 60,
  damping: 22,
  mass: 0.7,
  restDelta: 0.01,
};

type MagneticClickHintProps = {
  className?: string;
  /** Asset path under /public */
  src?: string;
  width?: number;
  height?: number;
  /**
   * `right` = original BR→TL arc.
   * `left` = mirrored path (BL→TR) for the opposite side.
   */
  side?: "left" | "right";
  /** Extra phase offset in radians so paired hints are not locked in sync */
  phaseOffset?: number;
};

/** Point on the reference arc (local space, center at 0,0). */
function pointOnArc(angle: number) {
  return {
    x: Math.cos(angle) * ARC_RADIUS,
    y: Math.sin(angle) * ARC_RADIUS,
  };
}

const MID_POINT = pointOnArc(ANGLE_MID);

/**
 * Magnetic arrow + bubble hint.
 * Idle: shuttle along arc; near cursor: repel + noise via useSpring.
 */
export default function MagneticClickHint({
  className,
  src = "/projects/cursor.png",
  width = 423,
  height = 365,
  side = "right",
  phaseOffset = 0,
}: MagneticClickHintProps) {
  const mirror = side === "left" ? -1 : 1;
  const anchorRef = useRef<HTMLDivElement>(null);
  const homeCenter = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0, inside: false });
  const noiseRef = useRef({ t: 0 });
  const reduceMotionRef = useRef(false);
  const startMsRef = useRef<number | null>(null);

  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const rotate = useSpring(0, springConfig);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onMq = () => {
      reduceMotionRef.current = mq.matches;
      if (mq.matches) {
        x.set(0);
        y.set(0);
        rotate.set(0);
      }
    };
    mq.addEventListener("change", onMq);

    const syncHome = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      homeCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    syncHome();
    const ro = new ResizeObserver(syncHome);
    if (anchorRef.current) ro.observe(anchorRef.current);
    window.addEventListener("scroll", syncHome, { passive: true });
    window.addEventListener("resize", syncHome);

    const onMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY,
        inside: true,
      };
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    let rafId = 0;
    const tick = (now: number) => {
      if (startMsRef.current === null) startMsRef.current = now;
      syncHome();

      if (reduceMotionRef.current) {
        x.set(0);
        y.set(0);
        rotate.set(0);
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startMsRef.current;
      const phase = (elapsed / IDLE_PERIOD_MS) * Math.PI * 2 + phaseOffset;
      // -1 = start end, +1 = far end
      const wave = Math.sin(phase);
      const angle = ANGLE_MID + wave * ANGLE_HALF;

      const point = pointOnArc(angle);
      // Mirror X + tilt for the left-side twin
      const idleX = (point.x - MID_POINT.x) * mirror;
      const idleY = point.y - MID_POINT.y;
      const idleRotate = wave * TILT_AMP * mirror;

      let targetX = idleX;
      let targetY = idleY;
      let targetRotate = idleRotate;

      if (mouseRef.current.inside) {
        const cx = homeCenter.current.x + x.get();
        const cy = homeCenter.current.y + y.get();
        const dx = cx - mouseRef.current.x;
        const dy = cy - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist < SENSE_RADIUS && dist > 0.001) {
          const influence = 1 - dist / SENSE_RADIUS;
          const force = influence * MAX_REPEL;
          const nx = dx / dist;
          const ny = dy / dist;

          noiseRef.current.t += 0.045;
          const nt = noiseRef.current.t;
          const noiseX =
            Math.sin(nt * 1.7) * 10 + Math.cos(nt * 2.35) * 5;
          const noiseY =
            Math.cos(nt * 1.95) * 10 + Math.sin(nt * 2.15) * 5;

          const repelX = nx * force + noiseX * influence;
          const repelY = ny * force + noiseY * influence;
          const repelRotate = -nx * 10 * influence;

          targetX = idleX * (1 - influence) + repelX * influence;
          targetY = idleY * (1 - influence) + repelY * influence;
          targetRotate =
            idleRotate * (1 - influence) + repelRotate * influence;
        }
      }

      x.set(targetX);
      y.set(targetY);
      rotate.set(targetRotate);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("scroll", syncHome);
      window.removeEventListener("resize", syncHome);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      mq.removeEventListener("change", onMq);
    };
  }, [x, y, rotate, mirror, phaseOffset]);

  return (
    <div
      ref={anchorRef}
      className={`pointer-events-none absolute z-[5] select-none ${className ?? ""}`}
      aria-hidden
    >
      <motion.div
        style={{ x, y, rotate }}
        className="relative origin-center will-change-transform transform-gpu"
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          className="h-auto w-[min(211px,42vw)] max-w-none"
          unoptimized
          priority={false}
        />
      </motion.div>
    </div>
  );
}
