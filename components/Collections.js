"use client";

/**
 * Curated collections — languages, moods, singers.
 *
 * A horizontal strip rather than a second sidebar: there are twenty-odd of
 * them, they are browsed rather than navigated, and on a phone a strip is the
 * only shape that works. Groups are separated by a label so "Tamil" and
 * "Arijit Singh" are not presented as the same kind of thing.
 */

import { useLanguage } from "@/context/LanguageContext";
import { COLLECTION_GROUPS } from "@/lib/collections";

export default function Collections({ active, onSelect }) {
  const { t } = useLanguage();

  return (
    <div className="collections" role="group" aria-label={t("groupCollections")}>
      <button
        className="coll"
        data-active={!active}
        onClick={() => onSelect(null)}
      >
        {t("collAll")}
      </button>

      {COLLECTION_GROUPS.map((group) => (
        <div className="coll-group" key={group.id}>
          <span className="coll-label">{t(group.titleKey)}</span>
          {group.items.map((item) => (
            <button
              key={item.id}
              className="coll"
              data-active={active === item.id}
              onClick={() => onSelect(active === item.id ? null : item.id)}
              aria-pressed={active === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
