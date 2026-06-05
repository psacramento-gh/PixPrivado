"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardCopy } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import {
  buildDecoderShareUrl,
  isDecoderShareUrlLong,
  truncateShareUrlForDisplay,
} from "@/lib/decoder/share-url";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShareDecoderLinkProps = {
  payload: string;
  locale: Locale;
};

export function ShareDecoderLink({ payload, locale }: ShareDecoderLinkProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildDecoderShareUrl(payload, window.location.origin);
  }, [payload]);

  const displayUrl = useMemo(
    () => (shareUrl ? truncateShareUrlForDisplay(shareUrl) : ""),
    [shareUrl],
  );

  const isLong = shareUrl ? isDecoderShareUrlLong(shareUrl) : false;

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

  if (!shareUrl) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        {t(locale, "shareLink")}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          readOnly
          value={displayUrl}
          aria-label={t(locale, "shareLink")}
          title={shareUrl}
          className="min-w-0 flex-1 font-mono text-xs"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 sm:self-stretch"
          onClick={() => void handleCopy()}
          aria-label={t(locale, "shareLinkCopy")}
        >
          <ClipboardCopy className="size-3.5 shrink-0" aria-hidden />
          {copied ? t(locale, "shareLinkCopied") : t(locale, "shareLinkCopy")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t(locale, "shareLinkHint")}</p>
      {isLong ? (
        <p className="text-xs text-muted-foreground" role="note">
          {t(locale, "shareLinkTooLong")}
        </p>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {copied ? t(locale, "shareLinkCopied") : ""}
      </span>
    </div>
  );
}
