"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const LERP = 0.14;
const LOOK_RANGE = 140;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type EyeRefs = {
  sclera: HTMLSpanElement | null;
  pupil: HTMLSpanElement | null;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
};

/**
 * Figma 354:2496 + 355:2504 — original flower asset, eyes centered,
 * pupils ease toward the cursor and stay inside each sclera.
 */
export default function CapabilitiesFlowerEyes({
  className = "",
}: {
  className?: string;
}) {
  const eyesRef = useRef<EyeRefs[]>([
    { sclera: null, pupil: null, currentX: 0, currentY: 0, targetX: 0, targetY: 0 },
    { sclera: null, pupil: null, currentX: 0, currentY: 0, targetX: 0, targetY: 0 },
  ]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef(0);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY, active: true };
    };

    const onLeave = () => {
      mouseRef.current.active = false;
      for (const eye of eyesRef.current) {
        eye.targetX = 0;
        eye.targetY = 0;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    const tick = () => {
      const mouse = mouseRef.current;

      for (const eye of eyesRef.current) {
        const { sclera, pupil } = eye;
        if (!sclera || !pupil) continue;

        if (mouse.active) {
          const rect = sclera.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = mouse.x - cx;
          const dy = mouse.y - cy;
          const dist = Math.hypot(dx, dy) || 1;

          const eyeSize = rect.width;
          const pupilSize = pupil.offsetWidth || eyeSize * 0.5;
          const maxTravel = Math.max(0, (eyeSize - pupilSize) / 2 - 0.5);
          const strength = clamp(dist / LOOK_RANGE, 0, 1);
          const travel = maxTravel * strength;
          eye.targetX = (dx / dist) * travel;
          eye.targetY = (dy / dist) * travel;
        }

        eye.currentX = lerp(eye.currentX, eye.targetX, LERP);
        eye.currentY = lerp(eye.currentY, eye.targetY, LERP);
        pupil.style.transform = `translate(${eye.currentX.toFixed(2)}px, ${eye.currentY.toFixed(2)}px)`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative size-[101px] shrink-0 ${className}`}
    >
      {/* Original Figma flower shape — do not redraw */}
      <Image
        src="/capabilities/flower.png"
        alt=""
        width={101}
        height={101}
        unoptimized
        className="block h-full w-full select-none object-contain"
        priority
      />

      {/* Eyes centered on the flower */}
      <div className="absolute inset-0 flex items-center justify-center gap-1">
        {[0, 1].map((index) => (
          <span
            key={index}
            ref={(node) => {
              eyesRef.current[index]!.sclera = node;
            }}
            className="relative block size-4 overflow-hidden rounded-full bg-white"
          >
            <span
              ref={(node) => {
                eyesRef.current[index]!.pupil = node;
              }}
              className="absolute left-1/2 top-1/2 block size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black will-change-transform"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
