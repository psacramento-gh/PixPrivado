"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  detectQrKind,
  extractLocationUrls,
  hasPixGui,
} from "@/lib/brcode/analyze";
import {
  getSanitizeEligibility,
  isPayloadAlreadySanitized,
  sanitizeStaticPixPayload,
  type SanitizeEligibility,
} from "@/lib/brcode/sanitize";
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
  decodeQrFromFile,
  QrDecodeAbortedError,
  type NormalizedQrCorners,
} from "@/lib/qr/decode-image";
import {
  DecoderPhaseTransition,
  type DecoderPhase,
} from "@/components/decoder-phase-transition";
import { QrDecodeOverlay } from "@/components/qr-decode-overlay";
import { QrImagePreview } from "@/components/qr-image-preview";
import { SafeQrPreview } from "@/components/safe-qr-preview";
import { motion } from "motion/react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { useAppLocale } from "@/lib/use-app-locale";
import { LookupPanelStack } from "@/components/lookup/lookup-panel-stack";
import { LookupPanelsProvider } from "@/components/lookup/lookup-panels-context";
import { LookupGoogleLink } from "@/components/lookup/lookup-google-link";
import { LookupPortalLink } from "@/components/lookup/lookup-portal-link";
import { LookupValueButton } from "@/components/lookup/lookup-value-button";
import type { LookupPanelRecord } from "@/lib/lookup/panel-types";
import {
  buildLookupQueryForRow,
  buildGoogleSearchUrlForMerchantNameRow,
  buildPortalUrlForMerchantNameIdentifierRow,
  buildPortalUrlForPixKeyRow,
  getStructuredValueBadgeKind,
  rowHasLookupLink,
  rowHasMerchantNameGoogleLink,
  rowHasMerchantNamePortalLink,
  rowHasPixKeyPortalLink,
} from "@/lib/breach/searchable-rows";
import { CepEnrichedValue } from "@/components/cep-enriched-value";
import { MerchantCityEnrichedValue } from "@/components/merchant-city-enriched-value";
import { PhoneEnrichedValue } from "@/components/phone-enriched-value";
import { PixKeyTypeBadge } from "@/components/pix-key-type-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Camera,
  ClipboardCopy,
  ClipboardPaste,
  ImageUp,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildDecoderSharePath,
  parseDecoderPayloadFromSearch,
} from "@/lib/decoder/share-url";
import { ShareDecoderLink } from "@/components/share-decoder-link";

type LocationFetch = {
  url: string;
  status: "loading" | "ok" | "error";
  statusCode?: number;
  data?: unknown;
  error?: string;
};


const IMAGE_DECODE_TIMEOUT_MS = 25_000;
const dropZoneClass =
  "border-input hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground transition-colors";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

type ImageSession = {
  file: File;
  url: string;
  normalizedCorners: NormalizedQrCorners;
};

type ImagePhase = "none" | "loading" | "done";

function getDecoderPhase(imagePhase: ImagePhase, rawPayload: string): DecoderPhase {
  if (imagePhase === "loading") return "decoding-qr";
  if (rawPayload.trim()) return "results";
  return "input";
}

