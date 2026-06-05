"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardCopy } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import { buildDecoderShareUrl } from "@/lib/decoder/share-url";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type ShareDecoderLinkProps = {
  payload: string;
  locale: Locale;
  enabled: boolean;
};

export function ShareDecoderLink({ payload, locale, enabled }: ShareDecoderLinkProps) {
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

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-auto shrink-0 py-0.5"
        onClick={() => void handleCopy()}
        aria-label={t(locale, "shareLinkCopy")}
        title={shareUrl}
      >
        <ClipboardCopy className="size-3.5 shrink-0" aria-hidden />
        {copied ? t(locale, "shareLinkCopied") : t(locale, "shareLinkCopy")}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? t(locale, "shareLinkCopied") : ""}
      </span>
    </>
  );
}
