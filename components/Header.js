"use client";

/**
 * Search, voice and language.
 *
 * The brand used to live here. It now sits on the cabinet's brass plate where
 * a radio's name belongs, so this row carries only the controls.
 */

import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MicButton from "@/components/MicButton";

export default function Header({ query, onQuery, onVoice }) {
  const { t } = useLanguage();

  return (
    <header className="header">
      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
             aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          type="search"
        />
      </div>

      <div className="header-right">
        <MicButton onResult={onVoice} />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
