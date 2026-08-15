"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ScrollReveal, {
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/ScrollReveal";
import AboutMeDoodle from "@/components/AboutMeDoodle";

const shapeIcons = {
  star: { src: "/about/01.png", alt: "", size: 107 },
  pyramid: { src: "/about/02.png", alt: "", size: 110 },
  disk: { src: "/about/03.png", alt: "", size: 106 },
  sphere: { src: "/about/04.png", alt: "", size: 106 },
  gem: { src: "/about/05.png", alt: "", size: 114 },
} as const;

// Bump when replacing files in /public/about so clients skip stale image cache.
const SKILL_ICON_VERSION = "20260809";

const skillIcons = [
  { file: "figma.png", alt: "Figma" },
  { file: "ae.png", alt: "After Effects" },
  { file: "cursor.png", alt: "Cursor" },
  { file: "gpt.png", alt: "ChatGPT" },
  { file: "ps.png", alt: "Photoshop" },
  { file: "ai.png", alt: "Illustrator" },
] as const;

const aboutChatBubbles = [
  {
    id: "left",
    src: "/about/avatar1.png",
    alt: "Cicel avatar",
    color: "#95D3F3",
    // Staggered: higher on the left side
    positionClass:
      "left-[max(0.75rem,calc(50%-40rem))] top-[42%] xl:left-[max(1.25rem,calc(50%-46rem))]",
    // Idle nudge starts sooner; pairs with right so they never wiggle together
    nudgeDelay: 0.6,
    content: (
      <>
        <p className="w-full whitespace-pre-wrap">Hi, I&apos;m Cicel 👋</p>
        <p className="w-full">
          UI/UX Designer with 8+ years of experience in digital product design.
        </p>
      </>
    ),
  },
  {
    id: "right",
    src: "/about/avatar2.png",
    alt: "Cicel thinking avatar",
    color: "#D59BF7",
    // Staggered: lower on the right side
    positionClass:
      "right-[max(0.75rem,calc(50%-46rem))] top-[52%] xl:right-[max(1.25rem,calc(50%-52rem))]",
    nudgeDelay: 3.4,
    content: (
      <p className="w-full whitespace-pre-wrap">
        I love exploring AI × Design × Technology and turning ideas into
        meaningful experiences.😊
      </p>
    ),
  },
] as const;

/** Short lively burst, then a long rest — hints the avatar is interactive. */
const avatarNudge = {
  rotate: [0, -8, 7, -5.5, 4, -2, 0] as number[],
  x: [0, -2, 2.2, -1.4, 1, -0.4, 0] as number[],
  y: [0, -1.5, 0.6, -1, 0.4, -0.2, 0] as number[],
};

const CONFETTI_ACCENTS = [
  "#FF6B6B",
  "#FFD166",
  "#06D6A0",
  "#FFFFFF",
  "#FF8FAB",
] as const;

type ConfettiPiece = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "strip";
};

function makeConfetti(seed: number, accent: string): ConfettiPiece[] {
  // Tiny deterministic PRNG so each hover looks fresh but SSR-safe
  let t = (seed % 9973) + 1;
  const rand = () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };

  const palette = [accent, ...CONFETTI_ACCENTS];
  const count = 14;

  return Array.from({ length: count }, (_, i) => {
    const angle = ((i / count) * Math.PI * 2 + rand() * 0.55) % (Math.PI * 2);
    const dist = 26 + rand() * 42;
    const shapes = ["rect", "circle", "strip"] as const;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 8 - rand() * 18,
      rotate: (rand() - 0.5) * 520,
      delay: rand() * 0.08,
      size: 4 + rand() * 5,
      color: palette[Math.floor(rand() * palette.length)]!,
      shape: shapes[Math.floor(rand() * shapes.length)]!,
    };
  });
}

