"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  clearPersistedDecoderState,
  loadPersistedDecoderBundle,
  savePersistedDecoderBundle,
} from "@/lib/decoder-persist";
import { AppFrame } from "@/components/app-frame";
import { AppHeaderActions } from "@/components/app-header-actions";
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
import { extractLocationUrls, hasPixGui } from "@/lib/brcode/analyze";
import {
  formatDisplayValue,
  getTagDescription,
  getTagLabel,
  type Locale,
} from "@/lib/brcode/labels";
import { flattenNodes, parseBrCode } from "@/lib/brcode/parse";
import { flattenJson } from "@/lib/json-flatten";
import { t } from "@/lib/i18n";
import { decodeQrFromFile, type NormalizedQrCorners } from "@/lib/qr/decode-image";
import { QrImagePreview } from "@/components/qr-image-preview";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { useAppLocale } from "@/lib/use-app-locale";
import { DehashedValueLink } from "@/components/dehashed-value-link";
import {
  buildDehashedQueryForRow,
  getStructuredValueBadgeKind,
  rowHasDehashedLink,
} from "@/lib/dehashed/searchable-rows";
import { PixKeyTypeBadge } from "@/components/pix-key-type-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  normalizedCorners: NormalizedQrCorners;
};

type ImagePhase = "none" | "loading" | "done";

function isImageFile(file: File): boolean {
  if (file.type.startsWith("video/")) return false;
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

export function DecoderApp() {
  const [restoreDone, setRestoreDone] = useState(false);
  const [locale, setLocale] = useAppLocale();
  const [rawPayload, setRawPayload] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageSubmitted, setImageSubmitted] = useState(false);
  const [imagePhase, setImagePhase] = useState<ImagePhase>("none");
  const [imageSession, setImageSession] = useState<ImageSession | null>(null);
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
      const url = URL.createObjectURL(file);
      try {
        const decoded = await decodeQrFromFile(file);
        if (decoded) {
          processPayload(decoded.data);
          setCopiaCola(decoded.data);
          setImageSession({
            file,
            url,
            normalizedCorners: decoded.normalizedCorners,
          });
          setImageSubmitted(true);
          setImagePhase("done");
          return;
        }
        URL.revokeObjectURL(url);
        setImageSession(null);
        setImagePhase("none");
        setError(t(locale, "noQrFound"));
      } catch {
        URL.revokeObjectURL(url);
        setImageSession(null);
        setImagePhase("none");
        setError(t(locale, "noQrFound"));
      }
    },
    [clearImageSession, locale, processPayload],
  );

  const resetDecoder = useCallback(() => {
    clearImageSession();
    setImagePhase("none");
    setRawPayload("");
    setCopiaCola("");
    setError(null);
    setImageSubmitted(false);
    clearPersistedDecoderState();
  }, [clearImageSession]);

  const parsed = rawPayload ? parseBrCode(rawPayload) : null;
  const isPix = parsed ? hasPixGui(parsed.nodes) : false;
  const rows = parsed ? flattenNodes(parsed.nodes) : [];
  const locations = parsed && isPix ? extractLocationUrls(parsed.nodes) : [];

  const decodeDisabled = !copiaCola.trim();
  const showUploadTabs =
    imagePhase !== "loading" && (!imageSubmitted || !rawPayload);
  const showResults = Boolean(rawPayload) && imagePhase !== "loading";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const bundle = await loadPersistedDecoderBundle();
      if (cancelled) return;

      if (bundle) {
        setLocale(bundle.locale);
        setRawPayload(bundle.rawPayload);
        setCopiaCola(bundle.copiaCola);
        setImageSubmitted(bundle.imageSubmitted);
        setImagePhase(bundle.imageSubmitted ? "done" : "none");
        setError(null);
        if (bundle.imageSession) {
          setImageSession(bundle.imageSession);
        }
      }

      setRestoreDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!restoreDone) return;
    if (!rawPayload.trim()) {
      clearPersistedDecoderState();
      return;
    }
    if (imageSubmitted && !imageSession) return;
    void savePersistedDecoderBundle(
      {
        rawPayload,
        copiaCola,
        imageSubmitted,
        locale,
      },
      imageSubmitted ? imageSession : null,
    );
  }, [restoreDone, rawPayload, copiaCola, imageSubmitted, locale, imageSession]);

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

  return (
    <AppFrame
      title={t(locale, "title")}
      titleAriaLabel={t(locale, "titleHomeAria")}
      onTitleNavigateHome={resetDecoder}
      aboutLinkLabel={t(locale, "about")}
      headerActions={
        <AppHeaderActions locale={locale} onLocaleChange={setLocale} />
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
            <Textarea
              value={copiaCola}
              onChange={(e) => setCopiaCola(e.target.value)}
              placeholder="00020126..."
              className="min-h-[88px] font-mono text-xs"
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t(locale, "copiaColaHint")}
              </p>
              <Button
                type="button"
                size="lg"
                disabled={decodeDisabled}
                onClick={() => processPayload(copiaCola.trim())}
                className="w-full shrink-0 sm:w-auto"
              >
                {t(locale, "decode")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {showResults ? (
        <div className="flex flex-col gap-6">
          {imageSubmitted && imageSession ? (
            <QrImagePreview
              url={imageSession.url}
              normalizedCorners={imageSession.normalizedCorners}
              caption={t(locale, "decodedFromImage")}
            />
          ) : null}

          {imageSubmitted ? (
            <Button
              type="button"
              variant="outline"
              onClick={resetDecoder}
            >
              {t(locale, "submitAnotherImage")}
            </Button>
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

          {imageSubmitted ? (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(locale, "rawPayload")}
                </p>
                <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs break-all whitespace-pre-wrap">
                  {rawPayload}
                </pre>
              </div>
            </>
          ) : null}

          {isPix && rows.length > 0 ? (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(locale, "structuredView")}
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
        </div>
      ) : null}
    </AppFrame>
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
  const badgeKind = getStructuredValueBadgeKind(row, rows);

  let valueNode: ReactNode = displayValue;
  if (rowHasDehashedLink(row, rows)) {
    const query = buildDehashedQueryForRow(row, rows);
    if (query) {
      valueNode = <DehashedValueLink displayValue={displayValue} query={query} />;
    }
  }

  if (!badgeKind) {
    return <>{valueNode}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {valueNode}
      <PixKeyTypeBadge kind={badgeKind} locale={locale} />
    </span>
  );
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
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover
        delay={0}
        closeDelay={100}
        aria-label={description}
        className="cursor-help text-left underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 hover:decoration-muted-foreground"
      >
        {label}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        initialFocus={false}
        className="w-fit max-w-[min(20rem,90vw)] gap-0 border-0 bg-foreground p-0 px-3 py-1.5 text-xs text-background shadow-md ring-0"
      >
        {description}
      </PopoverContent>
    </Popover>
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
