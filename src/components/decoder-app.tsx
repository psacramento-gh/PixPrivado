"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import { ClipboardPaste, ImageUp, Languages } from "lucide-react";

type LocationFetch = {
  url: string;
  status: "loading" | "ok" | "error";
  statusCode?: number;
  data?: unknown;
  error?: string;
};

export function DecoderApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [rawPayload, setRawPayload] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t(locale, "title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            {t(locale, "subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Languages className="text-muted-foreground size-4" />
          <Label htmlFor="locale-switch" className="text-sm">
            {locale === "en" ? "EN" : "PT"}
          </Label>
          <Switch
            id="locale-switch"
            checked={locale === "pt"}
            onCheckedChange={(checked) => setLocale(checked ? "pt" : "en")}
          />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageUp className="size-4" />
              {t(locale, "upload")}
            </CardTitle>
            <CardDescription>{t(locale, "uploadHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-input hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void handleFile(file);
              }}
            >
              <p className="text-muted-foreground text-sm">
                {t(locale, "dropOrClick")}
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardPaste className="size-4" />
              {t(locale, "clipboard")}
            </CardTitle>
            <CardDescription>{t(locale, "clipboardHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={pasteRef}
              tabIndex={0}
              className="border-input focus-visible:ring-ring flex min-h-[120px] items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm outline-none focus-visible:ring-2"
            >
              {t(locale, "pasteZone")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t(locale, "copiaCola")}</CardTitle>
          <CardDescription>{t(locale, "copiaColaHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={copiaCola}
            onChange={(e) => setCopiaCola(e.target.value)}
            placeholder="00020126..."
            className="font-mono text-xs min-h-[100px]"
          />
          <Button
            onClick={() => {
              const trimmed = copiaCola.trim();
              if (trimmed) processPayload(trimmed);
            }}
          >
            {t(locale, "decode")}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {rawPayload && (
        <>
          {!isPix && (
            <Alert>
              <AlertDescription>{t(locale, "notPix")}</AlertDescription>
            </Alert>
          )}

          {parsed?.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {t(locale, "parseError")}: {parsed.error}
              </AlertDescription>
            </Alert>
          )}

          {summary && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t(locale, "summary")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{summary}</p>
                {qrKind && (
                  <Badge variant="outline">{qrKind}</Badge>
                )}
                {isPix && crcBadge()}
              </CardContent>
            </Card>
          )}

          {isPix && rows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t(locale, "structuredData")}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t(locale, "path")}</TableHead>
                      <TableHead>{t(locale, "tag")}</TableHead>
                      <TableHead>{t(locale, "label")}</TableHead>
                      <TableHead className="text-right">{t(locale, "length")}</TableHead>
                      <TableHead>{t(locale, "value")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.path}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            <span style={{ paddingLeft: `${row.depth * 12}px` }}>
                              {row.path}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.id}</TableCell>
                          <TableCell className="text-sm">
                            {getTagLabel(row.id, row.parentId, locale)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {row.length}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-md break-all">
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
              </CardContent>
            </Card>
          )}

          {isPix && locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t(locale, "cobrancaPayload")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {locations.map((url) => (
                  <LocationFetcher key={url} url={url} locale={locale} />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t(locale, "rawPayload")}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted overflow-x-auto rounded-md p-4 font-mono text-xs break-all whitespace-pre-wrap">
                {rawPayload}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
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
      <p className="font-mono text-xs break-all">{url}</p>
      {result.status === "loading" && (
        <p className="text-muted-foreground text-sm">
          {t(locale, "fetchingLocation")}
        </p>
      )}
      {result.status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
      {result.status === "ok" && (
        <>
          <Badge variant="outline">HTTP {result.statusCode}</Badge>
          <LocationDataTable data={result.data} locale={locale} />
        </>
      )}
      <Separator />
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
            <TableCell className="font-mono text-xs break-all">{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
