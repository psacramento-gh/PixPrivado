"use client";

import { QrSourceFileName } from "@/components/qr-source-file-name";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/brcode/labels";

type QrDecodeOverlayProps = {
  previewUrl: string | null;
  statusLabel: string;
  fileName?: string;
  locale: Locale;
  cancelLabel?: string;
  onCancel?: () => void;
};

export function QrDecodeOverlay({
  previewUrl,
  statusLabel,
  fileName,
  locale,
  cancelLabel,
  onCancel,
}: QrDecodeOverlayProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border bg-muted/30"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={statusLabel}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob URL preview during client-side decode
        <img
          src={previewUrl}
          alt=""
          className="max-h-[min(420px,55dvh)] w-full object-contain opacity-55"
        />
      ) : (
        <div className="aspect-[4/3] w-full animate-pulse bg-muted/50" />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-background/35 backdrop-blur-[1px]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-4 sm:inset-6" aria-hidden>
        <span className="qr-decode-corner qr-decode-corner-tl" />
        <span className="qr-decode-corner qr-decode-corner-tr" />
        <span className="qr-decode-corner qr-decode-corner-bl" />
        <span className="qr-decode-corner qr-decode-corner-br" />
        <span className="qr-decode-scan-line" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-background/90 to-transparent px-4 py-3">
        {fileName ? (
          <QrSourceFileName name={fileName} locale={locale} className="pointer-events-auto" />
        ) : null}
        <p className="text-center text-sm text-muted-foreground">{statusLabel}</p>
        {onCancel && cancelLabel ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="pointer-events-auto"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
