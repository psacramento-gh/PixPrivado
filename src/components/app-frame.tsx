import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppTitleLink } from "@/components/app-title-link";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const footerLinkClass =
  "font-medium text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground";

export function AppFrame({
  title,
  titleAriaLabel,
  onTitleNavigateHome,
  headerActions,
  children,
}: {
  title: string;
  titleAriaLabel: string;
  onTitleNavigateHome?: () => void;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh justify-center bg-background p-4">
      <Card className="flex w-full max-w-2xl min-h-[calc(100dvh-2rem)] flex-col gap-0 shadow-sm">
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
          <main className="flex flex-1 flex-col gap-6">{children}</main>
        </CardContent>
        <footer
          role="contentinfo"
          className="flex max-w-full flex-row flex-nowrap items-center justify-center gap-x-1 overflow-x-auto overscroll-x-contain border-border border-t px-4 py-3 text-xs text-muted-foreground sm:gap-x-2"
        >
          <p className="m-0 shrink-0 whitespace-nowrap leading-relaxed">
            BR Code (EMV) ·{" "}
            <a
              href="https://www.bcb.gov.br/estabilidadefinanceira/pix"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(footerLinkClass, "shrink-0 whitespace-nowrap")}
            >
              BCB Pix
            </a>
          </p>
        </footer>
      </Card>
    </div>
  );
}
