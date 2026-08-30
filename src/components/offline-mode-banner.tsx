"use client";

import { WifiOff } from "lucide-react";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";
import { useOfflineMode } from "@/components/offline-mode-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OfflineModeBanner({ locale }: { locale: Locale }) {
  const { offline, preference, browserOnline } = useOfflineMode();

  if (!offline) return null;

  const disconnected = !browserOnline && !preference;

  return (
    <Alert
      role="status"
      className="border-border bg-muted/40 *:[svg]:text-muted-foreground"
    >
      <WifiOff aria-hidden />
      <AlertTitle>
        {t(
          locale,
          disconnected
            ? "offlineModeDisconnectedTitle"
            : "offlineModeBannerTitle",
        )}
      </AlertTitle>
      <AlertDescription>
        {t(
          locale,
          disconnected
            ? "offlineModeDisconnectedDetail"
            : "offlineModeBannerDetail",
        )}
      </AlertDescription>
    </Alert>
  );
}