function isImageFile(file: File): boolean {
  if (file.type.startsWith("video/")) return false;
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

function getSanitizeDisabledMessage(
  eligibility: SanitizeEligibility,
  locale: Locale,
): string | null {
  if (eligibility.eligible) return null;
  if (eligibility.reason === "not_evp") {
    return t(locale, "makeSaferToShareEvpOnly");
  }
  if (eligibility.reason === "not_static") {
    return t(locale, "makeSaferToShareStaticOnly");
  }
  return null;
}

export function DecoderApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [restoreDone, setRestoreDone] = useState(false);
  const [locale, setLocale] = useAppLocale();
  const [rawPayload, setRawPayload] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [imageSubmitted, setImageSubmitted] = useState(false);
  const [imagePhase, setImagePhase] = useState<ImagePhase>("none");
  const [imageSession, setImageSession] = useState<ImageSession | null>(null);
  const [decodingPreviewUrl, setDecodingPreviewUrl] = useState<string | null>(
    null,
  );
  const [decodingFileName, setDecodingFileName] = useState<string | null>(null);
  const [lookupPanels, setLookupPanels] = useState<LookupPanelRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const decodeAbortRef = useRef<AbortController | null>(null);
  const decodeJobIdRef = useRef(0);
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

  /** Copia e Cola decode — not an image submission; clears stale image state. */
  const processTextPayload = useCallback(
    (payload: string) => {
      clearImageSession();
      setImageSubmitted(false);
      setImagePhase("none");
      setLookupPanels([]);
      processPayload(payload);
    },
    [clearImageSession, processPayload],
  );

  const clearDecodingPreview = useCallback(() => {
    setDecodingPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setDecodingFileName(null);
  }, []);

  const cancelImageDecode = useCallback(() => {
    decodeAbortRef.current?.abort();
    decodeJobIdRef.current += 1;
    decodeAbortRef.current = null;
    clearDecodingPreview();
    setImagePhase("none");
    setImageSubmitted(false);
  }, [clearDecodingPreview]);

  const beginImageFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!isImageFile(file)) {
        setError("invalidImageFile");
        return;
      }

      decodeAbortRef.current?.abort();
      const decodeId = ++decodeJobIdRef.current;
      const controller = new AbortController();
      decodeAbortRef.current = controller;

      setError(null);
      clearImageSession();
      clearDecodingPreview();
      setImageSubmitted(false);
      setLookupPanels([]);
      setDecodingFileName(file.name);
      setImagePhase("loading");
      const url = URL.createObjectURL(file);
      setDecodingPreviewUrl(url);

      const timeoutId = window.setTimeout(
        () => controller.abort(),
        IMAGE_DECODE_TIMEOUT_MS,
      );

      try {
        const decoded = await decodeQrFromFile(file, {
          signal: controller.signal,
        });
        if (decodeId !== decodeJobIdRef.current) return;

        if (decoded) {
          processPayload(decoded.data);
          setCopiaCola(decoded.data);
          setImageSession({
            file,
            url,
            normalizedCorners: decoded.normalizedCorners,
          });
          setDecodingPreviewUrl(null);
          setDecodingFileName(null);
          setImageSubmitted(true);
          setImagePhase("done");
          return;
        }

        URL.revokeObjectURL(url);
        setDecodingPreviewUrl(null);
        setDecodingFileName(null);
        setImageSession(null);
        setError("noQrFound");
      } catch (err) {
        if (decodeId !== decodeJobIdRef.current) return;

        URL.revokeObjectURL(url);
        setDecodingPreviewUrl(null);
        setDecodingFileName(null);
        setImageSession(null);

        if (err instanceof QrDecodeAbortedError) {
          setError("decodeImageFailed");
          return;
        }
        setError("decodeImageFailed");
      } finally {
        window.clearTimeout(timeoutId);
        if (decodeId === decodeJobIdRef.current) {
          if (decodeAbortRef.current === controller) {
            decodeAbortRef.current = null;
          }
          setImagePhase((phase) => (phase === "loading" ? "none" : phase));
        }
      }
    },
    [clearDecodingPreview, clearImageSession, locale, processPayload],
  );

  const resetDecoder = useCallback(() => {
    decodeAbortRef.current?.abort();
    decodeJobIdRef.current += 1;
    decodeAbortRef.current = null;
    clearDecodingPreview();
    clearImageSession();
    setImagePhase("none");
    setRawPayload("");
    setCopiaCola("");
    setError(null);
    setImageSubmitted(false);
    setLookupPanels([]);
    clearPersistedDecoderState();
    if (pathname === "/" && searchParams.has("p")) {
      router.replace("/", { scroll: false });
    }
  }, [clearDecodingPreview, clearImageSession, pathname, router, searchParams]);

  const parsed = rawPayload ? parseBrCode(rawPayload) : null;
  const isPix = parsed ? hasPixGui(parsed.nodes) : false;
  const canSharePayload = parsed ? detectQrKind(parsed.nodes) === "static" : false;
  const sanitizeEligibility = rawPayload
    ? getSanitizeEligibility(rawPayload)
    : ({ eligible: false, reason: "parse_error" } as const);
  const isSanitizedPayload = useMemo(
    () => (rawPayload.trim() ? isPayloadAlreadySanitized(rawPayload) : false),
    [rawPayload],
  );
  const canSanitize = sanitizeEligibility.eligible && !isSanitizedPayload;
  const showSanitizeControls = isPix && !isSanitizedPayload;
  const sanitizeDisabledMessage = getSanitizeDisabledMessage(
    sanitizeEligibility,
    locale,
  );
  const rows = parsed ? flattenNodes(parsed.nodes) : [];
  const locations = parsed && isPix ? extractLocationUrls(parsed.nodes) : [];

  const handleSanitize = useCallback(() => {
    const sanitized = sanitizeStaticPixPayload(rawPayload);
    clearImageSession();
    setImageSubmitted(false);
    setImagePhase("none");
    setLookupPanels([]);
    setRawPayload(sanitized);
    setCopiaCola(sanitized);
    setError(null);
  }, [rawPayload, clearImageSession]);

  const decodeDisabled = !copiaCola.trim();
  const phase = getDecoderPhase(imagePhase, rawPayload);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const urlPayload = parseDecoderPayloadFromSearch(window.location.search);
      if (urlPayload) {
        setRawPayload(urlPayload);
        setCopiaCola(urlPayload);
        setError(null);
        setImageSession(null);
        setImageSubmitted(false);
        setImagePhase("none");
        setRestoreDone(true);
        return;
      }

      const bundle = await loadPersistedDecoderBundle();
      if (cancelled) return;

      if (bundle) {
        setLocale(bundle.locale);
        setRawPayload(bundle.rawPayload);
        setCopiaCola(bundle.copiaCola);
        setError(null);
        if (bundle.sanitized || isPayloadAlreadySanitized(bundle.rawPayload)) {
          setImageSession(null);
          setImageSubmitted(false);
          setImagePhase("none");
        } else if (bundle.imageSession) {
          setImageSession(bundle.imageSession);
          setImageSubmitted(true);
          setImagePhase("done");
        } else {
          setImageSession(null);
          setImageSubmitted(false);
          setImagePhase("none");
        }
      }

      setRestoreDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!restoreDone || pathname !== "/") return;

    const trimmed = rawPayload.trim();
    const urlPayload = parseDecoderPayloadFromSearch(searchParams);

    if (!trimmed) {
      if (urlPayload) router.replace("/", { scroll: false });
      return;
    }

    if (!canSharePayload) {
      if (urlPayload) router.replace("/", { scroll: false });
      return;
    }

    if (urlPayload === trimmed) return;
    router.replace(buildDecoderSharePath(trimmed), { scroll: false });
  }, [canSharePayload, restoreDone, rawPayload, pathname, router, searchParams]);

  useEffect(() => {
    if (!restoreDone) return;
    if (!rawPayload.trim()) {
      clearPersistedDecoderState();
      return;
    }
    const persistImageSubmitted = imageSubmitted && imageSession !== null;
    void savePersistedDecoderBundle(
      {
        rawPayload,
        copiaCola,
        imageSubmitted: isSanitizedPayload ? false : persistImageSubmitted,
        locale,
        sanitized: isSanitizedPayload || undefined,
      },
      isSanitizedPayload ? null : persistImageSubmitted ? imageSession : null,
    );
  }, [
    restoreDone,
    rawPayload,
    copiaCola,
    imageSubmitted,
    locale,
    imageSession,
    isSanitizedPayload,
  ]);

  useEffect(() => {
    if (!isDesktop || phase !== "input") return;
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
  }, [beginImageFile, isDesktop, phase]);

  return (
    <LookupPanelsProvider panels={lookupPanels} onPanelsChange={setLookupPanels}>
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
        <Alert
          role="note"
          className="border-border bg-muted/40 *:[svg]:text-muted-foreground"
        >
          <ShieldAlert aria-hidden />
          <AlertTitle>{t(locale, "subtitleLead")}</AlertTitle>
          <AlertDescription>{t(locale, "subtitleDetail")}</AlertDescription>
        </Alert>
      </header>

      <DecoderPhaseTransition phase={phase}>
        {phase === "input" ? (
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
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="size-4 shrink-0" aria-hidden />
                {t(locale, "takePhoto")}
              </Button>
              {isDesktop ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-1.5"
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
                      setError("invalidImageFile");
                    } catch {
                      setError("pasteImageHint");
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
            <CopiaColaInputSection
              value={copiaCola}
              onChange={setCopiaCola}
              locale={locale}
              decodeDisabled={decodeDisabled}
              onDecode={() => processTextPayload(copiaCola.trim())}
              onPasteError={(message) => setError(message)}
              onPasteSuccess={() => setError(null)}
            />
          </TabsContent>
        </Tabs>
        ) : null}

        {phase === "decoding-qr" ? (
          <QrDecodeOverlay
            previewUrl={decodingPreviewUrl}
            statusLabel={t(locale, "decodingImage")}
            fileName={decodingFileName ?? undefined}
            locale={locale}
            cancelLabel={t(locale, "cancelDecoding")}
            onCancel={cancelImageDecode}
          />
        ) : null}

        {phase === "results" ? (
        <div className="flex flex-col gap-6">
          {isSanitizedPayload ? (
            <SafeQrPreview
              payload={rawPayload}
              caption={t(locale, "safeQrCaption")}
              locale={locale}
            />
          ) : imageSubmitted && imageSession ? (
            <QrImagePreview
              url={imageSession.url}
              normalizedCorners={imageSession.normalizedCorners}
              caption={t(locale, "decodedFromImage")}
              fileName={imageSession.file.name}
              locale={locale}
            />
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

          <Separator />
          <motion.div
            key={isSanitizedPayload ? "sanitized-payload" : "raw-payload"}
            initial={isSanitizedPayload ? { opacity: 0.7 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <RawPayloadSection payload={rawPayload} locale={locale} />
          </motion.div>

          {isPix && rows.length > 0 ? (
            <>
              <Separator />
              <motion.div
                key={isSanitizedPayload ? "sanitized-structured" : "raw-structured"}
                initial={isSanitizedPayload ? { opacity: 0.7, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col gap-2"
              >
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
                              sanitized={isSanitizedPayload}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
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

          {!isSanitizedPayload ? (
            <LookupPanelStack
              locale={locale}
              panels={lookupPanels}
              onPanelsChange={setLookupPanels}
            />
          ) : null}

          <div className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <Button
                type="button"
                size="lg"
                className="w-full shrink-0 gap-1.5 sm:w-auto"
                onClick={resetDecoder}
              >
                <RotateCcw className="size-4 shrink-0" aria-hidden />
                {t(locale, "submitAnotherImage")}
              </Button>
              {showSanitizeControls ? (
                <div className="flex w-full max-w-sm flex-col gap-2.5 sm:ml-auto">
                  <MakeSaferToShareButton
                    locale={locale}
                    disabled={!canSanitize}
                    onClick={handleSanitize}
                  />
                  {!canSanitize && sanitizeDisabledMessage ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {sanitizeDisabledMessage}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            {canSharePayload ? (
              <ShareDecoderLink
                payload={rawPayload}
                locale={locale}
                enabled={canSharePayload}
                className="mx-auto w-full max-w-lg"
              />
            ) : null}
          </div>
        </div>
        ) : null}
      </DecoderPhaseTransition>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(locale, error)}
        </p>
      ) : null}
    </AppFrame>
    </LookupPanelsProvider>
  );
}

const makeSaferToShareButtonClass =
  "w-full shrink-0 gap-1.5 border-emerald-500/60 bg-emerald-500/10 text-emerald-950 hover:bg-emerald-500/20 hover:text-emerald-950 sm:w-auto dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-50 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-50";

function MakeSaferToShareButton({
  locale,
  disabled,
  onClick,
}: {
  locale: Locale;
  disabled: boolean;
  onClick: () => void;
}) {
  const fullLabel = t(locale, "makeSaferToShare");
  const shortLabel = t(locale, "makeSaferToShareShort");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="lg"
              variant="outline"
              className={makeSaferToShareButtonClass}
              disabled={disabled}
              onClick={onClick}
              aria-label={fullLabel}
            />
          }
        >
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{fullLabel}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center sm:hidden">
          {fullLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CopiaColaInputSection({
  value,
  onChange,
  locale,
  decodeDisabled,
  onDecode,
  onPasteError,
  onPasteSuccess,
}: {
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  decodeDisabled: boolean;
  onDecode: () => void;
  onPasteError: (key: MessageKey) => void;
  onPasteSuccess: () => void;
}) {
  const [pasted, setPasted] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handlePasteFromClipboard = useCallback(async () => {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      onPasteError("pasteCodeFailed");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      onPasteError("pasteCodeFailed");
      return;
    }

    onChange(trimmed);
    onPasteSuccess();
    textareaRef.current?.focus();
    setPasted(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setPasted(false), 2000);
  }, [locale, onChange, onPasteError, onPasteSuccess]);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t(locale, "copiaCola")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-auto shrink-0 py-0.5"
            onClick={() => void handlePasteFromClipboard()}
            aria-label={t(locale, "pasteCode")}
          >
            <ClipboardPaste className="size-3.5 shrink-0" aria-hidden />
            {pasted ? t(locale, "pasteCodePasted") : t(locale, "pasteCode")}
          </Button>
        </div>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="00020126..."
          className="min-h-[88px] font-mono text-base md:text-xs"
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.metaKey || e.ctrlKey) &&
              !decodeDisabled
            ) {
              e.preventDefault();
              onDecode();
            }
          }}
        />
        <span className="sr-only" aria-live="polite">
          {pasted ? t(locale, "pasteCodePasted") : ""}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {t(locale, "copiaColaHint")}
        </p>
        <Button
          type="button"
          size="lg"
          disabled={decodeDisabled}
          onClick={onDecode}
          className="w-full shrink-0 sm:w-auto"
        >
          {t(locale, "decode")}
        </Button>
      </div>
    </>
  );
}

function RawPayloadSection({
  payload,
  locale,
}: {
  payload: string;
  locale: Locale;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(payload);
      success = true;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = payload;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }
    if (!success) return;

    setCopied(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [payload]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t(locale, "rawPayload")}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-auto shrink-0 py-0.5"
          onClick={() => void handleCopy()}
          aria-label={t(locale, "copyPayload")}
        >
          <ClipboardCopy className="size-3.5 shrink-0" aria-hidden />
          {copied ? t(locale, "copyPayloadCopied") : t(locale, "copyPayload")}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs break-all whitespace-pre-wrap">
        {payload}
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? t(locale, "copyPayloadCopied") : ""}
      </span>
    </div>
  );
}

function StructuredDataValue({
  row,
  rows,
  locale,
  sanitized = false,
}: {
  row: {
    id: string;
    parentId: string | null;
    value: string;
  };
  rows: Array<{ id: string; parentId: string | null; value: string }>;
  locale: Locale;
  sanitized?: boolean;
}) {
  const displayValue = formatDisplayValue(
    row.id,
    row.value,
    row.parentId,
    locale,
  );

  if (sanitized) {
    const badgeKind = getStructuredValueBadgeKind(row, rows);
    if (badgeKind && badgeKind !== "phone") {
      return (
        <span className="inline-flex flex-wrap items-center gap-2">
          {displayValue}
          <PixKeyTypeBadge kind={badgeKind} locale={locale} />
        </span>
      );
    }
    return <>{displayValue}</>;
  }

  const badgeKind = getStructuredValueBadgeKind(row, rows);

  let valueNode: ReactNode = displayValue;
  if (rowHasMerchantNameGoogleLink(row)) {
    const googleUrl = buildGoogleSearchUrlForMerchantNameRow(row);
    if (googleUrl) {
      valueNode = (
        <LookupGoogleLink displayValue={displayValue} href={googleUrl} locale={locale} />
      );
    }
  } else if (rowHasMerchantNamePortalLink(row, displayValue)) {
    const portalUrl = buildPortalUrlForMerchantNameIdentifierRow(row, displayValue);
    if (portalUrl) {
      valueNode = (
        <LookupPortalLink displayValue={displayValue} href={portalUrl} locale={locale} />
      );
    }
  } else if (rowHasPixKeyPortalLink(row, rows)) {
    const portalUrl = buildPortalUrlForPixKeyRow(row, rows);
    if (portalUrl) {
      valueNode = (
        <LookupPortalLink displayValue={displayValue} href={portalUrl} locale={locale} />
      );
    }
  } else if (rowHasLookupLink(row, rows)) {
    const query = buildLookupQueryForRow(row, rows);
    if (query) {
      valueNode = <LookupValueButton displayValue={displayValue} query={query} />;
    }
  }

  const inner =
    badgeKind && badgeKind !== "phone" ? (
      <span className="inline-flex flex-wrap items-center gap-2">
        {valueNode}
        <PixKeyTypeBadge kind={badgeKind} locale={locale} />
      </span>
    ) : (
      <>{valueNode}</>
    );

  return (
    <MerchantCityEnrichedValue
      rawValue={row.value}
      locale={locale}
      active={row.id === "60" && row.parentId === null}
    >
      <PhoneEnrichedValue
        rawValue={row.value}
        locale={locale}
        displayValue={displayValue}
      >
        <CepEnrichedValue
          rawValue={row.value}
          locale={locale}
          active={row.id === "61" && row.parentId === null}
        >
          {inner}
        </CepEnrichedValue>
      </PhoneEnrichedValue>
    </MerchantCityEnrichedValue>
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
