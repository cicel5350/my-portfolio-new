"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ScrollReveal from "@/components/ScrollReveal";

const folders = [
  {
    id: "uiux",
    index: "01",
    title: "UI/UX",
    color: "#F9DE8C",
    /** 1-based card index that is clickable */
    clickableCard: 2,
    backText:
      "从用户需求与产品目标出发，探索结构、交互与视觉之间的平衡。擅长将复杂的信息与业务逻辑转化为清晰、高效且易用的数字体验。",
    cards: [
      "/capabilities/folders/01/card01.png",
      "/capabilities/folders/01/card02.png",
    ],
  },
  {
    id: "aigc",
    index: "02",
    title: "AIGC",
    color: "#FFAEB6",
    clickableCard: 2,
    backText:
      "尝试将生成式 AI 融入设计流程，从灵感探索、视觉创作到内容生产，寻找人与智能工具协作的新可能。",
    cards: [
      "/capabilities/folders/02/card01.png",
      "/capabilities/folders/02/card02.png",
      "/capabilities/folders/02/card03.png",
    ],
  },
  {
    id: "motion",
    index: "03",
    title: "Motion",
    color: "#C9D857",
    clickableCard: 2,
    backText:
      "通过动态语言增强产品体验，让界面不仅“被使用”，也能传递情绪与反馈。关注微交互、转场和视觉节奏，为产品注入更多生命力。",
    cards: [
      "/capabilities/folders/03/card01.png",
      "/capabilities/folders/03/card02.png",
      "/capabilities/folders/03/card03.png",
    ],
  },
  {
    id: "illustration",
    index: "04",
    title: "illustration",
    color: "#D59BF7",
    clickableCard: 2,
    backText:
      "探索图形、色彩与视觉表达的可能性，用创意构建独特的视觉语言。将设计思考延伸到品牌表达、内容视觉和产品体验中。",
    cards: [
      "/capabilities/folders/04/card01.png",
      "/capabilities/folders/04/card02.png",
      "/capabilities/folders/04/card03.png",
    ],
  },
  {
    id: "ai-coding",
    index: "05",
    title: "Ai Coding",
    color: "#95D3F3",
    clickableCard: 2,
    backText:
      "探索设计与技术融合的新方式，借助 AI 工具快速验证想法、搭建原型，让创意从概念到实现变得更加高效。",
    cards: [
      "/capabilities/folders/05/card01.png",
      "/capabilities/folders/05/card02.png",
      "/capabilities/folders/05/card03.png",
    ],
  },
  {
    id: "trends",
    index: "06",
    title: "Trends",
    color: "#FFB75E",
    clickableCard: 2,
    backText:
      "持续观察设计与产品趋势，将灵感转化为可复用的视觉语言与体验策略。",
    cards: [
      "/capabilities/folders/06/card01.png",
      "/capabilities/folders/06/card02.png",
    ],
  },
] as const;

type FolderData = (typeof folders)[number];

const folderRows = [
  {
    rowClass: "capabilities-folders__row--1",
    hoverZIndex: 5,
    widths: ["50%", "50%"] as const,
    items: [folders[0], folders[1]] as const,
  },
  {
    rowClass: "capabilities-folders__row--2",
    hoverZIndex: 15,
    widths: ["45%", "55%"] as const,
    items: [folders[2], folders[3]] as const,
  },
  {
    rowClass: "capabilities-folders__row--3",
    hoverZIndex: 25,
    widths: ["55%", "45%"] as const,
    items: [folders[4], folders[5]] as const,
  },
] as const;

function PopCard({
  src,
  alt,
  rotate,
  x,
  active,
  clickable,
  onOpen,
}: {
  src: string | null;
  alt: string;
  rotate: number;
  x: number;
  active: boolean;
  clickable: boolean;
  onOpen?: () => void;
}) {
  return (
    <motion.div
      role={clickable ? "button" : undefined}
      tabIndex={clickable && active ? 0 : undefined}
      onClick={
        clickable && active
          ? (event) => {
              event.stopPropagation();
              onOpen?.();
            }
          : undefined
      }
      onKeyDown={
        clickable && active
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onOpen?.();
              }
            }
          : undefined
      }
      className={`folder-peek-card relative aspect-[3/4] w-[9.5rem] shrink-0 overflow-hidden rounded-[24px] bg-[#d8d8de] shadow-[0_12px_28px_rgba(0,0,0,0.18)] sm:w-[10.5rem] ${
        clickable && active ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
      }`}
      style={{ transformOrigin: "50% 100%" }}
      initial={false}
      animate={
        active
          ? clickable
            ? {
                opacity: 1,
                // Gentle bob to hint the card is interactive
                y: [-96, -108, -96],
                x,
                rotate,
                scale: 1,
              }
            : { opacity: 1, y: -96, x, rotate, scale: 1 }
          : { opacity: 0, y: 0, x: x * 0.3, rotate: rotate * 0.15, scale: 0.94 }
      }
      transition={
        active && clickable
          ? {
              y: {
                duration: 1.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.35,
              },
              opacity: { type: "spring", stiffness: 380, damping: 22, mass: 0.6 },
              x: { type: "spring", stiffness: 380, damping: 22, mass: 0.6 },
              rotate: { type: "spring", stiffness: 380, damping: 22, mass: 0.6 },
              scale: { type: "spring", stiffness: 380, damping: 22, mass: 0.6 },
            }
          : {
              type: "spring",
              stiffness: 380,
              damping: 22,
              mass: 0.6,
            }
      }
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="168px"
          unoptimized
          className="pointer-events-none object-cover"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,#ececf0_0%,#c8c8d0_100%)]" />
      )}
    </motion.div>
  );
}

