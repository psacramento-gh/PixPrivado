"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/brcode/labels";
import {
  readLocalePreference,
  writeLocalePreference,
} from "@/lib/locale-preference";

export function useAppLocale(): [Locale, (locale: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(readLocalePreference());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeLocalePreference(next);
  }, []);

  return [locale, setLocale];
}
