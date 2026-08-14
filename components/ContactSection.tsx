"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import ScrollReveal, {
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/ScrollReveal";

const rollingWords = ["design", "create", "build"] as const;

const contactDetails = [
  {
    href: "mailto:cenchen684@gmail.com",
    label: "Email",
    value: "cenchen684@gmail.com",
    cursorLabel: "Email Me",
    showAvailabilityDoodle: false,
  },
  {
    href: "tel:18792709467",
    label: "Call Me",
    value: "18792709467",
    cursorLabel: "Call Me",
    showAvailabilityDoodle: true,
  },
] as const;

/** Figma 346:2497 — yellow speech chip with avatar + CTA label */
function GetInTouchBubble({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none inline-flex items-center gap-2.5 bg-[#F9DE8C] py-2.5 pl-2.5 pr-4 tracking-normal ${className}`}
      style={{ borderRadius: "32px 32px 32px 0" }}
      aria-hidden
    >
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-white">
        <Image
          src="/contact/avatar1.png"
          alt=""
          fill
          sizes="40px"
          className="object-cover object-[center_20%]"
        />
      </span>
      <span className="font-inter whitespace-nowrap text-[18px] font-normal leading-none tracking-normal text-[#0B0C0F]">
        Get in touch！
      </span>
    </div>
  );
}

/** Figma 346:2515 + 346:2509 — curved arrow + Caveat note beside Call Me */
function AvailabilityDoodle({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute left-[calc(100%-5.5rem)] top-[2.65rem] z-10 hidden w-[10.5rem] lg:block ${className}`}
      aria-hidden
    >
      <Image
        src="/contact/arrow.svg"
        alt=""
        width={35}
        height={28}
        unoptimized
        className="block h-7 w-9"
      />
      <p
        className="font-caveat -mt-0.5 w-[9.5rem] text-[24px] font-normal leading-6 text-[#0B0C0F]"
        style={{ transform: "rotate(-5deg)" }}
      >
        I&apos;m available for new projects
      </p>
    </div>
  );
}

function RollingHeadlineWord({
  words,
  active,
}: {
  words: readonly string[];
  active: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 1900);

    return () => window.clearInterval(id);
  }, [active, words.length]);

  return (
    <span
      // Tall enough for Inter descenders (e.g. "g") while still clipping to one line
      className="relative inline-grid h-[1.28em] align-baseline leading-[1.28]"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Keep slot width stable to the widest word so "Lets" doesn't shift */}
      {words.map((word) => (
        <span
          key={`measure-${word}`}
          className="invisible col-start-1 row-start-1 whitespace-nowrap"
          aria-hidden
        >
          {word}
        </span>
      ))}

      {/* Single-line viewport: fixed line box + overflow clip */}
      <span className="relative col-start-1 row-start-1 block h-[1.28em] overflow-hidden leading-[1.28]">
        <AnimatePresence initial={false}>
          <motion.span
            key={words[index]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-x-0 top-0 whitespace-nowrap will-change-transform"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function CohesionWordmark() {
  return (
    <div
      className="relative -mx-4 w-[calc(100%+2rem)] overflow-hidden leading-none sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]"
      style={{
        // viewBox height 220 → show top 2/3 only, flush to page bottom
        aspectRatio: "1200 / 146.6667",
        marginBottom: 0,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 220"
        className="pointer-events-none absolute left-0 top-0 block h-[150%] w-full"
        preserveAspectRatio="none"
      >
        {/* Inset so glyph side-bearings (especially C / N) are not clipped */}
        <text
          x="24"
          y="200"
          fill="#0B0C0F"
          fontFamily="var(--font-inter), Inter, system-ui, sans-serif"
          fontSize="220"
          fontWeight="800"
          textLength="1152"
          lengthAdjust="spacingAndGlyphs"
        >
          COHESION
        </text>
      </svg>
    </div>
  );
}

type ContactSectionProps = {
  onInViewChange?: (inView: boolean) => void;
};

// Dot sits just past the pointer tip; pill stays beside the hand cursor.
const DOT_OFFSET_X = 10;
const DOT_OFFSET_Y = 14;
const PILL_OFFSET_X = 18;
const PILL_OFFSET_Y = 22;

export default function ContactSection({
  onInViewChange,
}: ContactSectionProps) {
  const [cursorMounted, setCursorMounted] = useState(false);
  const [cursorInSection, setCursorInSection] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const isPillRef = useRef(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorLeft = useSpring(cursorX, {
    stiffness: 280,
    damping: 26,
    mass: 0.45,
  });
  const cursorTop = useSpring(cursorY, {
    stiffness: 280,
    damping: 26,
    mass: 0.45,
  });

  const { ref, inView } = useInView({
    threshold: 0.45,
    rootMargin: "-5% 0px -5% 0px",
  });

  const isPill = Boolean(cursorLabel);
  const showContactCursor = cursorInSection;

  useEffect(() => {
    isPillRef.current = isPill;
  }, [isPill]);

  useEffect(() => {
    onInViewChange?.(inView);
  }, [inView, onInViewChange]);

  useEffect(() => {
    setCursorMounted(true);
  }, []);

  const isDesktopCursor = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  const setCursorPosition = (
    clientX: number,
    clientY: number,
    pill: boolean,
    jump = false,
  ) => {
    const x = clientX + (pill ? PILL_OFFSET_X : DOT_OFFSET_X);
    const y = clientY + (pill ? PILL_OFFSET_Y : DOT_OFFSET_Y);
    if (jump) {
      cursorX.jump(x);
      cursorY.jump(y);
      return;
    }
    cursorX.set(x);
    cursorY.set(y);
  };

  const handleSectionPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!isDesktopCursor()) return;
    setCursorInSection(true);
    setCursorPosition(event.clientX, event.clientY, isPillRef.current, true);
  };

  const handleSectionPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!isDesktopCursor()) return;
    if (!cursorInSection) setCursorInSection(true);
    setCursorPosition(event.clientX, event.clientY, isPillRef.current);
  };

  const handleSectionPointerLeave = () => {
    setCursorInSection(false);
    setCursorLabel(null);
    isPillRef.current = false;
  };

  const handleLinkPointerEnter = (
    event: PointerEvent<HTMLAnchorElement>,
    label: string,
  ) => {
    if (!isDesktopCursor()) return;
    setCursorInSection(true);
    isPillRef.current = true;
    setCursorLabel(label);
    setCursorPosition(event.clientX, event.clientY, true);
  };

  const handleLinkPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!isDesktopCursor()) return;
    setCursorPosition(event.clientX, event.clientY, true);
  };

  const handleLinkPointerLeave = (event: PointerEvent<HTMLAnchorElement>) => {
    isPillRef.current = false;
    setCursorLabel(null);
    if (cursorInSection) {
      setCursorPosition(event.clientX, event.clientY, false);
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      onPointerEnter={handleSectionPointerEnter}
      onPointerMove={handleSectionPointerMove}
      onPointerLeave={handleSectionPointerLeave}
      className="relative flex min-h-dvh scroll-mt-0 flex-col overflow-x-clip bg-white px-4 pb-0 pt-28 sm:px-6 sm:pt-32 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <div className="flex w-full flex-col gap-12 sm:gap-16">
          <ScrollReveal>
            <h2
              data-nav-focus
              className="font-inter relative text-[clamp(2.75rem,8vw,5.9375rem)] font-semibold leading-[1.05] tracking-tight"
            >
              <span className="flex flex-wrap items-baseline gap-x-[0.1em] text-[#0B0C0F]">
                <span>Lets</span>
                <span className="relative inline-flex">
                  {/* Figma 346:2497 — top-right of the rolling verb */}
                  <GetInTouchBubble className="absolute bottom-[calc(100%+0.08em)] left-[92%] z-10" />
                  <RollingHeadlineWord words={rollingWords} active={inView} />
                </span>
              </span>
              <span className="block text-[#9FA7B7]">
                incredible work together.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollRevealGroup
            className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            stagger={0.1}
            delayChildren={0.08}
          >
            {contactDetails.map((item) => (
              <ScrollRevealItem
                key={item.href}
                className="relative w-full min-w-0 sm:max-w-[281px]"
              >
                <p className="font-inter text-[20px] font-normal leading-none text-[#535B6B]">
                  {item.label}
                </p>
                <a
                  href={item.href}
                  onPointerEnter={(event) =>
                    handleLinkPointerEnter(event, item.cursorLabel)
                  }
                  onPointerMove={handleLinkPointerMove}
                  onPointerLeave={handleLinkPointerLeave}
                  className="font-inter mt-4 inline-block text-[24px] font-normal leading-none tracking-tight text-[#0B0C0F] transition-opacity hover:opacity-70"
                >
                  {item.value}
                </a>
                {item.showAvailabilityDoodle ? <AvailabilityDoodle /> : null}
              </ScrollRevealItem>
            ))}

            <ScrollRevealItem className="sm:self-center">
              <p className="font-inter shrink-0 text-[20px] font-normal leading-none text-black">
                © 2026 Cicel
              </p>
            </ScrollRevealItem>
          </ScrollRevealGroup>
        </div>
      </div>

      <ScrollReveal
        delay={0.18}
        className="relative mt-auto w-full shrink-0 overflow-hidden pt-8 pb-0 sm:pt-10"
      >
        <CohesionWordmark />
      </ScrollReveal>

      {cursorMounted
        ? createPortal(
            <motion.div
              className="pointer-events-none fixed z-40 hidden md:block"
              style={{
                top: cursorTop,
                left: cursorLeft,
              }}
              initial={false}
              animate={{
                opacity: showContactCursor ? 1 : 0,
                scale: showContactCursor ? 1 : 0.85,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div
                layout
                className={
                  isPill
                    ? "rounded-full bg-[#ff5117] px-5 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.1)]"
                    : "size-6 rounded-full bg-[#ff5117] shadow-[0_10px_28px_rgba(0,0,0,0.1)]"
                }
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.55,
                  },
                }}
              >
                {isPill ? (
                  <span className="font-inter block whitespace-nowrap text-[15px] font-semibold tracking-tight text-white">
                    {cursorLabel}
                  </span>
                ) : null}
              </motion.div>
            </motion.div>,
            document.body,
          )
        : null}
    </section>
  );
}
