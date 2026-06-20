import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { AppTitleLink } from "@/components/app-title-link";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Locale } from "@/lib/brcode/labels";
import { t } from "@/lib/i18n";

const footerLinkClass =
  "font-medium text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground";

const footerSecondaryLinkClass =
  "font-medium text-muted-foreground underline decoration-muted-foreground/60 decoration-dotted underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm";

/** Shared shell width for decoder, About, and other AppFrame screens. */
export const APP_FRAME_MAX_WIDTH_CLASS = "max-w-2xl";

export function AppFrame({
  title,
  titleAriaLabel,
  onTitleNavigateHome,
  headerActions,
  locale,
  children,
}: {
  title: string;
  titleAriaLabel: string;
  onTitleNavigateHome?: () => void;
  headerActions?: ReactNode;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh justify-center bg-background p-4">
      <Card
        className={cn(
          "app-frame-shell flex w-full min-h-[calc(100dvh-2rem)] flex-col gap-0 shadow-sm",
          APP_FRAME_MAX_WIDTH_CLASS,
        )}
      >
        <CardHeader className="items-center border-border border-b">
          <CardTitle className="col-start-1 row-start-1 flex min-h-8 items-center gap-2 self-center rounded-sm text-lg leading-none tracking-tight focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <AppTitleLink
              title={title}
              ariaLabel={titleAriaLabel}
              onNavigateHome={onTitleNavigateHome}
            />
          </CardTitle>
          {headerActions ? (
            <CardAction className="col-start-2 row-span-1 row-start-1 flex items-center gap-2 self-center">
              {headerActions}
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-4">
          <main className="app-frame-main flex flex-1 flex-col gap-6">{children}</main>
        </CardContent>
        <footer
          role="contentinfo"
          className="flex max-w-full flex-col items-center gap-1 border-border border-t px-4 py-3 text-xs text-muted-foreground"
        >
          <p className="m-0 flex max-w-full flex-row flex-nowrap items-center justify-center gap-x-1 overflow-x-auto overscroll-x-contain whitespace-nowrap leading-relaxed sm:gap-x-2">
            {t(locale, "footerBuiltByPrefix")}{" "}
            <a
              href="https://www.psacramento.com/pix-privado-a-practical-tool-for-inspecting-privacy-risks-in-pix-payment-information/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(footerLinkClass, "shrink-0")}
            >
              {t(locale, "footerAuthorLink")}
            </a>
            {" · "}
            <a
              href="https://x.com/psacramento_x"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(footerLinkClass, "shrink-0")}
            >
              {t(locale, "footerXProfile")}
            </a>
            {" · "}
            <a
              href="https://github.com/psacramento-gh/PixPrivado"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(footerLinkClass, "shrink-0")}
            >
              {t(locale, "footerGitHub")}
            </a>
          </p>
          <p className="m-0 leading-relaxed">
            <Link href="/about" className={footerSecondaryLinkClass}>
              {t(locale, "about")}
            </Link>
          </p>
        </footer>
      </Card>
    </div>
  );
}
