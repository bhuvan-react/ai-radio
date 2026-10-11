"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * The manual override. Choosing here beats whatever detection decided, and
 * the choice is kept — see LanguageContext.
 *
 * Each language is listed in its own script, with the English name alongside.
 * Someone looking for Telugu scans for తెలుగు, not for the word "Telugu".
 */
export default function LanguageSwitcher() {
  const { language, setLanguage, languages, meta, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang" ref={ref}>
      <button
        className="lang-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("language")}
      >
        <span aria-hidden="true">{meta.flag}</span>
        <span>{meta.native}</span>
        <svg className="chev" width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="lang-menu" role="listbox" aria-label={t("language")}>
          {languages.map((l) => (
            <button
              key={l.code}
              className="lang-item"
              data-active={l.code === language}
              role="option"
              aria-selected={l.code === language}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
            >
              <span aria-hidden="true">{l.flag}</span>
              <span className="native">{l.native}</span>
              <span className="latin">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
