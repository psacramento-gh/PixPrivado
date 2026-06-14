"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import {
  buildDecoderShareUrl,
  truncateShareUrlForDisplay,
} from "@/lib/decoder/share-url";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ShareDecoderLinkProps = {
  payload: string;
  locale: Locale;
  enabled: boolean;
  className?: string;
};

export function ShareDecoderLink({
  payload,
  locale,
  enabled,
  className,
}: ShareDecoderLinkProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareUrl = useMemo(() => {
    if (!enabled || typeof window === "undefined") return "";
    return buildDecoderShareUrl(payload, window.location.origin);
  }, [enabled, payload]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;

    let success = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      success = true;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }
    if (!success) return;

    setCopied(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (!enabled || !shareUrl) return null;

  const displayUrl = truncateShareUrlForDisplay(shareUrl);

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="flex h-9 w-full min-w-0 items-stretch overflow-hidden rounded-lg border bg-muted/40">
        <p
          className="flex min-w-0 flex-1 items-center truncate px-4 font-mono text-xs text-muted-foreground"
          title={shareUrl}
        >
          {displayUrl}
        </p>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 border-l border-border px-4 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-muted/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          onClick={() => void handleCopy()}
          aria-label={t(locale, "shareLinkCopy")}
        >
          {copied ? (
            <Check
              className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
          ) : (
            <Link2 className="size-3.5 shrink-0" aria-hidden />
          )}
          {copied ? t(locale, "shareLinkCopied") : t(locale, "shareLinkCopy")}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? t(locale, "shareLinkCopied") : ""}
      </span>
    </div>
  );
}
