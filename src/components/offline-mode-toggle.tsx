"use client";

import { Wifi, WifiOff } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useOfflineMode } from "@/components/offline-mode-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OfflineModeToggle({ locale }: { locale: Locale }) {
  const { ready, preference, togglePreference, offline, browserOnline } =
    useOfflineMode();

  const tooltip = !ready
    ? t(locale, "offlineModeEnable")
    : preference
      ? t(locale, "offlineModeDisable")
      : !browserOnline
        ? t(locale, "offlineModeDisconnectedTitle")
        : t(locale, "offlineModeEnable");

  const ariaLabel = preference
    ? t(locale, "offlineModeAriaDisable")
    : t(locale, "offlineModeAriaEnable");

  if (!ready) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        className="pointer-events-none opacity-50"
        aria-hidden
      >
        <Wifi className="size-4" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant={preference ? "default" : "outline"}
              size="icon"
              onClick={togglePreference}
              aria-label={ariaLabel}
              aria-pressed={preference}
            />
          }
        >
          {offline ? (
            <WifiOff className="size-4" aria-hidden />
          ) : (
            <Wifi className="size-4" aria-hidden />
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
