"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppFrame } from "@/components/app-frame";
import { AboutBlocks } from "@/components/about-blocks";
import { AppHeaderActions } from "@/components/app-header-actions";
import { buttonVariants } from "@/components/ui/button";
import { getAboutContent } from "@/lib/about-content";
import { t } from "@/lib/i18n";
import { useAppLocale } from "@/lib/use-app-locale";
import { cn } from "@/lib/utils";

export function AboutView() {
  const [locale, setLocale] = useAppLocale();
  const content = getAboutContent(locale);

  return (
    <AppFrame
      title={t(locale, "title")}
      titleAriaLabel={t(locale, "titleHomeAria")}
      maxWidthClass="max-w-3xl"
      aboutLinkLabel={t(locale, "about")}
      headerActions={
        <AppHeaderActions locale={locale} onLocaleChange={setLocale} />
      }
    >
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t(locale, "backToDecoder")}
        </Link>
      </header>

      <article className="flex flex-col gap-8 text-sm">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {content.title}
          </h1>
          <AboutBlocks blocks={content.intro} />
        </div>

        {content.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {section.heading}
            </h2>
            <AboutBlocks blocks={section.blocks} />
          </section>
        ))}
      </article>
    </AppFrame>
  );
}
