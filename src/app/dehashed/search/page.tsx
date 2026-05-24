import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { searchDehashed } from "@/lib/dehashed/api-search";
import { entryRows } from "@/lib/dehashed/format-entry";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function DehashedSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  if (!query) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
        <h1 className="text-lg font-semibold">Dehashed search</h1>
        <p className="text-sm text-muted-foreground">Missing search query.</p>
        <Link href="/" className="text-sm underline">
          Back to PIX decoder
        </Link>
      </main>
    );
  }

  const result = await searchDehashed(query);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-xs text-muted-foreground underline">
          ← PIX decoder
        </Link>
        <h1 className="text-lg font-semibold">Dehashed results</h1>
        <p className="font-mono text-xs break-all text-muted-foreground">{result.query}</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <p>
          Results below use your server <strong>DEHASHED_API_KEY</strong>. The Dehashed
          website link requires a separate browser login at{" "}
          <span className="font-mono text-xs">app.dehashed.com</span> — the API key does
          not sign you in there.
        </p>
        <a
          href={result.webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
        >
          Open same query on Dehashed
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>

      {!result.ok ? (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
          {result.status ? ` (HTTP ${result.status})` : null}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {result.total === 0
              ? "No entries returned."
              : `Showing ${result.entries.length} of ${result.total} result(s).`}
            {result.balance !== undefined ? ` API balance: ${result.balance}.` : null}
          </p>
          {result.entries.length > 0 ? (
            <div className="flex flex-col gap-8">
              {result.entries.map((entry, index) => {
                const rows = entryRows(entry);
                return (
                  <section key={String(entry.id ?? index)} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Entry {index + 1}
                      {entry.id ? ` · ${String(entry.id)}` : null}
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Field</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.field}>
                            <TableCell className="text-xs text-muted-foreground">
                              {row.field}
                            </TableCell>
                            <TableCell className="font-mono text-xs break-all">
                              {row.value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
