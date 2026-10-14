"use client";

/**
 * India / World / Saved.
 *
 * Was a vertical sidebar. The cabinet now occupies the left of the screen on a
 * wide window and the top on a phone, so the tabs became a horizontal strip
 * above the list — the one shape that works in both places without a second
 * layout.
 */

import { useLanguage } from "@/context/LanguageContext";
import { usePlayer } from "@/context/PlayerContext";

export default function Tabs({ tab, onTab }) {
  const { t } = useLanguage();
  const { favorites } = usePlayer();

  const tabs = [
    { id: "india",         label: t("tabIndia") },
    { id: "international", label: t("tabInternational") },
    { id: "favorites",     label: t("tabFavorites"), count: favorites.length },
  ];

  return (
    <nav className="tabs" aria-label={t("browse")}>
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          className="tab"
          data-active={tab === item.id}
          onClick={() => onTab(item.id)}
          aria-current={tab === item.id ? "page" : undefined}
        >
          <span>{item.label}</span>
          {item.count > 0 && <span className="count">{item.count}</span>}
        </button>
      ))}
    </nav>
  );
}
