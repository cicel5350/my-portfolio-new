"use client";

import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const POINTER_LERP = 0.28;
const TILT_LERP = 0.16;
const MAX_TILT_DEG = 18;
/** How long each still stays before crossfading */
const STILL_HOLD_MS = 2200;

const AVATAR_STILLS = [
  "/avatar-hero1.png",
  "/avatar-hero2.png",
] as const;

const circleLeftText = "SCROLL DOWN";
const circleRightText = "AND KNOW ME BETTER";
const CIRCLE_INNER_R = 46;
const CIRCLE_OUTER_R = 86;
const CIRCLE_TEXT_R = (CIRCLE_INNER_R + CIRCLE_OUTER_R) / 2;
const CIRCLE_FONT_SIZE = 14.5;

function pointOnScrollCircle(offset: number, radius = CIRCLE_TEXT_R) {
  const theta = offset * Math.PI * 2;
  return {
    x: 100 + radius * Math.sin(theta),
    y: 100 - radius * Math.cos(theta),
  };
}

function getCircleStarOffsets() {
  const circumference = 2 * Math.PI * CIRCLE_TEXT_R;
  const charWidth = CIRCLE_FONT_SIZE * 0.62;
  const rightHalf =
    (circleRightText.length * charWidth) / circumference / 2;
  const leftHalf = (circleLeftText.length * charWidth) / circumference / 2;
  const rightCenter = 0.25;
  const leftCenter = 0.75;
  const rightEnd = rightCenter + rightHalf;
  const leftStart = leftCenter - leftHalf;
  const leftEnd = leftCenter + leftHalf;
  const rightStart = rightCenter - rightHalf;

  return {
    afterRight: (rightEnd + leftStart) / 2,
    afterLeft: ((leftEnd + rightStart + 1) / 2) % 1,
  };
}

const circleStarOffsets = getCircleStarOffsets();
const circleStarA = pointOnScrollCircle(circleStarOffsets.afterLeft);
const circleStarB = pointOnScrollCircle(circleStarOffsets.afterRight);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

type HeroAvatarCardProps = {
  heroRef: RefObject<HTMLElement | null>;
};

