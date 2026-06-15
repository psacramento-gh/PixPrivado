"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type TopToastProps = {
  open: boolean;
  title: string;
  description?: string;
  durationMs?: number;
  onOpenChange?: (open: boolean) => void;
  icon?: React.ReactNode;
  className?: string;
};

export function TopToast({
  open,
  title,
  description,
  durationMs = 5_000,
  onOpenChange,
  icon,
  className,
}: TopToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || durationMs <= 0) return;
    const timer = window.setTimeout(() => onOpenChange?.(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onOpenChange]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="top-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg backdrop-blur-sm",
              className,
            )}
          >
            {icon ? (
              <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span>
            ) : null}
            <div className="min-w-0">
              <p className="font-medium text-foreground">{title}</p>
              {description ? (
                <p className="mt-0.5 text-pretty text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
