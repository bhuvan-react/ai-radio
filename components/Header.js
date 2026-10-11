"use client";

import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MicButton from "@/components/MicButton";

export default function Header({ query, onQuery, onVoice }) {
  const { t } = useLanguage();

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
               stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <path d="M8 11 17 4" />
            <circle cx="8.5" cy="16" r="2.5" />
            <path d="M14 15h3M14 18h3" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-name">{t("appName")}</div>
          <div className="brand-tag">{t("tagline")}</div>
        </div>
      </div>

      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round"
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
