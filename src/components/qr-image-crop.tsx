"use client";

import { useCallback, useState } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { t, type MessageKey } from "@/lib/i18n";
import type { Locale } from "@/lib/brcode/labels";
import type { CropRect } from "@/lib/qr/decode-image";

const ASPECT = 1;
/** Minimum crop edge in displayed pixels (touch-friendly). */
const MIN_CROP_DISPLAY_PX = 80;

type QrImageCropProps = {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  locale: Locale;
  hintKey: MessageKey;
  error: string | null;
  decoding: boolean;
  onCancel: () => void;
  onDecode: (rect: CropRect) => void;
};

function centerSquareCrop(
  mediaWidth: number,
  mediaHeight: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 70,
      },
      ASPECT,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

function pixelCropToNatural(
  crop: PixelCrop,
  displayedWidth: number,
  displayedHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): CropRect {
  const scaleX = naturalWidth / displayedWidth;
  const scaleY = naturalHeight / displayedHeight;
  const x = Math.max(0, Math.floor(crop.x * scaleX));
  const y = Math.max(0, Math.floor(crop.y * scaleY));
  const width = Math.min(
    naturalWidth - x,
    Math.max(1, Math.floor(crop.width * scaleX)),
  );
  const height = Math.min(
    naturalHeight - y,
    Math.max(1, Math.floor(crop.height * scaleY)),
  );
  const size = Math.min(width, height);
  return { x, y, width: size, height: size };
}

export function QrImageCrop({
  imageUrl,
  naturalWidth,
  naturalHeight,
  locale,
  hintKey,
  error,
  decoding,
  onCancel,
  onDecode,
}: QrImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop>();
  const [displaySize, setDisplaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setDisplaySize({ width, height });
      setCrop(centerSquareCrop(width, height));
    },
    [],
  );

  const handleDecode = () => {
    if (!displaySize || !crop) return;
    const px =
      pixelCrop ??
      convertToPixelCrop(crop, displaySize.width, displaySize.height);
    if (!px.width || !px.height) return;
    onDecode(
      pixelCropToNatural(
        px,
        displaySize.width,
        displaySize.height,
        naturalWidth,
        naturalHeight,
      ),
    );
  };

  const canDecode = Boolean(crop && displaySize);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t(locale, hintKey)}</p>

      <div className="max-h-[min(60dvh,28rem)] overflow-auto rounded-lg border bg-muted/30">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setPixelCrop(c)}
          aspect={ASPECT}
          minWidth={MIN_CROP_DISPLAY_PX}
          minHeight={MIN_CROP_DISPLAY_PX}
          className="max-w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="max-h-[min(60dvh,28rem)] w-full object-contain"
            onLoad={onImageLoad}
            draggable={false}
          />
        </ReactCrop>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          size="lg"
          disabled={!canDecode || decoding}
          onClick={handleDecode}
          className="sm:flex-1"
        >
          {decoding ? t(locale, "decodingImage") : t(locale, "decodeCrop")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={decoding}
          onClick={onCancel}
        >
          {t(locale, "pickAnotherImage")}
        </Button>
      </div>
    </div>
  );
}
