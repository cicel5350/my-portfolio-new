"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type TypewriterProps = {
  texts: readonly string[];
  className?: string;
  /** When false, freezes on the current (or first) phrase */
  active?: boolean;
  /** Per-character typing delay in seconds */
  typeSpeed?: number;
  /** Hold time after a phrase is fully typed, in seconds */
  holdTime?: number;
  /** Per-character delete delay in seconds */
  deleteSpeed?: number;
  showCursor?: boolean;
  cursorChar?: string;
};

/**
 * Cycles through phrases with a type / hold / delete loop.
 * Adapted from the Originkit typewriter for this portfolio.
 */
export default function Typewriter({
  texts,
  className,
  active = true,
  typeSpeed = 0.07,
  holdTime = 1.5,
  deleteSpeed = 0.1,
  showCursor = true,
  cursorChar = "_",
}: TypewriterProps) {
  const list = texts.filter((t) => t.length > 0);
  const textsKey = list.join("\0");
  const typeDelayMs = Math.max(0, typeSpeed * 1000);
  const holdMs = Math.max(0, holdTime * 1000);
  const deleteDelayMs = Math.max(0, deleteSpeed * 1000);

  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsDeleting(false);
    setCurrentTextIndex(0);
  }, [textsKey]);

  useEffect(() => {
    if (!active || list.length === 0) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const currentText = list[currentTextIndex] ?? "";

    if (isDeleting) {
      if (displayText.length === 0) {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % list.length);
          setCurrentIndex(0);
        }, 200);
      } else {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deleteDelayMs);
      }
    } else if (currentIndex < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + (currentText[currentIndex] ?? ""));
        setCurrentIndex((prev) => prev + 1);
      }, typeDelayMs);
    } else if (list.length > 1) {
      timeout = setTimeout(() => setIsDeleting(true), holdMs);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // list content is tracked via textsKey / currentTextIndex; avoid depending on
    // a freshly allocated array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    currentIndex,
    displayText,
    isDeleting,
    typeDelayMs,
    deleteDelayMs,
    holdMs,
    currentTextIndex,
    textsKey,
  ]);

  const longest = list.reduce(
    (a, b) => (a.length >= b.length ? a : b),
    list[0] ?? "",
  );

  return (
    <span className={`relative inline-grid text-left ${className ?? ""}`}>
      <span
        className="invisible col-start-1 row-start-1 whitespace-pre-wrap"
        aria-hidden
      >
        {longest}
      </span>
      <span
        className="col-start-1 row-start-1 whitespace-pre-wrap"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayText}
        {showCursor ? (
          <motion.span
            className="ml-0.5 inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.01,
              repeat: Infinity,
              repeatDelay: 0.4,
              repeatType: "reverse",
            }}
          >
            {cursorChar}
          </motion.span>
        ) : null}
      </span>
    </span>
  );
}