function AvatarConfetti({
  burstId,
  accent,
  onDone,
}: {
  burstId: number;
  accent: string;
  onDone: (id: number) => void;
}) {
  const pieces = useMemo(
    () => makeConfetti(burstId, accent),
    [burstId, accent],
  );

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-30 size-0 overflow-visible"
      aria-hidden
    >
      {pieces.map((p, index) => {
        const isLast = index === pieces.length - 1;
        const borderRadius =
          p.shape === "circle"
            ? "999px"
            : p.shape === "strip"
              ? "1px"
              : "1.5px";
        const width = p.shape === "strip" ? p.size * 0.35 : p.size;
        const height = p.shape === "strip" ? p.size * 1.6 : p.size;

        return (
          <motion.span
            key={`${burstId}-${p.id}`}
            className="absolute left-0 top-0 block"
            style={{
              width,
              height,
              marginLeft: -width / 2,
              marginTop: -height / 2,
              backgroundColor: p.color,
              borderRadius,
              boxShadow:
                p.color === "#FFFFFF" ? "0 0 0 1px rgba(0,0,0,0.06)" : undefined,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{
              x: p.x,
              y: [0, p.y * 0.55, p.y + 10],
              opacity: [0, 1, 1, 0],
              scale: [0.2, 1.15, 1, 0.7],
              rotate: p.rotate,
            }}
            transition={{
              duration: 0.78,
              delay: p.delay,
              ease: [0.2, 0.75, 0.2, 1],
              times: [0, 0.18, 0.55, 1],
            }}
            onAnimationComplete={() => {
              if (isLast) onDone(burstId);
            }}
          />
        );
      })}
    </div>
  );
}

