"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowDown } from "lucide-react";
import AboutSection from "@/components/AboutSection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import ContactSection from "@/components/ContactSection";
import HeroAvatarCard from "@/components/HeroAvatarCard";
import ProjectsSection from "@/components/ProjectsSection";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav, { scrollToNavTarget } from "@/components/SiteNav";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
] as const;

const roles = [
  "Branding",
  "Collaborative Team Player",
  "UI/UX Designer",
  "Product Design",
  "Vibe Coding",
] as const;

const floatingShapes = [
  {
    src: "/3.png",
    position:
      "absolute left-[-4%] top-[-2%] z-[1] w-[8.4rem] sm:w-[11.55rem] md:w-[12.6rem]",
    duration: 5.4,
    delay: 0.6,
    baseRotate: 14,
  },
  {
    src: "/球.png",
    position:
      "absolute left-[-4%] top-[36%] z-[1] w-[8.4rem] sm:w-[11.55rem] md:w-[12.6rem]",
    duration: 5.1,
    delay: 0.4,
  },
  {
    src: "/圆柱体.png",
    position:
      "absolute bottom-[-2%] left-[2%] z-[1] w-[10.5rem] sm:w-[12.6rem] md:w-[14.7rem]",
    duration: 4.8,
    delay: 0.8,
    baseRotate: -22,
  },
  {
    src: "/star.png",
    position:
      "absolute right-[0%] top-[-4%] z-[1] w-[9.45rem] sm:w-[11.55rem] md:w-[13.65rem]",
    duration: 3.9,
    delay: 0.2,
  },
  {
    src: "/2.png",
    position:
      "absolute right-[-4%] top-[36%] z-[1] w-[9.45rem] sm:w-[11.55rem] md:w-[12.6rem]",
    duration: 4.5,
    delay: 1,
    baseRotate: 18,
  },
  {
    src: "/01.png",
    position:
      "absolute bottom-[0%] right-[1%] z-[1] w-[9.45rem] sm:w-[11.55rem] md:w-[13.65rem]",
    duration: 4.2,
    delay: 0,
  },
] as const;

const clientAvatars = [
  { src: "/头像1.png", alt: "Client 1" },
  { src: "/头像2.png", alt: "Client 2" },
  { src: "/头像3.png", alt: "Client 3" },
] as const;

const marqueeText = "CICEL BRONX";

