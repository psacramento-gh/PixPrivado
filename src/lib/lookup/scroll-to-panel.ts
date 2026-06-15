const PANEL_SCROLL_OFFSET_PX = 16;

/** Scroll the window so `element` sits near the top of the viewport. */
export function scrollToPanelElement(
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; offset?: number },
): void {
  const behavior = options?.behavior ?? "auto";
  const offset = options?.offset ?? PANEL_SCROLL_OFFSET_PX;
  const top = window.scrollY + element.getBoundingClientRect().top - offset;

  window.scrollTo({
    top: Math.max(0, top),
    left: 0,
    behavior,
  });

  for (const container of findScrollableAncestors(element)) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const containerTop =
      container.scrollTop + (elementRect.top - containerRect.top) - offset;

    container.scrollTo({
      top: Math.max(0, containerTop),
      left: 0,
      behavior,
    });
  }
}

function findScrollableAncestors(element: HTMLElement): HTMLElement[] {
  const ancestors: HTMLElement[] = [];
  let parent = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      ancestors.push(parent);
    }
    parent = parent.parentElement;
  }

  return ancestors;
}

export const PANEL_SCROLL_RETRY_DELAYS_MS = {
  immediate: [0, 16] as const,
  afterExpand: [0, 50, 120, 240, 360] as const,
};

export const SANITIZE_SCROLL_RETRY_DELAYS_MS = [0, 50, 120, 240] as const;

/** Retry scrolling while layout settles (e.g. after QR preview swap). */
export function scrollElementIntoViewWithRetries(
  element: HTMLElement | null,
  options?: {
    behavior?: ScrollBehavior;
    delays?: readonly number[];
    offset?: number;
  },
): () => void {
  if (!element) return () => {};

  const behavior = options?.behavior ?? "smooth";
  const delays = options?.delays ?? SANITIZE_SCROLL_RETRY_DELAYS_MS;
  const timers: number[] = [];

  for (const delay of delays) {
    const timer = window.setTimeout(() => {
      scrollToPanelElement(element, { behavior, offset: options?.offset });
    }, delay);
    timers.push(timer);
  }

  return () => {
    for (const timer of timers) window.clearTimeout(timer);
  };
}
