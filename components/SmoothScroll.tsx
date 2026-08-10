"use client";

import type { ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Passthrough only — native browser scrolling for max smoothness.
 * Lenis / scroll-parallax intentionally removed.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  return <>{children}</>;
}
