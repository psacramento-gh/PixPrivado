export const APP_MOTION_EASE = [0.25, 0.1, 0.25, 1] as const;

export const APP_MOTION_DURATION = 0.22;

export const APP_MOTION_REDUCED_DURATION = 0.12;

export function appMotionTransition(prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion) {
    return { duration: APP_MOTION_REDUCED_DURATION };
  }
  return { duration: APP_MOTION_DURATION, ease: APP_MOTION_EASE };
}

export function appPanelBodyTransition(prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion) {
    return {
      height: { duration: 0 },
      opacity: { duration: APP_MOTION_REDUCED_DURATION },
    };
  }
  return {
    height: { duration: APP_MOTION_DURATION, ease: APP_MOTION_EASE },
    opacity: { duration: APP_MOTION_DURATION, ease: APP_MOTION_EASE },
  };
}