const HeroAvatarCard = forwardRef<HTMLDivElement, HeroAvatarCardProps>(
  function HeroAvatarCard({ heroRef }, ref) {
    const [flipped, setFlipped] = useState(false);
    const [stillIndex, setStillIndex] = useState(0);
    const circlePathId = `hero-scroll-circle-${useId().replace(/:/g, "")}`;
    const cardRef = useRef<HTMLDivElement | null>(null);
    const rawXRef = useRef(0.5);
    const rawYRef = useRef(0.5);
    const smoothXRef = useRef(0.5);
    const smoothYRef = useRef(0.5);
    const tiltCurrentRef = useRef({ x: 0, y: 0 });
    const tiltTargetRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);
    const lastTsRef = useRef(0);

    const setCardNode = (node: HTMLDivElement | null) => {
      cardRef.current = node;
      assignRef(ref, node);
    };

    // Soft crossfade between the two stills
    useEffect(() => {
      if (flipped) return;
      const id = window.setInterval(() => {
        setStillIndex((i) => (i + 1) % AVATAR_STILLS.length);
      }, STILL_HOLD_MS);
      return () => window.clearInterval(id);
    }, [flipped]);

    // Perspective tilt from hero mouse position
    useEffect(() => {
      const card = cardRef.current;
      const hero = heroRef.current;
      if (!card || !hero) return;

      let cancelled = false;

      const onMove = (event: MouseEvent) => {
        const rect = hero.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        rawXRef.current = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        rawYRef.current = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      };

      const onLeave = () => {
        rawXRef.current = 0.5;
        rawYRef.current = 0.5;
        tiltTargetRef.current = { x: 0, y: 0 };
      };

      const tick = (timestamp: number) => {
        if (cancelled) return;
        const last = lastTsRef.current || timestamp;
        const dt = clamp(timestamp - last, 0, 32);
        lastTsRef.current = timestamp;

        const pointerAlpha = lerpFactor(POINTER_LERP, dt);
        const tiltAlpha = lerpFactor(TILT_LERP, dt);

        smoothXRef.current +=
          (rawXRef.current - smoothXRef.current) * pointerAlpha;
        smoothYRef.current +=
          (rawYRef.current - smoothYRef.current) * pointerAlpha;

        const nx = smoothXRef.current * 2 - 1;
        const ny = smoothYRef.current * 2 - 1;
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
        rafRef.current = window.requestAnimationFrame(tick);
      };

      hero.addEventListener("mousemove", onMove, { passive: true });
      hero.addEventListener("mouseleave", onLeave);
      rafRef.current = window.requestAnimationFrame(tick);

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(rafRef.current);
        hero.removeEventListener("mousemove", onMove);
        hero.removeEventListener("mouseleave", onLeave);
      };
    }, [heroRef]);

    return (
      <div
        className="relative z-10 h-[300px] w-[300px]"
        style={{ perspective: 1000 }}
      >
        <div
          ref={setCardNode}
          className="avatar-card relative h-full w-full will-change-transform"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          <div
            className="relative h-full w-full cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
          >
            {/* Front — blue card + two stills crossfade */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-[48px] bg-[#636BFF] shadow-[0_22px_50px_rgba(0,0,0,0.18)] [backface-visibility:hidden]"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                borderRadius: 48,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={AVATAR_STILLS[stillIndex]}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={AVATAR_STILLS[stillIndex]!}
                    alt="Cicel avatar"
                    fill
                    priority
                    sizes="300px"
                    className="object-cover object-[center_20%]"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Back — frosted glass + dual rings */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[48px] border border-white/70 bg-white/70 shadow-[0_22px_50px_rgba(0,0,0,0.12)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] [backface-visibility:hidden]"
              initial={false}
              animate={{ rotateY: flipped ? 0 : -180 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                borderRadius: 48,
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                className="absolute inset-[14%]"
                animate={{ rotate: flipped ? 360 : 0 }}
                transition={{
                  repeat: flipped ? Infinity : 0,
                  ease: "linear",
                  duration: 12,
                }}
              >
                <svg
                  viewBox="0 0 200 200"
                  className="h-full w-full"
                  aria-hidden
                >
                  <defs>
                    <path
                      id={circlePathId}
                      d={`M 100,${100 - CIRCLE_TEXT_R} A ${CIRCLE_TEXT_R},${CIRCLE_TEXT_R} 0 1,1 ${99.999},${100 - CIRCLE_TEXT_R}`}
                    />
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r={CIRCLE_INNER_R}
                    fill="none"
                    stroke="rgba(0,0,0,0.80)"
                    strokeWidth="0.75"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={CIRCLE_OUTER_R}
                    fill="none"
                    stroke="rgba(0,0,0,0.80)"
                    strokeWidth="0.75"
                  />
                  <text
                    className="fill-black font-inter uppercase"
                    dominantBaseline="middle"
                    style={{
                      fontSize: `${CIRCLE_FONT_SIZE}px`,
                      fontWeight: 600,
                    }}
                  >
                    <textPath
                      href={`#${circlePathId}`}
                      startOffset="25%"
                      textAnchor="middle"
                    >
                      {circleRightText}
                    </textPath>
                  </text>
                  <text
                    className="fill-black font-inter uppercase"
                    dominantBaseline="middle"
                    style={{
                      fontSize: `${CIRCLE_FONT_SIZE}px`,
                      fontWeight: 600,
                    }}
                  >
                    <textPath
                      href={`#${circlePathId}`}
                      startOffset="75%"
                      textAnchor="middle"
                    >
                      {circleLeftText}
                    </textPath>
                  </text>
                  <g fill="#111111">
                    <path
                      transform={`translate(${circleStarA.x} ${circleStarA.y}) scale(0.9)`}
                      d="M0-5.6 L1.4-1.4 L5.6 0 L1.4 1.4 L0 5.6 L-1.4 1.4 L-5.6 0 L-1.4-1.4 Z"
                    />
                    <path
                      transform={`translate(${circleStarB.x} ${circleStarB.y}) scale(0.9)`}
                      d="M0-5.6 L1.4-1.4 L5.6 0 L1.4 1.4 L0 5.6 L-1.4 1.4 L-5.6 0 L-1.4-1.4 Z"
                    />
                  </g>
                </svg>
              </motion.div>

              <motion.div
                className="relative z-10"
                animate={flipped ? { y: [-4, 5, -4] } : { y: 0 }}
                transition={
                  flipped
                    ? {
                        duration: 1.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : { duration: 0.2 }
                }
              >
                <ArrowDown
                  className="h-11 w-11 text-black sm:h-12 sm:w-12"
                  strokeWidth={1.15}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  },
);

export default HeroAvatarCard;
