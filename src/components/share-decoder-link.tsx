"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import {
  buildDecoderShareUrl,
  truncateShareUrlForDisplay,
} from "@/lib/decoder/share-url";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
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
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground sm:text-right">
        {t(locale, "shareLink")}
      </p>
      <div className="flex overflow-hidden rounded-lg border bg-muted/40">
        <p
          className="min-w-0 flex-1 truncate px-3 py-2.5 font-mono text-xs text-muted-foreground"
          title={shareUrl}
        >
          {displayUrl}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto shrink-0 gap-1.5 rounded-none border-l px-3 py-2.5 hover:bg-muted/80"
          onClick={() => void handleCopy()}
          aria-label={t(locale, "shareLinkCopy")}
        >
          {copied ? (
            <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <Link2 className="size-3.5 shrink-0" aria-hidden />
          )}
          {copied ? t(locale, "shareLinkCopied") : t(locale, "shareLinkCopy")}
        </Button>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? t(locale, "shareLinkCopied") : ""}
      </span>
    </div>
  );
}
