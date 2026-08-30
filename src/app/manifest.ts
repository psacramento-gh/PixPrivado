import type { MetadataRoute } from "next";
import {
  APP_DISPLAY_NAME,
  APP_METADATA_DESCRIPTION,
} from "@/lib/app-brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_DISPLAY_NAME,
    description: APP_METADATA_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f0f12",
    theme_color: "#047857",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
