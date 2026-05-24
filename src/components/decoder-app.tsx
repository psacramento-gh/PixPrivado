"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  buildSummary,
  detectQrKind,
  extractLocationUrls,
  hasPixGui,
} from "@/lib/brcode/analyze";
import {
  formatDisplayValue,
  getTagDescription,
  getTagLabel,
  type Locale,
} from "@/lib/brcode/labels";
import { flattenNodes, parseBrCode } from "@/lib/brcode/parse";
import { flattenJson } from "@/lib/json-flatten";
import { t, type MessageKey } from "@/lib/i18n";
import {
  decodeQrFromCropRect,
  decodeQrFromFile,
  loadImageDimensions,
  type CropRect,
} from "@/lib/qr/decode-image";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { DehashedValueLink } from "@/components/dehashed-value-link";
import {
  buildDehashedQueryForRow,
  rowHasDehashedLink,
} from "@/lib/dehashed/searchable-rows";
import { QrImageCrop } from "@/components/qr-image-crop";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Camera, ClipboardCopy, ClipboardPaste, ImageUp } from "lucide-react";

type LocationFetch = {
  url: string;
  status: "loading" | "ok" | "error";
  statusCode?: number;
  data?: unknown;
  error?: string;
};

const dropZoneClass =
  "border-input hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground transition-colors";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

type ImageSession = {
  file: File;
  url: string;
  width: number;
  height: number;
};

type ImagePhase = "none" | "loading" | "crop" | "done";

