"use client";

/**
 * Curated collections — a few chips, and the rest behind "View all".
 *
 * There are twenty-odd collections per tab. Showing them all made a strip that
 * wrapped into four rows on a phone and pushed the stations off the screen, so
 * only as many as the width can carry are shown inline and the full set opens
 * in a sheet.
 *
 * How many is decided by media query rather than by measuring: measuring needs
 * a layout pass, which means the strip renders at the wrong length first and
 * visibly reflows. Three breakpoints are close enough and never jump.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { groupsForScope } from "@/lib/collections";

const BREAKPOINTS = [
  { query: "(min-width: 1180px)", count: 9 },
  { query: "(min-width: 900px)",  count: 7 },
  { query: "(min-width: 620px)",  count: 5 },
];

/** The smallest count, used for the server render so nothing ever overflows. */
const NARROW_COUNT = 3;

export default function Collections({ scope, active, onSelect }) {
  const { t } = useLanguage();
  const groups = useMemo(() => groupsForScope(scope), [scope]);

  // Server and first client render agree on the narrow count; the real one is
  // measured after mount. Reading matchMedia during render would not match
  // what the server produced and React would throw away the markup.
  const [visibleCount, setVisibleCount] = useState(NARROW_COUNT);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const lists = BREAKPOINTS.map((b) => window.matchMedia(b.query));
    const apply = () => {
      const hit = BREAKPOINTS.findIndex((_, i) => lists[i].matches);
      setVisibleCount(hit === -1 ? NARROW_COUNT : BREAKPOINTS[hit].count);
    };
    apply();
    lists.forEach((l) => l.addEventListener("change", apply));
    return () => lists.forEach((l) => l.removeEventListener("change", apply));
  }, []);

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  /**
   * The chips on show: the first few, plus the selected one wherever it sits.
   * Without that, choosing "Shreya Ghoshal" from the sheet would close it and
   * leave nothing on the strip looking selected.
   */
  const shown = useMemo(() => {
    const head = allItems.slice(0, visibleCount);
    if (active && !head.some((i) => i.id === active)) {
      const chosen = allItems.find((i) => i.id === active);
      if (chosen) return [...head.slice(0, Math.max(1, visibleCount - 1)), chosen];
    }
    return head;
  }, [allItems, visibleCount, active]);

  const hiddenCount = allItems.length - shown.length;

  const close = useCallback(() => {
    setOpen(false);
    setFilter("");
    openerRef.current?.focus();
  }, []);

  // Escape closes, and focus moves into the sheet so a keyboard or screen
  // reader lands inside it rather than behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector("input")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const choose = (id) => {
    onSelect(active === id ? null : id);
    if (open) close();
  };

  const needle = filter.trim().toLowerCase();
  const filtered = groups
    .map((g) => ({
      ...g,
      items: needle
        ? g.items.filter((i) => i.label.toLowerCase().includes(needle))
        : g.items,
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <div className="collections" role="group" aria-label={t("groupCollections")}>
        <button
          type="button"
          className="coll"
          data-active={!active}
          onClick={() => onSelect(null)}
        >
          {t("collAll")}
        </button>

        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            className="coll"
            data-active={active === item.id}
            onClick={() => choose(item.id)}
            aria-pressed={active === item.id}
          >
            {item.label}
          </button>
        ))}

        {hiddenCount > 0 && (
          <button
            type="button"
            className="coll coll-more"
            ref={openerRef}
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
          >
            {t("viewAll", { count: allItems.length })}
          </button>
        )}
      </div>

      {open && (
        <div className="sheet-wrap" onMouseDown={(e) => {
          // Only a click on the backdrop itself closes — a drag that starts
          // inside the sheet and ends outside should not.
          if (e.target === e.currentTarget) close();
        }}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t("groupCollections")}
            ref={dialogRef}
          >
            <div className="sheet-head">
              <h2 className="sheet-title">{t("groupCollections")}</h2>
              <button
                type="button"
                className="sheet-close"
                onClick={close}
                aria-label={t("close")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                     aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="sheet-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" />
              </svg>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t("filterCollections")}
                aria-label={t("filterCollections")}
              />
            </div>

            <div className="sheet-body">
              {filtered.length === 0 && (
                <p className="sheet-empty">{t("noResults")}</p>
              )}
              {filtered.map((group) => (
                <section className="sheet-group" key={group.id}>
                  <h3 className="sheet-group-title">{t(group.titleKey)}</h3>
                  <div className="sheet-chips">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="coll"
                        data-active={active === item.id}
                        onClick={() => choose(item.id)}
                        aria-pressed={active === item.id}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
