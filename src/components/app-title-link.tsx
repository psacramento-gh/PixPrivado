"use client";

import { Link } from "next-view-transitions";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppTitleLink({
  title,
  ariaLabel,
  onNavigateHome,
}: {
  title: string;
  ariaLabel: string;
  onNavigateHome?: () => void;
}) {
  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      onClick={() => onNavigateHome?.()}
      className={cn(
        // Participate in CardTitle flex layout like the pre-link icon + text row.
        "contents text-inherit no-underline",
        "[&_svg]:transition-opacity hover:[&_svg]:opacity-80",
        "hover:[&_span]:opacity-80",
        "focus-visible:[&_svg]:opacity-80 focus-visible:[&_span]:opacity-80",
        "focus-visible:outline-none",
      )}
    >
      <QrCode
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <span>{title}</span>
    </Link>
  );
}
