"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  APP_MOTION_DURATION,
  APP_MOTION_EASE,
  APP_MOTION_REDUCED_DURATION,
} from "@/lib/motion-presets";

export type DecoderPhase = "input" | "decoding-qr" | "results";

const phaseMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: APP_MOTION_DURATION, ease: APP_MOTION_EASE },
};

const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: APP_MOTION_REDUCED_DURATION },
};

export function DecoderPhaseTransition({
  phase,
  children,
}: {
  phase: DecoderPhase;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={phase}
        className="flex flex-col gap-6"
        {...(prefersReducedMotion ? reducedMotion : phaseMotion)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
