"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ScrollReveal, {
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/ScrollReveal";

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
    content: (
      <p className="w-full whitespace-pre-wrap">
        I love exploring AI × Design × Technology and turning ideas into
        meaningful experiences.😊
      </p>
    ),
  },
] as const;

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
  children,
}: {
  src: string;
  alt: string;
  color: string;
  positionClass: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`pointer-events-auto absolute z-20 hidden w-[213px] flex-col items-start gap-4 lg:flex ${positionClass}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={alt}
        className="relative size-14 shrink-0 p-2 outline-none transition-transform duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-black/20"
        style={{
          backgroundColor: color,
          // Speech-chip shape: sharp bottom-left, rounded other corners
          borderRadius: "32px 32px 32px 0",
        }}
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
      </button>

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
        >
          {bubble.content}
        </AboutChatBubble>
      ))}

      <div
        data-nav-focus
        className="relative z-10 mx-auto flex w-full max-w-[945px] flex-col items-center gap-12 sm:gap-14"
      >
        <ScrollReveal className="w-full">
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
                    className={`relative ${stackClass} size-12 shrink-0 rounded-full transition-[margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-16 ${
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
