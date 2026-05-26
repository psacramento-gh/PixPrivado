"use client";

import { useEffect, useRef, useState } from "react";
import {
  denormalizeQrCorners,
  type NormalizedQrCorners,
  type QrCorners,
  type QrPoint,
} from "@/lib/qr/decode-image";
import { loadOrientedBitmapFromUrl } from "@/lib/qr/load-oriented-bitmap";

const MAX_DISPLAY_HEIGHT = 288; // max-h-72

function scaleCorners(corners: QrCorners, scaleX: number, scaleY: number): QrPoint[] {
  const { topLeft, topRight, bottomRight, bottomLeft } = corners;
  return [topLeft, topRight, bottomRight, bottomLeft].map((p) => ({
    x: p.x * scaleX,
    y: p.y * scaleY,
  }));
}

function drawHighlight(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  normalizedCorners: NormalizedQrCorners,
  displayWidth: number,
  displayHeight: number,
) {
  const naturalWidth = bitmap.width;
  const naturalHeight = bitmap.height;
  const corners = denormalizeQrCorners(
    normalizedCorners,
    naturalWidth,
    naturalHeight,
  );
  const scaleX = displayWidth / naturalWidth;
  const scaleY = displayHeight / naturalHeight;
  const pts = scaleCorners(corners, scaleX, scaleY);

  ctx.drawImage(bitmap, 0, 0, displayWidth, displayHeight);

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.rect(0, 0, displayWidth, displayHeight);
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.closePath();
  ctx.fill("evenodd");
  ctx.restore();

  const strokeWidth = Math.max(2, displayWidth * 0.004);
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

function computeDisplaySize(bitmap: ImageBitmap): {
  width: number;
  height: number;
} {
  const maxWidth =
    typeof window !== "undefined" ? Math.min(bitmap.width, window.innerWidth - 48) : bitmap.width;
  const scale = Math.min(1, MAX_DISPLAY_HEIGHT / bitmap.height, maxWidth / bitmap.width);
  return {
    width: Math.max(1, Math.round(bitmap.width * scale)),
    height: Math.max(1, Math.round(bitmap.height * scale)),
  };
}

type QrImagePreviewProps = {
  url: string;
  normalizedCorners: NormalizedQrCorners;
  caption: string;
};

export function QrImagePreview({
  url,
  normalizedCorners,
  caption,
}: QrImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let bitmap: ImageBitmap | null = null;

    setStatus("loading");

    void (async () => {
      try {
        bitmap = await loadOrientedBitmapFromUrl(url);
        if (cancelled) return;

        const { width, height } = computeDisplaySize(bitmap);
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setStatus("error");
          return;
        }

        drawHighlight(ctx, bitmap, normalizedCorners, width, height);
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      } finally {
        bitmap?.close();
      }
    })();

    return () => {
      cancelled = true;
      bitmap?.close();
    };
  }, [url, normalizedCorners]);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-medium text-muted-foreground">
        {caption}
      </figcaption>
      <div className="w-fit max-w-full overflow-hidden rounded-lg border bg-muted/30">
        <canvas
          ref={canvasRef}
          className={
            status === "ready"
              ? "block max-h-72 max-w-full"
              : "hidden"
          }
          role="img"
          aria-label={caption}
        />
        {status === "loading" ? (
          <div
            className="h-40 w-56 max-w-full animate-pulse bg-muted/50"
            aria-busy="true"
            aria-label={caption}
          />
        ) : null}
        {status === "error" ? (
          <p className="px-3 py-2 text-xs text-muted-foreground" role="status">
            {caption}
          </p>
        ) : null}
      </div>
    </figure>
  );
}
