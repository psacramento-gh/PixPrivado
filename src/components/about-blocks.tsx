import type { AboutBlock } from "@/lib/about-content";
import { cn } from "@/lib/utils";

function AboutBlockView({ block }: { block: AboutBlock }) {
  if (block.kind === "emphasis") {
    return (
      <p className="font-semibold text-foreground leading-relaxed">{block.text}</p>
    );
  }

  if (block.kind === "contrast") {
    return (
      <ul className="m-0 list-none space-y-2 p-0">
        {block.items.map((item) => (
          <li key={item.label} className="leading-relaxed">
            <span className="font-semibold text-foreground">{item.label}</span>{" "}
            <span className="text-muted-foreground">{item.body}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="leading-relaxed text-muted-foreground">{block.text}</p>;
}

export function AboutBlocks({
  blocks,
  className,
}: {
  blocks: AboutBlock[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {blocks.map((block, index) => (
        <AboutBlockView key={index} block={block} />
      ))}
    </div>
  );
}
