import { Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@vercel/analytics/next";
import { OfflineModeProvider } from "@/components/offline-mode-provider";
import { OfflineServiceWorker } from "@/components/offline-service-worker";
import { ThemeProvider } from "@/components/theme-provider";
import { rootMetadata } from "@/lib/app-metadata";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-dvh flex flex-col bg-background font-sans text-foreground">
          <ThemeProvider>
            <OfflineModeProvider>
              <OfflineServiceWorker />
              {children}
            </OfflineModeProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ViewTransitions>
  );
}
