"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QrSourceFileName } from "@/components/qr-source-file-name";
import type { Locale } from "@/lib/brcode/labels";
import {
  denormalizeQrCorners,
  type NormalizedQrCorners,
  type QrCorners,
  type QrPoint,
} from "@/lib/qr/decode-image";
import { computeQrCropRect, mapPointIntoCrop } from "@/lib/qr/crop-region";
import { loadOrientedBitmapFromUrl } from "@/lib/qr/load-oriented-bitmap";

const MAX_PREVIEW_HEIGHT_PX = 420;

function cornersToPoints(corners: QrCorners): QrPoint[] {
  return [
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft,
  ];
}

function drawCroppedHighlight(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  corners: QrCorners,
  containerWidth: number,
) {
  const crop = computeQrCropRect(corners, bitmap.width, bitmap.height);
  const aspect = crop.height / crop.width;
  let displayWidth = Math.max(1, Math.floor(containerWidth));
  let displayHeight = Math.max(1, Math.round(displayWidth * aspect));

  if (displayHeight > MAX_PREVIEW_HEIGHT_PX) {
    displayHeight = MAX_PREVIEW_HEIGHT_PX;
    displayWidth = Math.max(1, Math.round(displayHeight / aspect));
  }

  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  const canvas = ctx.canvas;
  canvas.width = Math.round(displayWidth * dpr);
  canvas.height = Math.round(displayHeight * dpr);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  ctx.drawImage(
    bitmap,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    displayWidth,
    displayHeight,
  );

  const pts = cornersToPoints(corners).map((p) =>
    mapPointIntoCrop(p, crop, displayWidth, displayHeight),
  );

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.beginPath();
  ctx.rect(0, 0, displayWidth, displayHeight);
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.closePath();
  ctx.fill("evenodd");
  ctx.restore();

  const strokeWidth = Math.max(2, displayWidth * 0.006);
  const primary = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  ctx.strokeStyle = primary || "currentColor";
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.closePath();
  ctx.stroke();
}

type QrImagePreviewProps = {
  url: string;
  normalizedCorners: NormalizedQrCorners;
  caption: string;
  fileName?: string;
  locale: Locale;
};

export function QrImagePreview({
  url,
  normalizedCorners,
  caption,
  fileName,
  locale,
}: QrImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const cornersRef = useRef<QrCorners | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const redraw = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const bitmap = bitmapRef.current;
    const corners = cornersRef.current;
    if (!container || !canvas || !bitmap || !corners) return;

    const width = container.clientWidth;
    if (width < 1) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawCroppedHighlight(ctx, bitmap, corners, width);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let bitmap: ImageBitmap | null = null;

    setStatus("loading");
    bitmapRef.current = null;
    cornersRef.current = null;

    void (async () => {
      try {
        bitmap = await loadOrientedBitmapFromUrl(url);
        if (cancelled) return;

        cornersRef.current = denormalizeQrCorners(
          normalizedCorners,
          bitmap.width,
          bitmap.height,
        );
        bitmapRef.current = bitmap;
        bitmap = null;

        setStatus("ready");
        requestAnimationFrame(() => redraw());
      } catch {
        if (!cancelled) setStatus("error");
        bitmap?.close();
      }
    })();

    return () => {
      cancelled = true;
      bitmap?.close();
      bitmapRef.current?.close();
      bitmapRef.current = null;
      cornersRef.current = null;
    };
  }, [url, normalizedCorners, redraw]);

  useEffect(() => {
    if (status !== "ready") return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      redraw();
    });
    observer.observe(container);
    redraw();

    return () => observer.disconnect();
  }, [status, redraw]);

  return (
    <figure className="flex w-full flex-col gap-2">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="text-xs font-medium text-muted-foreground">{caption}</span>
        {fileName ? <QrSourceFileName name={fileName} locale={locale} /> : null}
      </figcaption>
      <div
        ref={containerRef}
        className="flex w-full justify-center overflow-hidden rounded-lg border bg-muted/30"
      >
        <canvas
          ref={canvasRef}
          className={status === "ready" ? "block max-w-full" : "hidden"}
          role="img"
          aria-label={caption}
        />
        {status === "loading" ? (
          <div
            className="aspect-[4/3] w-full animate-pulse bg-muted/50"
            aria-busy="true"
            aria-label={caption}
          />
        ) : null}
        {status === "error" ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground" role="status">
            {caption}
          </p>
        ) : null}
      </div>
    </figure>
  );
}
