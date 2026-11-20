"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ONBOARDING_SLIDES } from "@/data/onboarding";
import { useRecovery } from "@/context/RecoveryContext";

const AUTO_ADVANCE_MS = 5000;
const SWIPE_DISTANCE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 350;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -48 : 48,
    opacity: 0,
  }),
};

const slideTransition = {
  x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  opacity: { duration: 0.45, ease: "easeOut" as const },
};

export default function WelcomeFlow() {
  const router = useRouter();
  const { user } = useRecovery();
  const [[currentIndex, direction], setSlideState] = useState<[number, number]>([
    0, 1,
  ]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const totalSlides = ONBOARDING_SLIDES.length;
  const isLastSlide = currentIndex === totalSlides - 1;
  const activeSlide = ONBOARDING_SLIDES[currentIndex];

  const goToSlide = useCallback(
    (nextIndex: number, isUserAction = true) => {
      if (isUserAction) {
        setHasInteracted(true);
      }
      if (nextIndex < 0 || nextIndex >= totalSlides || nextIndex === currentIndex) {
        return;
      }
      const nextDirection = nextIndex > currentIndex ? 1 : -1;
      setSlideState([nextIndex, nextDirection]);
    },
    [currentIndex, totalSlides]
  );

  const handleNext = useCallback(() => {
    setHasInteracted(true);
    if (isLastSlide) {
      if (user?.isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/signup");
      }
      return;
    }
    setSlideState(([prev]) => [Math.min(prev + 1, totalSlides - 1), 1]);
  }, [isLastSlide, router, totalSlides, user?.isAuthenticated]);

  const handlePrev = useCallback(() => {
    setHasInteracted(true);
    setSlideState(([prev]) => {
      if (prev <= 0) return [prev, -1];
      return [prev - 1, -1];
    });
  }, []);

  const handleSkip = useCallback(() => {
    setHasInteracted(true);
    router.push("/dashboard");
  }, [router]);

  // Gentle 5-second auto-advance that pauses permanently once the user interacts
  useEffect(() => {
    if (hasInteracted || isLastSlide) return;

    const timer = window.setTimeout(() => {
      setSlideState(([prev]) => {
        if (prev >= totalSlides - 1) return [prev, 1];
        return [prev + 1, 1];
      });
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [currentIndex, hasInteracted, isLastSlide, totalSlides]);

  // Keyboard navigation support (ArrowLeft / ArrowRight)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        if (!isLastSlide) {
          handleNext();
        }
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev, isLastSlide]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    const swipedLeft =
      offset.x < -SWIPE_DISTANCE_THRESHOLD ||
      velocity.x < -SWIPE_VELOCITY_THRESHOLD;
    const swipedRight =
      offset.x > SWIPE_DISTANCE_THRESHOLD ||
      velocity.x > SWIPE_VELOCITY_THRESHOLD;

    if (swipedLeft && !isLastSlide) {
      handleNext();
    } else if (swipedRight && currentIndex > 0) {
      handlePrev();
    }
  };

  return (
    <main className="relative flex h-[100dvh] w-full flex-col justify-between overflow-hidden overscroll-none bg-white px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2.75rem,env(safe-area-inset-bottom))] select-none sm:px-12">
      {/* Top Bar: Subtle Skip on Slides 1 & 2 */}
      <header className="flex h-11 w-full items-center justify-end">
        <AnimatePresence>
          {!isLastSlide && (
            <motion.button
              type="button"
              onClick={handleSkip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="cursor-pointer px-2 py-1.5 font-serif text-base font-bold italic text-[#FF5A00]/55 transition-colors hover:text-[#FF5A00] focus:outline-none focus-visible:underline"
              aria-label="Skip onboarding"
            >
              Skip
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      {/* Center Stage: Swipeable Message */}
      <section
        aria-live="polite"
        aria-atomic="true"
        className="relative flex flex-1 items-center justify-center touch-none"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activeSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragStart={() => setHasInteracted(true)}
            onDragEnd={handleDragEnd}
            className="flex w-full max-w-lg cursor-grab items-center justify-center active:cursor-grabbing"
          >
            <h1 className="text-balance text-center font-serif text-[1.85rem] leading-[1.38] font-bold italic tracking-[-0.01em] text-[#FF5A00] sm:text-[2.25rem] md:text-[2.5rem]">
              {activeSlide.message}
            </h1>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom Area: Pagination Dots & Action Control */}
      <footer className="flex flex-col items-center gap-7">
        {/* Pagination Dots */}
        <nav
          aria-label="Onboarding progress"
          className="flex items-center justify-center gap-1"
        >
          {ONBOARDING_SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index, true)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? "step" : undefined}
                className="flex cursor-pointer items-center justify-center p-2 focus:outline-none"
              >
                <span
                  className={`block h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "scale-110 bg-[#FF5A00]"
                      : "bg-[#FF5A00]/25 hover:bg-[#FF5A00]/45"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Action Button: Fixed height container prevents vertical layout shift */}
        <div className="flex h-14 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {!isLastSlide ? (
              <motion.button
                key="next-button"
                type="button"
                onClick={handleNext}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                whileTap={{ scale: 0.96 }}
                className="cursor-pointer px-6 py-2 font-serif text-xl font-bold italic tracking-wide text-[#FF5A00] transition-opacity hover:opacity-80 focus:outline-none focus-visible:underline"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                key="ready-button"
                type="button"
                onClick={handleNext}
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer rounded-full bg-[#FF5A00] px-10 py-3.5 font-serif text-xl font-bold italic tracking-wide text-white transition-opacity hover:opacity-92 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                I&apos;m Ready
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </main>
  );
}