function isImageFile(file: File): boolean {
  if (file.type.startsWith("video/")) return false;
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

export function DecoderApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [rawPayload, setRawPayload] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageSubmitted, setImageSubmitted] = useState(false);
  const [imagePhase, setImagePhase] = useState<ImagePhase>("none");
  const [imageSession, setImageSession] = useState<ImageSession | null>(null);
  const [cropHintKey, setCropHintKey] = useState<MessageKey>("cropSelectArea");
  const [decodingImage, setDecodingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = useIsDesktop();

  const processPayload = useCallback((payload: string) => {
    setRawPayload(payload);
    setError(null);
  }, []);

  const clearImageSession = useCallback(() => {
    setImageSession((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  const beginImageFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!isImageFile(file)) {
        setError(t(locale, "invalidImageFile"));
        return;
      }
      setError(null);
      clearImageSession();
      setImagePhase("loading");
      setDecodingImage(true);
      const url = URL.createObjectURL(file);
      try {
        const dims = await loadImageDimensions(file);
        setImageSession({ file, url, ...dims });
        const data = await decodeQrFromFile(file);
        if (data) {
          processPayload(data);
          setCopiaCola(data);
          setImageSubmitted(true);
          setImagePhase("done");
          return;
        }
        setCropHintKey("cropSelectArea");
        setImagePhase("crop");
      } catch {
        setCropHintKey("cropSelectArea");
        setImagePhase("crop");
      } finally {
        setDecodingImage(false);
      }
    },
    [clearImageSession, locale, processPayload],
  );

  const handleCropDecode = useCallback(
    async (rect: CropRect) => {
      if (!imageSession) return;
      setDecodingImage(true);
      setError(null);
      try {
        const data = await decodeQrFromCropRect(imageSession.file, rect);
        if (!data) {
          setError(t(locale, "cropAdjustRetry"));
          return;
        }
        processPayload(data);
        setCopiaCola(data);
        setImageSubmitted(true);
        setImagePhase("done");
      } catch {
        setError(t(locale, "cropAdjustRetry"));
      } finally {
        setDecodingImage(false);
      }
    },
    [imageSession, locale, processPayload],
  );

  const pickAnotherImage = useCallback(() => {
    clearImageSession();
    setImagePhase("none");
    setRawPayload("");
    setCopiaCola("");
    setError(null);
    setImageSubmitted(false);
    setDecodingImage(false);
  }, [clearImageSession]);

  const openCropAgain = useCallback(() => {
    setRawPayload("");
    setCopiaCola("");
    setError(null);
    setCropHintKey("cropSelectArea");
    setImagePhase("crop");
  }, []);

  const parsed = rawPayload ? parseBrCode(rawPayload) : null;
  const isPix = parsed ? hasPixGui(parsed.nodes) : false;
  const summary = parsed && isPix ? buildSummary(parsed.nodes, locale) : null;
  const rows = parsed ? flattenNodes(parsed.nodes) : [];
  const locations = parsed && isPix ? extractLocationUrls(parsed.nodes) : [];
  const qrKind = parsed ? detectQrKind(parsed.nodes) : null;

  const decodeDisabled = !copiaCola.trim();
  const showUploadTabs =
    imagePhase !== "crop" &&
    imagePhase !== "loading" &&
    (!imageSubmitted || !rawPayload);
  const showCropStep = imagePhase === "crop" && imageSession !== null;
  const showResults = Boolean(rawPayload) && imagePhase !== "crop";

  useEffect(() => () => clearImageSession(), [clearImageSession]);

  useEffect(() => {
    if (!isDesktop || !showUploadTabs) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            void beginImageFile(file);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [beginImageFile, isDesktop, showUploadTabs]);

  const crcBadge = () => {
    if (!parsed?.crc.present) {
      return <Badge variant="secondary">{t(locale, "crcMissing")}</Badge>;
    }
    return (
      <Badge variant={parsed.crc.valid ? "default" : "destructive"}>
        {parsed.crc.valid ? t(locale, "crcValid") : t(locale, "crcInvalid")}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
    <AppFrame
      title={t(locale, "title")}
      headerActions={
        <>
          <LocaleToggle locale={locale} onLocaleChange={setLocale} />
          <ThemeToggle />
        </>
      }
    >
      <header>
        <p className="text-sm text-muted-foreground">{t(locale, "subtitle")}</p>
      </header>

      {imagePhase === "loading" ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t(locale, "decodingImage")}
        </p>
      ) : null}

      {showCropStep && imageSession ? (
        <QrImageCrop
          imageUrl={imageSession.url}
          naturalWidth={imageSession.width}
          naturalHeight={imageSession.height}
          locale={locale}
          hintKey={cropHintKey}
          error={error}
          decoding={decodingImage}
          onCancel={pickAnotherImage}
          onDecode={(rect) => void handleCropDecode(rect)}
        />
      ) : null}

      {showUploadTabs ? (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="flex w-full">
            <TabsTrigger value="upload" className="flex-1 gap-1.5">
              <ImageUp className="size-4 shrink-0" aria-hidden />
              {t(locale, "upload")}
            </TabsTrigger>
            <TabsTrigger value="copia-cola" className="flex-1 gap-1.5">
              <ClipboardCopy className="size-4 shrink-0" aria-hidden />
              {t(locale, "copiaCola")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3 flex flex-col gap-3">
            <div
              className={dropZoneClass}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void beginImageFile(file);
              }}
            >
              <ImageUp className="size-4 shrink-0" aria-hidden />
              <span className="font-medium text-foreground">
                {t(locale, "upload")}
              </span>
              <span className="text-xs">{t(locale, "dropOrClick")}</span>
              <Input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  void beginImageFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="size-4 shrink-0" aria-hidden />
                {t(locale, "takePhoto")}
              </Button>
              {isDesktop ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={async () => {
                    try {
                      const items = await navigator.clipboard.read();
                      for (const item of items) {
                        const type = item.types.find((t) =>
                          t.startsWith("image/"),
                        );
                        if (!type) continue;
                        const blob = await item.getType(type);
                        const file = new File(
                          [blob],
                          `pasted.${type.split("/")[1] ?? "png"}`,
                          { type },
                        );
                        void beginImageFile(file);
                        return;
                      }
                      setError(t(locale, "invalidImageFile"));
                    } catch {
                      setError(t(locale, "pasteImageHint"));
                    }
                  }}
                >
                  <ClipboardPaste className="size-4 shrink-0" aria-hidden />
                  {t(locale, "pasteImage")}
                </Button>
              ) : null}
            </div>
            {isDesktop ? (
              <p className="text-xs text-muted-foreground">
                {t(locale, "pasteImageHint")}
              </p>
            ) : null}
            <Input
              ref={cameraInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              capture="environment"
              className="hidden"
              onChange={(e) => {
                void beginImageFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </TabsContent>

          <TabsContent value="copia-cola" className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Textarea
                value={copiaCola}
                onChange={(e) => setCopiaCola(e.target.value)}
                placeholder="00020126..."
                className="min-h-[88px] flex-1 font-mono text-xs"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.metaKey || e.ctrlKey) &&
                    !decodeDisabled
                  ) {
                    e.preventDefault();
                    processPayload(copiaCola.trim());
                  }
                }}
              />
              <Button
                type="button"
                size="lg"
                disabled={decodeDisabled}
                onClick={() => processPayload(copiaCola.trim())}
                className="shrink-0 sm:w-auto"
              >
                {t(locale, "decode")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(locale, "copiaColaHint")}
            </p>
          </TabsContent>
        </Tabs>
      ) : null}

      {error && !showCropStep ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {showResults ? (
        <div className="flex flex-col gap-6">
          {imageSubmitted && imageSession ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={openCropAgain}
              >
                {t(locale, "cropAgain")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={pickAnotherImage}
              >
                {t(locale, "submitAnotherImage")}
              </Button>
            </div>
          ) : null}

          {!isPix ? (
            <p className="text-sm text-muted-foreground" role="note">
              {t(locale, "notPix")}
            </p>
          ) : null}

          {parsed?.error ? (
            <p className="text-sm text-destructive" role="alert">
              {t(locale, "parseError")}: {parsed.error}
            </p>
          ) : null}

          {summary ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {t(locale, "summary")}
              </p>
              <p className="text-base font-semibold leading-snug break-all">
                {summary}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {qrKind ? <Badge variant="outline">{qrKind}</Badge> : null}
                {isPix ? crcBadge() : null}
              </div>
            </div>
          ) : null}

          {isPix && rows.length > 0 ? (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(locale, "structuredData")}
                </p>
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[34%] max-w-28 whitespace-normal align-top text-xs sm:max-w-none sm:w-[38%] sm:text-sm">
                        {t(locale, "label")}
                      </TableHead>
                      <TableHead className="whitespace-normal align-top text-xs sm:text-sm">
                        {t(locale, "value")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.path}>
                        <TableCell className="w-[34%] max-w-28 align-top text-xs leading-snug break-words whitespace-normal text-muted-foreground sm:max-w-none sm:w-[38%] sm:text-sm">
                          <StructuredDataLabel
                            id={row.id}
                            parentId={row.parentId}
                            locale={locale}
                          />
                        </TableCell>
                        <TableCell className="align-top font-mono text-xs break-all whitespace-normal">
                          {row.isTemplate ? (
                            "—"
                          ) : (
                            <StructuredDataValue
                              row={row}
                              rows={rows}
                              locale={locale}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}

          {isPix && locations.length > 0 ? (
            <>
              <Separator />
              <div className="flex flex-col gap-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(locale, "cobrancaPayload")}
                </p>
                {locations.map((url) => (
                  <LocationFetcher key={url} url={url} locale={locale} />
                ))}
              </div>
            </>
          ) : null}

          <Separator />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t(locale, "rawPayload")}
            </p>
            <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs break-all whitespace-pre-wrap">
              {rawPayload}
            </pre>
          </div>
        </div>
      ) : null}
    </AppFrame>
    </TooltipProvider>
  );
}

