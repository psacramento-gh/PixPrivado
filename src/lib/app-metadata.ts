import type { Metadata } from "next";
import {
  APP_ABOUT_METADATA_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_METADATA_DESCRIPTION,
} from "@/lib/app-brand";

export const rootMetadata: Metadata = {
  title: APP_DISPLAY_NAME,
  description: APP_METADATA_DESCRIPTION,
  appleWebApp: {
    capable: true,
    title: APP_DISPLAY_NAME,
    statusBarStyle: "default",
  },
};

export const aboutMetadata: Metadata = {
  title: `About — ${APP_DISPLAY_NAME}`,
  description: APP_ABOUT_METADATA_DESCRIPTION,
};
