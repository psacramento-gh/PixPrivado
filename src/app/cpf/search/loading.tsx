import { AppFrame } from "@/components/app-frame";
import { APP_DISPLAY_NAME } from "@/lib/app-brand";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className ?? ""}`}
      aria-hidden
    />
  );
}

export default function CpfSearchLoading() {
  return (
    <AppFrame
      title={APP_DISPLAY_NAME}
      titleAriaLabel={APP_DISPLAY_NAME}
      aboutLinkLabel="About"
    >
      <header className="flex flex-col gap-3">
        <SkeletonBar className="h-8 w-36" />
        <SkeletonBar className="h-4 w-full max-w-md" />
      </header>

      <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
        <div className="flex flex-col gap-1.5">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-4 w-full" />
        </div>
        <SkeletonBar className="h-4 w-48" />
        <div className="overflow-hidden rounded-lg border">
          <div className="flex flex-col gap-0 divide-y">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex gap-3 px-3 py-2.5">
                <SkeletonBar className="h-4 w-[34%] shrink-0" />
                <SkeletonBar className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
