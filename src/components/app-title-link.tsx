"use client";

import Link from "next/link";
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
        "inline-flex items-center gap-2 text-inherit no-underline",
        "rounded-sm outline-none transition-opacity",
        "hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <QrCode
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      {title}
    </Link>
  );
}
