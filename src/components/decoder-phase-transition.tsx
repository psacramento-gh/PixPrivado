"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export type DecoderPhase = "input" | "decoding-qr" | "results";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const phaseMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: EASE },
};

const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.12 },
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
