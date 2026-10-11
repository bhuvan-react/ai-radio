"use client";

/**
 * Which language the interface speaks.
 *
 * THE HYDRATION RULE, because this is the one place it bites:
 *
 * The server has no idea who is visiting — no localStorage, no navigator, no
 * IP lookup. So the server renders DEFAULT_LANGUAGE, every time, for everyone.
 * Detection happens after mount, inside an effect, and then the language
 * switches. Reading a stored preference during render would make the server
 * HTML and the first client render disagree, which is exactly the mismatch
 * error this is written to avoid.
 *
 * The visible cost is one frame of English before the real language appears.
 * That is the correct trade — the alternative is either a hydration error or
 * blocking the whole page on a network call to an IP service.
 *
 * Detection order, first answer wins:
 *   1. what the visitor chose before      (localStorage)
 *   2. the browser's own language         (navigator.languages)
 *   3. the country their IP is in         (ipapi.co, best effort)
 *   4. English
 *
 * The browser's setting is tried before the IP lookup on purpose: it is the
 * visitor's actual stated preference, it needs no network call, and it is
 * right more often. A Telugu speaker in France wants Telugu, not French.
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  COUNTRY_LANGUAGE,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  TRANSLATIONS,
} from "@/lib/translations";

const STORAGE_KEY = "ai-radio-language";

const LanguageContext = createContext(null);

const isSupported = (code) => LANGUAGES.some((l) => l.code === code);

function fromBrowser() {
  if (typeof navigator === "undefined") return null;
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    if (!tag) continue;
    const base = tag.split("-")[0].toLowerCase();
    if (isSupported(base)) return base;
  }
  return null;
}

async function fromLocation(signal) {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal });
    if (!res.ok) return null;
    const data = await res.json();
    return COUNTRY_LANGUAGE[data?.country_code] ?? null;
  } catch {
    // Offline, blocked by an ad blocker, rate limited — all fine. This is the
    // least important signal and the app works without it.
    return null;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  // Until this is true the UI is showing the server's guess, not the
  // visitor's language. Components can use it to avoid flashing.
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isSupported(stored)) {
        if (!cancelled) {
          setLanguageState(stored);
          setDetected(true);
        }
        return;
      }

      const browser = fromBrowser();
      if (browser) {
        if (!cancelled) {
          setLanguageState(browser);
          setDetected(true);
          localStorage.setItem(STORAGE_KEY, browser);
        }
        return;
      }

      const located = await fromLocation(controller.signal);
      if (cancelled) return;
      if (located) {
        setLanguageState(located);
        localStorage.setItem(STORAGE_KEY, located);
      }
      setDetected(true);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  /** A manual choice wins over detection, permanently. */
  const setLanguage = (code) => {
    if (!isSupported(code)) return;
    setLanguageState(code);
    setDetected(true);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private browsing with storage disabled. The choice holds for this
      // session, which is better than refusing to change language at all.
    }
  };

  const value = useMemo(() => {
    const dict = TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE];

    /**
     * Look up a key, fill in {placeholders}.
     * Falls back to English for a key a translation has not caught up with,
     * then to the key itself — a missing word should never blank the UI.
     */
    const t = (key, vars) => {
      const read = (source) =>
        key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), source);

      let text = read(dict);
      if (typeof text !== "string") text = read(TRANSLATIONS[DEFAULT_LANGUAGE]);
      if (typeof text !== "string") return key;

      if (!vars) return text;
      return Object.entries(vars).reduce(
        (out, [name, v]) => out.replaceAll(`{${name}}`, String(v)),
        text
      );
    };

    const meta = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

    return { language, setLanguage, t, detected, languages: LANGUAGES, meta };
  }, [language, detected]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
