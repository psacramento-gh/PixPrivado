"use client";

type QrDecodeOverlayProps = {
  previewUrl: string | null;
  statusLabel: string;
};

export function QrDecodeOverlay({ previewUrl, statusLabel }: QrDecodeOverlayProps) {
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

      <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-4 py-3 text-center text-sm text-muted-foreground">
        {statusLabel}
      </p>
    </div>
  );
}