function InlineShape({
  src,
  alt,
  size,
  floatDelay = 0,
}: {
  src: string;
  alt: string;
  size: number;
  floatDelay?: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="relative inline-flex shrink-0 items-center justify-center align-middle"
      style={{
        width: `clamp(3.25rem, 8vw, ${size}px)`,
        height: `clamp(3.25rem, 8vw, ${size}px)`,
      }}
      animate={{ y: [-4, 5, -4] }}
      transition={{
        duration: 3.8 + floatDelay,
        delay: floatDelay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </motion.span>
  );
}

function AboutChatBubble({
  src,
  alt,
  color,
  positionClass,
  nudgeDelay,
  children,
}: {
  src: string;
  alt: string;
  color: string;
  positionClass: string;
  nudgeDelay: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [bursts, setBursts] = useState<number[]>([]);

  const triggerConfetti = () => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setBursts((prev) => [...prev.slice(-2), id]);
  };

  return (
    <div
      className={`pointer-events-auto absolute z-20 hidden w-[213px] flex-col items-start gap-4 lg:flex ${positionClass}`}
      onMouseEnter={() => {
        setOpen(true);
        triggerConfetti();
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        setOpen(true);
        triggerConfetti();
      }}
      onBlur={() => setOpen(false)}
    >
      <div className="relative shrink-0 overflow-visible">
        <motion.button
          type="button"
          aria-expanded={open}
          aria-label={alt}
          className="relative size-14 origin-center p-2 outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          style={{
            backgroundColor: color,
            // Speech-chip shape: sharp bottom-left, rounded other corners
            borderRadius: "32px 32px 32px 0",
          }}
          animate={
            open
              ? { rotate: 0, x: 0, y: 0, scale: 1.05 }
              : avatarNudge
          }
          transition={
            open
              ? { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
              : {
                  duration: 0.72,
                  ease: [0.34, 1.45, 0.64, 1],
                  times: [0, 0.14, 0.3, 0.48, 0.66, 0.84, 1],
                  repeat: Infinity,
                  repeatDelay: 5.2,
                  delay: nudgeDelay,
                }
          }
          whileHover={{ scale: 1.05 }}
        >
          <span className="relative block size-10 overflow-hidden rounded-full bg-white">
            <Image
              src={src}
              alt=""
              fill
              sizes="40px"
              className="object-cover object-[center_20%]"
            />
          </span>
        </motion.button>

        <AnimatePresence>
          {bursts.map((id) => (
            <AvatarConfetti
              key={id}
              burstId={id}
              accent={color}
              onDone={(doneId) =>
                setBursts((prev) => prev.filter((b) => b !== doneId))
              }
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-3xl p-6"
            style={{ backgroundColor: color }}
          >
            <div className="font-inter flex w-full flex-col gap-3 text-[16px] font-normal leading-normal text-black">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type AboutSectionProps = {
  onInViewChange?: (inView: boolean) => void;
};

export default function AboutSection({ onInViewChange }: AboutSectionProps) {
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.3,
    rootMargin: "-10% 0px -15% 0px",
  });

  useEffect(() => {
    onInViewChange?.(inView);
  }, [inView, onInViewChange]);

  return (
    <section
      id="about"
      ref={inViewRef}
      className="relative flex min-h-dvh scroll-mt-0 items-center justify-center overflow-x-clip bg-white px-4 py-24 sm:px-6 lg:px-8"
    >
      {aboutChatBubbles.map((bubble) => (
        <AboutChatBubble
          key={bubble.id}
          src={bubble.src}
          alt={bubble.alt}
          color={bubble.color}
          positionClass={bubble.positionClass}
          nudgeDelay={bubble.nudgeDelay}
        >
          {bubble.content}
        </AboutChatBubble>
      ))}

      <div
        data-nav-focus
        className="relative z-10 mx-auto flex w-full max-w-[945px] flex-col items-center gap-12 sm:gap-14"
      >
        <ScrollReveal className="w-full">
          <div className="flex w-full flex-col items-center gap-10">
            {/* Figma 341:2477 — small handwritten title above the headline */}
            <AboutMeDoodle />
            <h2 className="font-inter text-center text-[clamp(2rem,5.5vw,4rem)] font-medium leading-[1.15] tracking-tight text-[#0B0C0F]">
              <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>Interaction</span>
                <InlineShape {...shapeIcons.star} floatDelay={0.15} />
                <span>Designer</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>crafting</span>
                <InlineShape {...shapeIcons.pyramid} floatDelay={0.35} />
                <span>design solution</span>
                <InlineShape {...shapeIcons.disk} floatDelay={0.55} />
              </span>
              <span className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span>and</span>
                <InlineShape {...shapeIcons.sphere} floatDelay={0.25} />
                <span>visual stories</span>
                <InlineShape {...shapeIcons.gem} floatDelay={0.45} />
              </span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="group inline-flex max-w-full cursor-default items-center rounded-full border border-black/15 py-5 pl-8 pr-6 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-10 sm:py-6 sm:pl-12 sm:pr-8 sm:group-hover:gap-14">
            <p className="font-inter shrink-0 text-[28px] font-normal text-[#707889]">
              Skills
            </p>
            <ScrollRevealGroup
              className="flex items-center pl-5 sm:pl-0"
              stagger={0.06}
              delayChildren={0.12}
            >
              {skillIcons.map((skill, index) => {
                const stackClass = [
                  "z-30",
                  "z-20",
                  "z-10",
                  "z-[9]",
                  "z-[8]",
                  "z-[7]",
                ][index];

                return (
                  <ScrollRevealItem
                    key={`${skill.file}-${SKILL_ICON_VERSION}`}
                    className={`group/skill relative ${stackClass} size-12 shrink-0 rounded-full transition-[margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-50 sm:size-16 ${
                      index > 0
                        ? "-ml-3 group-hover:ml-2.5 sm:-ml-4 sm:group-hover:ml-3"
                        : ""
                    }`}
                  >
                    <motion.div
                      className="h-full w-full cursor-pointer overflow-hidden rounded-full"
                      whileHover={{
                        rotate: [0, -8, 7, -5, 4, 0],
                        y: [0, -1, 1, -1, 0],
                      }}
                      transition={{
                        duration: 0.42,
                        ease: "easeInOut",
                      }}
                    >
                      <Image
                        src={`/about/${skill.file}?v=${SKILL_ICON_VERSION}`}
                        alt={skill.alt}
                        width={70}
                        height={70}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </motion.div>

                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md bg-[#0B0C0F] px-2.5 py-1 font-inter text-[12px] font-medium leading-none tracking-normal text-white opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-[opacity,transform] duration-200 ease-out group-hover/skill:opacity-100 group-hover/skill:-translate-y-[calc(100%+14px)]"
                    >
                      {skill.alt}
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-4 border-transparent border-t-[#0B0C0F]"
                      />
                    </span>
                  </ScrollRevealItem>
                );
              })}
            </ScrollRevealGroup>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
