"use client";

import { useEffect, type MouseEvent } from "react";
import { LayoutGroup, motion } from "framer-motion";

export type NavItem = {
  label: string;
  href: string;
};

type SiteNavProps = {
  items: readonly NavItem[];
  activeItem: string;
  onNavigate?: (label: string) => void;
};

function getStickyNavHeight() {
  const header = document.querySelector("header");
  return header?.getBoundingClientRect().height ?? 72;
}

/** Scroll section titles to ~120px below the sticky nav. Home/hero stays at top. */
export function scrollToNavTarget(href: string, behavior: ScrollBehavior = "smooth") {
  const id = href.replace(/^#/, "");
  if (!id) return;

  // Hero: always return to the top — do not re-frame content.
  if (id === "home") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const section = document.getElementById(id);
  if (!section) return;

  const focus =
    section.querySelector<HTMLElement>("[data-nav-focus]") ??
    section.querySelector<HTMLElement>("h1, h2") ??
    section;

  const navH = getStickyNavHeight();

  // About / Projects: pin the focus block to the visual center (below sticky nav).
  if (id === "about" || id === "projects") {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const rect = focus.getBoundingClientRect();
    const visualCenterFromTop = navH + (window.innerHeight - navH) / 2;
    const targetY = Math.max(
      0,
      rect.top + scrollTop + rect.height / 2 - visualCenterFromTop,
    );
    window.scrollTo({ top: targetY, behavior });
    return;
  }

  const titleGapBelowNav = 120;
  const topInView = navH + titleGapBelowNav;

  const focusAbsTop = focus.getBoundingClientRect().top + window.scrollY;
  const nextY = Math.max(0, focusAbsTop - topInView);

  window.scrollTo({ top: nextY, behavior });
}

export default function SiteNav({
  items,
  activeItem,
  onNavigate,
}: SiteNavProps) {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToNavTarget(hash, "auto");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    label: string,
    href: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    onNavigate?.(label);
    scrollToNavTarget(href);
    history.pushState(null, "", href);
  };

  return (
    <header className="sticky top-0 z-50 flex justify-center bg-white/70 px-4 py-4 backdrop-blur-md sm:py-5">
      <LayoutGroup id="site-nav">
        <nav
          aria-label="Main"
          className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-black/[0.04] bg-white px-1.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:gap-1 sm:px-2 sm:py-2"
        >
          {items.map((item) => {
            const isActive = item.label === activeItem;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) =>
                  handleNavClick(event, item.label, item.href)
                }
                className={`relative shrink-0 rounded-full px-3 py-2 text-center text-sm font-medium transition-colors sm:px-5 sm:py-2.5 sm:text-[15px] ${
                  isActive
                    ? "text-white"
                    : "text-[#4b5563] hover:text-[#111827]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-[#ff5117]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                      mass: 0.8,
                    }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </LayoutGroup>
    </header>
  );
}