export default function Home() {
  type NavLabel = (typeof navItems)[number]["label"];
  const [activeItem, setActiveItem] = useState<NavLabel>("Home");
  const [lockedNav, setLockedNav] = useState<NavLabel | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [aboutInView, setAboutInView] = useState(false);
  const [capabilitiesInView, setCapabilitiesInView] = useState(false);
  const [projectsInView, setProjectsInView] = useState(false);
  const [contactInView, setContactInView] = useState(false);
  const [marqueeReady, setMarqueeReady] = useState(false);

  const heroRef = useRef<HTMLElement | null>(null);
  const avatarSlotRef = useRef<HTMLDivElement | null>(null);
  const avatarCardRef = useRef<HTMLDivElement | null>(null);
  const { ref: homeInViewRef, inView: homeInView } = useInView({
    threshold: 0.35,
    rootMargin: "-15% 0px -35% 0px",
  });

  const setHeroRef = useCallback(
    (node: HTMLElement | null) => {
      heroRef.current = node;
      homeInViewRef(node);
    },
    [homeInViewRef],
  );

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Soft AE-like easing: spring-smooth scroll values for silky back-and-forth
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.35,
    restDelta: 0.001,
  });

  // Leave faster than normal scroll so these clear the viewport before About
  const shapesY = useTransform(smoothProgress, [0, 1], [0, -520]);
  const copyY = useTransform(smoothProgress, [0, 1], [0, -320]);
  const avatarY = useTransform(smoothProgress, [0, 1], [0, -400]);

  // Pin marquee strip to the avatar slot (layout box only — no scroll parallax).
  // Stay invisible until the first real measure so we never flash top:50% then jump.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const slot = avatarSlotRef.current;
    const card = avatarCardRef.current;
    if (!hero || !slot) return;

    let revealed = false;
    let trackRaf = 0;
    let tracking = true;

    const syncMarquee = () => {
      const heroRect = hero.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      const height = card?.offsetHeight || slot.offsetHeight || 300;
      const top =
        slotRect.top -
        heroRect.top +
        (slot.offsetHeight - height) / 2;

      hero.style.setProperty("--hero-marquee-top", `${top}px`);
      hero.style.setProperty("--hero-marquee-height", `${height}px`);

      if (!revealed) {
        revealed = true;
        setMarqueeReady(true);
      }
    };

    syncMarquee();

    // Keep locking to the slot while ScrollReveal / fonts settle (avoids a late jump)
    const track = () => {
      syncMarquee();
      if (tracking) trackRaf = window.requestAnimationFrame(track);
    };
    trackRaf = window.requestAnimationFrame(track);

    const stopTrackId = window.setTimeout(() => {
      tracking = false;
      window.cancelAnimationFrame(trackRaf);
      syncMarquee();
    }, 900);

    const observer = new ResizeObserver(syncMarquee);
    observer.observe(hero);
    observer.observe(slot);
    if (card) observer.observe(card);
    window.addEventListener("resize", syncMarquee);

    return () => {
      tracking = false;
      window.cancelAnimationFrame(trackRaf);
      window.clearTimeout(stopTrackId);
      observer.disconnect();
      window.removeEventListener("resize", syncMarquee);
    };
  }, []);

  const handleAboutInView = useCallback((inView: boolean) => {
    setAboutInView(inView);
  }, []);

  const handleCapabilitiesInView = useCallback((inView: boolean) => {
    setCapabilitiesInView(inView);
  }, []);

  const handleProjectsInView = useCallback((inView: boolean) => {
    setProjectsInView(inView);
  }, []);

  const handleContactInView = useCallback((inView: boolean) => {
    setContactInView(inView);
  }, []);

  const handleNavNavigate = useCallback((label: string) => {
    const next = label as NavLabel;
    setLockedNav(next);
    setActiveItem(next);
  }, []);

  useEffect(() => {
    if (!lockedNav) return;
    const timer = window.setTimeout(() => setLockedNav(null), 1200);
    return () => window.clearTimeout(timer);
  }, [lockedNav]);

  useEffect(() => {
    if (lockedNav) {
      const arrived =
        (lockedNav === "Home" && homeInView) ||
        (lockedNav === "About" && aboutInView) ||
        (lockedNav === "Capabilities" && capabilitiesInView) ||
        (lockedNav === "Projects" && projectsInView) ||
        (lockedNav === "Contact" && contactInView);

      if (arrived) {
        setLockedNav(null);
      }
      return;
    }

    if (contactInView) {
      setActiveItem("Contact");
    } else if (projectsInView) {
      setActiveItem("Projects");
    } else if (capabilitiesInView) {
      setActiveItem("Capabilities");
    } else if (aboutInView) {
      setActiveItem("About");
    } else if (homeInView) {
      setActiveItem("Home");
    }
  }, [
    aboutInView,
    capabilitiesInView,
    contactInView,
    homeInView,
    lockedNav,
    projectsInView,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % roles.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SiteNav
        items={navItems}
        activeItem={activeItem}
        onNavigate={handleNavNavigate}
      />

      <section
        id="home"
        ref={setHeroRef}
        className="relative flex min-h-[calc(100vh-5rem)] scroll-mt-28 items-center justify-center overflow-hidden px-4 pb-44 pt-6 sm:pb-52 sm:pt-10 lg:pb-64"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-0 flex items-center overflow-hidden transition-opacity duration-200 ease-out"
          style={{
            top: "var(--hero-marquee-top, 0px)",
            height: "var(--hero-marquee-height, 300px)",
            opacity: marqueeReady ? 1 : 0,
            visibility: marqueeReady ? "visible" : "hidden",
          }}
        >
          <motion.div
            className="flex h-full items-center whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 55 }}
          >
            {[0, 1].map((copy) => (
              <span
                key={copy}
                className="inline-block pr-8 select-none font-black leading-none tracking-tighter text-black"
                style={{
                  fontSize: "var(--hero-marquee-height, 300px)",
                }}
              >
                {`${marqueeText} ${marqueeText} ${marqueeText} `}
              </span>
            ))}
          </motion.div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[calc(50%-70px)] z-[1] h-[32rem] w-[min(100vw,30rem)] -translate-x-1/2 -translate-y-1/2 sm:h-[42rem] sm:w-[50rem] md:h-[46rem] md:w-[58rem]"
        >
          <motion.div
            style={{ y: shapesY }}
            className="relative h-full w-full will-change-transform transform-gpu"
          >
            {floatingShapes.map((shape) => {
              const baseRotate = "baseRotate" in shape ? shape.baseRotate : 0;

              return (
                <div key={shape.src} className={shape.position}>
                  <motion.div
                    animate={{
                      y: [-12, 12, -12],
                      rotate: [
                        baseRotate,
                        baseRotate + 8,
                        baseRotate - 8,
                        baseRotate,
                      ],
                    }}
                    transition={{
                      duration: shape.duration,
                      delay: shape.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src={shape.src}
                      alt=""
                      width={220}
                      height={220}
                      className="h-auto w-full"
                    />
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div
          className="relative z-10 flex w-full max-w-3xl translate-y-[30px] flex-col items-center text-center"
          data-nav-focus
        >
          <motion.div
            style={{ y: copyY }}
            className="flex w-full flex-col items-center will-change-transform transform-gpu"
          >
            <div className="-translate-y-2 flex w-full flex-col items-center">
            <ScrollReveal>
              <h1 className="font-inter text-[48px] font-semibold leading-tight tracking-tight text-black">
                Hi, I&apos;m{" "}
                <span className="font-display text-[48px] font-bold italic">
                  Cicel!
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.08} className="w-full">
              <div className="relative mt-2 flex h-7 w-full items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={roles[roleIndex]}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="font-inter absolute text-[20px] font-normal text-[#9ca3af]"
                  >
                    {roles[roleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </ScrollReveal>
            </div>
          </motion.div>

          <ScrollReveal delay={0.12} className="w-full">
            <div
              ref={avatarSlotRef}
              className="relative mt-3 flex w-full items-center justify-center sm:mt-4"
            >
              <motion.div
                style={{ y: avatarY }}
                className="relative z-10 flex w-full items-center justify-center will-change-transform transform-gpu"
              >
                <HeroAvatarCard ref={avatarCardRef} heroRef={heroRef} />
              </motion.div>
            </div>
          </ScrollReveal>

          <div className="flex w-full flex-col items-center">
            <ScrollReveal delay={0.18}>
              <div className="relative z-10 mt-8 flex items-center gap-3 sm:mt-10">
                <div className="flex items-center -space-x-2.5">
                  {clientAvatars.map((client) => (
                    <div
                      key={client.alt}
                      className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow-sm sm:h-9 sm:w-9"
                    >
                      <Image
                        src={client.src}
                        alt={client.alt}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="font-inter text-sm font-medium text-[#6b7280] sm:text-[15px]">
                  80+ Happy Clients
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.24}>
              <motion.a
                href="#contact"
                data-pause-avatar-follow
                onClick={(event) => {
                  event.preventDefault();
                  scrollToNavTarget("#contact");
                  history.pushState(null, "", "#contact");
                }}
                className="font-inter group relative z-10 mt-5 inline-flex h-[4.625rem] items-center overflow-hidden rounded-full border-[5px] border-[#EFF0FF] bg-white pl-8 text-xl font-bold text-black shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-none sm:mt-6 sm:h-[5.125rem] sm:pl-10 sm:text-2xl"
              >
                <span className="pr-8 transition-[padding] duration-300 ease-out group-hover:pr-3 sm:pr-10 sm:group-hover:pr-4">
                  Let&apos;s Work Together!
                </span>
                <span className="flex h-full w-0 shrink-0 items-center overflow-hidden transition-[width] duration-500 ease-out group-hover:w-16 sm:group-hover:w-[4.5rem]">
                  <span className="flex size-16 shrink-0 translate-x-full rotate-[240deg] items-center justify-center rounded-full bg-black transition-transform duration-500 ease-in-out group-hover:translate-x-0 group-hover:rotate-0 sm:size-[4.5rem]">
                    <ArrowDown
                      className="h-7 w-7 text-white sm:h-8 sm:w-8"
                      strokeWidth={1.5}
                    />
                  </span>
                </span>
              </motion.a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-88 sm:gap-[26rem] lg:gap-[32rem]">
        <AboutSection onInViewChange={handleAboutInView} />
        <CapabilitiesSection onInViewChange={handleCapabilitiesInView} />
        <ProjectsSection onInViewChange={handleProjectsInView} />
      </div>
      <ContactSection onInViewChange={handleContactInView} />
    </div>
  );
}
