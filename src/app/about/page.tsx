import type { Metadata } from "next";
import { AboutView } from "@/components/about-view";

export const metadata: Metadata = {
  title: "About — PIX QR Decoder",
  description:
    "Why the Pix QR Code Decoder exists, what it does, and how to use it responsibly for privacy awareness.",
};

export default function AboutPage() {
  return <AboutView />;
}
