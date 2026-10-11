"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePlayer } from "@/context/PlayerContext";

const ICONS = {
  india: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" />
    </svg>
  ),
  international: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a13 13 0 0 1 4 9 13 13 0 0 1-4 9 13 13 0 0 1-4-9 13 13 0 0 1 4-9" />
    </svg>
  ),
  favorites: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8c0 4.8-7 9.2-7 9.2z" />
    </svg>
  ),
};

export default function Sidebar({ tab, onTab }) {
  const { t } = useLanguage();
  const { favorites } = usePlayer();

  const tabs = [
    { id: "india",         label: t("tabIndia") },
    { id: "international", label: t("tabInternational") },
    { id: "favorites",     label: t("tabFavorites"), count: favorites.length },
  ];

  return (
    <nav className="sidebar" aria-label={t("browse")}>
      <div className="side-label">{t("browse")}</div>
      {tabs.map((item) => (
        <button
          key={item.id}
          className="tab"
          data-active={tab === item.id}
          onClick={() => onTab(item.id)}
          aria-current={tab === item.id ? "page" : undefined}
        >
          {ICONS[item.id]}
          <span>{item.label}</span>
          {item.count > 0 && <span className="count">{item.count}</span>}
        </button>
      ))}
    </nav>
  );
}