function FlippedCardOverlay({
  folder,
  cardSrc,
  onClose,
}: {
  folder: FolderData;
  cardSrc: string | null;
  onClose: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const flipTimer = window.setTimeout(() => setFlipped(true), 280);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(flipTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative cursor-pointer rounded-[32px] p-6"
          style={{
            perspective: 1400,
            backgroundColor: "rgba(180, 194, 255, 0.2)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
          initial={{ opacity: 0, scale: 0.72, y: 48 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.86, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close card"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onClose();
            }
          }}
        >
          <motion.div
            className="relative h-[min(68vh,520px)] w-[min(78vw,360px)]"
            style={{ transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[24px] bg-[#d8d8de] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {cardSrc ? (
                <Image
                  src={cardSrc}
                  alt={`${folder.title} card`}
                  fill
                  sizes="360px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(150deg,#ececf0_0%,#c8c8d0_100%)]" />
              )}
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col rounded-[24px] bg-white px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <p
                className="font-roboto-mono text-sm font-medium"
                style={{ color: "#7F8798" }}
              >
                {folder.index}
              </p>
              <h3 className="font-inter mt-3 text-[28px] font-semibold tracking-tight text-black">
                {folder.title}
              </h3>
              <p
                className="font-inter mt-6 text-[15px] font-normal leading-7"
                style={{ color: "#707889" }}
              >
                {folder.backText}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

function CapabilityFolder({
  folder,
  hoverZIndex,
}: {
  folder: FolderData;
  hoverZIndex: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardCount = folder.cards.length;
  const clickableIndex = folder.clickableCard - 1;
  const spreads =
    cardCount === 3
      ? [
          { rotate: -16, x: -28 },
          { rotate: 2, x: 0 },
          { rotate: 16, x: 28 },
        ]
      : [
          { rotate: -14, x: -20 },
          { rotate: 14, x: 20 },
        ];

  return (
    <div
      className="relative h-full min-w-0 w-full"
      style={hovered || expanded ? { zIndex: hoverZIndex } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!expanded) setHovered(false);
      }}
    >
      {/*
        Anchor cards from the folder bottom so tops can peek out,
        but bottoms never spill past the folder edge.
      */}
      <div className="absolute inset-x-0 bottom-[10%] z-[1] flex items-end justify-center overflow-visible">
        {folder.cards.map((src, index) => {
          const clickable = index === clickableIndex;

          return (
            <div
              key={`${folder.id}-card-${index}`}
              className={index === 0 ? undefined : "-ml-[4.75rem] sm:-ml-[5.25rem]"}
              style={{ zIndex: index + 1 }}
            >
              <PopCard
                src={src}
                alt={`${folder.title} preview ${index + 1}`}
                rotate={spreads[index]?.rotate ?? 0}
                x={spreads[index]?.x ?? 0}
                active={hovered || expanded}
                clickable={clickable}
                onOpen={() => setExpanded(true)}
              />
            </div>
          );
        })}
      </div>

      <motion.div
        className="folder-card relative z-10 select-none"
        style={
          {
            "--folder-color": folder.color,
          } as CSSProperties
        }
        initial={false}
        animate={{ y: hovered || expanded ? -8 : 0 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 24,
          mass: 0.55,
        }}
      >
        <div className="folder-card__tab" aria-hidden />
        <div className="folder-card__body">
          <span className="folder-card__index">{folder.index}</span>
          <h3 className="folder-card__title">{folder.title}</h3>
        </div>
      </motion.div>

      {expanded ? (
        <FlippedCardOverlay
          folder={folder}
          cardSrc={folder.cards[clickableIndex] ?? null}
          onClose={() => {
            setExpanded(false);
            setHovered(false);
          }}
        />
      ) : null}
    </div>
  );
}

type CapabilitiesSectionProps = {
  onInViewChange?: (inView: boolean) => void;
};

export default function CapabilitiesSection({
  onInViewChange,
}: CapabilitiesSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    rootMargin: "-10% 0px -15% 0px",
  });

  useEffect(() => {
    onInViewChange?.(inView);
  }, [inView, onInViewChange]);

  return (
    <section
      id="capabilities"
      ref={ref}
      className="relative scroll-mt-28 overflow-x-clip bg-white px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12">
        <ScrollReveal className="flex w-full flex-col items-center gap-12">
          <h2
            data-nav-focus
            className="font-inter max-w-[794px] text-center text-[clamp(1.375rem,3.2vw,2.25rem)] font-normal leading-normal tracking-tight text-black"
          >
            “I design intelligent digital experiences that bridge creativity,
            technology, and human-centered thinking.”
          </h2>
          <div
            aria-hidden
            className="h-20 w-px shrink-0 bg-black"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="w-full">
          <div className="capabilities-folders">
            {folderRows.map((row) => (
              <div
                key={row.rowClass}
                className={`capabilities-folders__row ${row.rowClass}`}
              >
                {row.items.map((folder, colIndex) => (
                  <div
                    key={folder.id}
                    className="capabilities-folders__item"
                    style={{ width: row.widths[colIndex] }}
                  >
                    <CapabilityFolder
                      folder={folder}
                      hoverZIndex={row.hoverZIndex}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
