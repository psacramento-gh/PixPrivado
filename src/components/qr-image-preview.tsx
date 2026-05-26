"use client";

import { useId, useState } from "react";
import {
  denormalizeQrCorners,
  type NormalizedQrCorners,
  type QrCorners,
} from "@/lib/qr/decode-image";

function polygonPoints(corners: QrCorners): string {
  const { topLeft, topRight, bottomRight, bottomLeft } = corners;
  return [
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
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
  const maskId = useId().replace(/:/g, "");
  const [geometry, setGeometry] = useState<{
    naturalWidth: number;
    naturalHeight: number;
    corners: QrCorners;
  } | null>(null);

  const points = geometry ? polygonPoints(geometry.corners) : "";
  const strokeWidth = geometry
    ? Math.max(2, geometry.naturalWidth * 0.004)
    : 2;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-medium text-muted-foreground">
        {caption}
      </figcaption>
      <div className="relative inline-block max-w-full overflow-hidden rounded-lg border bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob URL from user upload */}
        <img
          src={url}
          alt=""
          className="block max-h-72 w-auto max-w-full"
          onLoad={(e) => {
            const img = e.currentTarget;
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            if (!naturalWidth || !naturalHeight) return;
            setGeometry({
              naturalWidth,
              naturalHeight,
              corners: denormalizeQrCorners(
                normalizedCorners,
                naturalWidth,
                naturalHeight,
              ),
            });
          }}
        />
        {geometry ? (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${geometry.naturalWidth} ${geometry.naturalHeight}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <mask id={maskId}>
                <rect
                  width={geometry.naturalWidth}
                  height={geometry.naturalHeight}
                  fill="white"
                />
                <polygon points={points} fill="black" />
              </mask>
            </defs>
            <rect
              width={geometry.naturalWidth}
              height={geometry.naturalHeight}
              fill="rgba(0,0,0,0.45)"
              mask={`url(#${maskId})`}
            />
            <polygon
              points={points}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={strokeWidth}
            />
          </svg>
        ) : null}
      </div>
    </figure>
  );
}
