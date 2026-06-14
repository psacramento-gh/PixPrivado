"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { SAFE_FRAME_CLASS } from "@/lib/safety-frame-styles";

const MAX_PREVIEW_SIZE_PX = 280;

type SafeQrPreviewProps = {
  payload: string;
  caption: string;
  locale: Locale;
};

export function SafeQrPreview({ payload, caption, locale }: SafeQrPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStatus("loading");
    void QRCode.toCanvas(canvas, payload, {
      width: MAX_PREVIEW_SIZE_PX,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "pix-safe-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return (
    <figure className="flex w-full flex-col gap-2">
      <figcaption className="text-xs font-medium text-muted-foreground">
        {caption}
      </figcaption>
      <div
        ref={containerRef}
        className={`relative flex w-full justify-center overflow-hidden p-4 ${SAFE_FRAME_CLASS}`}
      >
        <canvas
          ref={canvasRef}
          className={status === "ready" ? "block max-w-full rounded-sm bg-white" : "hidden"}
          role="img"
          aria-label={caption}
        />
        {status === "loading" ? (
          <div
            className="size-[280px] max-w-full animate-pulse rounded-sm bg-muted/50"
            aria-busy="true"
            aria-label={caption}
          />
        ) : null}
        {status === "error" ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground" role="status">
            {caption}
          </p>
        ) : null}
        {status === "ready" ? (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            className="absolute right-3 bottom-3 h-auto gap-1 py-1 shadow-sm"
            onClick={handleDownload}
            aria-label={t(locale, "downloadQr")}
          >
            <Download className="size-3.5 shrink-0" aria-hidden />
            {t(locale, "downloadQr")}
          </Button>
        ) : null}
      </div>
    </figure>
  );
}
