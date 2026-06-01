import { AboutView } from "@/components/about-view";
import { aboutMetadata } from "@/lib/app-metadata";

export const metadata = aboutMetadata;

export default function AboutPage() {
  return <AboutView />;
}