function StructuredDataValue({
  row,
  rows,
  locale,
}: {
  row: {
    id: string;
    parentId: string | null;
    value: string;
  };
  rows: Array<{ id: string; parentId: string | null; value: string }>;
  locale: Locale;
}) {
  const displayValue = formatDisplayValue(
    row.id,
    row.value,
    row.parentId,
    locale,
  );

  if (!rowHasDehashedLink(row, rows)) {
    return <>{displayValue}</>;
  }

  const query = buildDehashedQueryForRow(row, rows);
  if (!query) {
    return <>{displayValue}</>;
  }

  return <DehashedValueLink displayValue={displayValue} query={query} />;
}

function StructuredDataLabel({
  id,
  parentId,
  locale,
}: {
  id: string;
  parentId: string | null;
  locale: Locale;
}) {
  const label = getTagLabel(id, parentId, locale);
  const description = getTagDescription(id, parentId, locale);

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="cursor-help text-left underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 hover:decoration-muted-foreground"
      >
        {label}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[min(20rem,90vw)]">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

function LocationFetcher({ url, locale }: { url: string; locale: Locale }) {
  const [result, setResult] = useState<LocationFetch>({
    url,
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`/api/location?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setResult({
            url,
            status: "error",
            error: json.error ?? t(locale, "fetchFailed"),
          });
          return;
        }
        setResult({
          url,
          status: "ok",
          statusCode: json.status,
          data: json.data,
        });
      } catch (e) {
        if (!cancelled) {
          setResult({
            url,
            status: "error",
            error: e instanceof Error ? e.message : t(locale, "fetchFailed"),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, locale]);

  return (
    <div className="space-y-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs break-all text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
      >
        {url}
      </a>
      {result.status === "loading" ? (
        <p className="text-sm text-muted-foreground">
          {t(locale, "fetchingLocation")}
        </p>
      ) : null}
      {result.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      ) : null}
      {result.status === "ok" ? (
        <>
          <Badge variant="outline">HTTP {result.statusCode}</Badge>
          <LocationDataTable data={result.data} locale={locale} />
        </>
      ) : null}
    </div>
  );
}

function LocationDataTable({
  data,
  locale,
}: {
  data: unknown;
  locale: Locale;
}) {
  const rows =
    typeof data === "object" && data !== null
      ? flattenJson(data)
      : [{ path: "(root)", value: String(data) }];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t(locale, "path")}</TableHead>
          <TableHead>{t(locale, "value")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.path}>
            <TableCell className="font-mono text-xs">{row.path}</TableCell>
            <TableCell className="font-mono text-xs break-all">
              {row.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
