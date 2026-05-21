"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  getTagLabel,
  type Locale,
} from "@/lib/brcode/labels";
import { flattenNodes, parseBrCode } from "@/lib/brcode/parse";
import { flattenJson } from "@/lib/json-flatten";
import { t } from "@/lib/i18n";
import { decodeQrFromFile } from "@/lib/qr/decode-image";
import { cn } from "@/lib/utils";
import { ClipboardPaste, ImageUp } from "lucide-react";

type LocationFetch = {
  url: string;
  status: "loading" | "ok" | "error";
  statusCode?: number;
  data?: unknown;
  error?: string;
};

const dropZoneClass =
  "border-input hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground transition-colors";

export function DecoderApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [rawPayload, setRawPayload] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageSubmitted, setImageSubmitted] = useState(false);
  const pasteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPayload = useCallback((payload: string) => {
    setRawPayload(payload);
    setError(null);
  }, []);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const data = await decodeQrFromFile(file);
      if (!data) {
        setError(t(locale, "noQrFound"));
        return;
      }
      processPayload(data);
      setCopiaCola(data);
      setImageSubmitted(true);
    } catch {
      setError(t(locale, "noQrFound"));
    }
  };

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items?.length) return;
      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;
        event.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const data = await decodeQrFromFile(file);
        if (data) {
          processPayload(data);
          setCopiaCola(data);
          setImageSubmitted(true);
          return;
        }
      }
      const text = event.clipboardData?.getData("text/plain")?.trim();
      if (text?.startsWith("000201")) {
        event.preventDefault();
        setCopiaCola(text);
        processPayload(text);
      }
    },
    [processPayload],
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const parsed = rawPayload ? parseBrCode(rawPayload) : null;
  const isPix = parsed ? hasPixGui(parsed.nodes) : false;
  const summary = parsed && isPix ? buildSummary(parsed.nodes, locale) : null;
  const rows = parsed ? flattenNodes(parsed.nodes) : [];
  const locations = parsed && isPix ? extractLocationUrls(parsed.nodes) : [];
  const qrKind = parsed ? detectQrKind(parsed.nodes) : null;

  const decodeDisabled = !copiaCola.trim();
  const showImageInput = !imageSubmitted || !rawPayload;

  const resetForAnotherImage = () => {
    setRawPayload("");
    setCopiaCola("");
    setError(null);
    setImageSubmitted(false);
  };

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

      {showImageInput ? (
        <>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={dropZoneClass}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void handleFile(file);
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
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div
              ref={pasteRef}
              tabIndex={0}
              className={cn(
                dropZoneClass,
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <ClipboardPaste className="size-4 shrink-0" aria-hidden />
              <span className="font-medium text-foreground">
                {t(locale, "clipboard")}
              </span>
              <span className="text-xs">{t(locale, "pasteZone")}</span>
            </div>
          </div>
        </>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {rawPayload ? (
        <div className="flex flex-col gap-6">
          {imageSubmitted ? (
            <Button type="button" variant="outline" onClick={resetForAnotherImage}>
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
                <div className="-mx-1 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t(locale, "path")}</TableHead>
                        <TableHead>{t(locale, "tag")}</TableHead>
                        <TableHead>{t(locale, "label")}</TableHead>
                        <TableHead className="text-right">
                          {t(locale, "length")}
                        </TableHead>
                        <TableHead>{t(locale, "value")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.path}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            <span
                              style={{ paddingLeft: `${row.depth * 12}px` }}
                            >
                              {row.path}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {getTagLabel(row.id, row.parentId, locale)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {row.length}
                          </TableCell>
                          <TableCell className="max-w-[12rem] font-mono text-xs break-all sm:max-w-xs">
                            {row.isTemplate
                              ? "—"
                              : formatDisplayValue(
                                  row.id,
                                  row.value,
                                  row.parentId,
                                  locale,
                                )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
