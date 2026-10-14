"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import Collections from "@/components/Collections";
import StationCard from "@/components/StationCard";
import Cabinet from "@/components/Cabinet";
import { useLanguage } from "@/context/LanguageContext";
import { usePlayer } from "@/context/PlayerContext";
import { COLLECTIONS } from "@/lib/collections";

export default function Home() {
  const { t } = useLanguage();
  const { favorites, isDead, station, play } = usePlayer();

  const [tab, setTab] = useState("india");
  const [collection, setCollection] = useState(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const sentinel = useRef(null);
  // Guards against a second page being requested while one is in flight, and
  // against the observer firing again for an offset already fetched.
  const fetching = useRef(false);
  const nextOffset = useRef(0);

  // Typing shouldn't fire a request per keystroke at a volunteer-run directory.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 420);
    return () => clearTimeout(id);
  }, [query]);

  /** Fetch one page. `reset` starts the list again; otherwise it appends. */
  const loadPage = useCallback(
    async (offset, { reset = false, signal } = {}) => {
      // The guard exists to stop the scroll observer firing the same page
      // twice. A reset must never be blocked by it — tapping two collection
      // chips quickly would otherwise drop the second one silently and leave
      // the first collection's stations under the second one's heading.
      if (fetching.current && !reset) return;
      fetching.current = true;
      reset ? setLoading(true) : setLoadingMore(true);
      setError("");

      const params = new URLSearchParams({ scope: tab, offset: String(offset) });
      if (debounced) params.set("q", debounced);
      // A collection replaces the scope entirely — it is its own query. The
      // scope still travels with it so the route knows which tab asked.
      if (collection && !debounced) params.set("collection", collection);

      try {
        const res = await fetch(`/api/stations?${params}`, { signal });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const page = data.stations ?? [];
        setHasMore(Boolean(data.hasMore));
        nextOffset.current = offset + 100;   // matches the route's page size

        setStations((prev) => {
          if (reset) return page;
          // The directory can repeat a station across pages; a duplicated key
          // would break React's reconciliation, so merge rather than concat.
          const seen = new Set(prev.map((s) => s.id));
          return [...prev, ...page.filter((s) => !seen.has(s.id))];
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          if (reset) setStations([]);
          setError(err.message || t("loadFailed"));
          setHasMore(false);
        }
      } finally {
        fetching.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // `t` changes with language; rebuilding this on a language switch would
    // refetch the list for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, debounced, collection]
  );

  // Start again whenever the tab, the search or the collection changes.
  useEffect(() => {
    if (tab === "favorites") {
      setStations(favorites);
      setHasMore(false);
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    nextOffset.current = 0;
    fetching.current = false;
    loadPage(0, { reset: true, signal: controller.signal });
    return () => controller.abort();
  }, [tab, debounced, favorites, loadPage]);

  /**
   * Load the next page when the bottom of the list comes into view.
   *
   * rootMargin pulls the trigger 600px early so the next page is usually
   * already there by the time the reader reaches the end — the list just keeps
   * going rather than stopping to load.
   */
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore || loading || tab === "favorites") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetching.current) {
          loadPage(nextOffset.current);
        }
      },
      { root: node.closest(".main"), rootMargin: "600px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, loading, tab, loadPage]);

  // Stations that failed to play twice are kept out of the list. The count is
  // shown rather than hidden silently — a list quietly shrinking is confusing,
  // and it explains why a station someone remembers has gone.
  const visible = useMemo(
    () => stations.filter((s) => !isDead(s.id)),
    [stations, isDead]
  );
  const hidden = stations.length - visible.length;

  // The cabinet's skip buttons walk the list on screen, so they follow
  // whatever the listener is currently browsing rather than some separate
  // queue they cannot see.
  const index = station ? visible.findIndex((s) => s.id === station.id) : -1;
  const goPrev = useCallback(() => {
    if (index > 0) play(visible[index - 1]);
  }, [index, visible, play]);
  const goNext = useCallback(() => {
    if (index !== -1 && index < visible.length - 1) play(visible[index + 1]);
  }, [index, visible, play]);

  const title =
    collection && !debounced
      ? COLLECTIONS[collection]?.label ?? ""
      : {
          india: t("tabIndia"),
          international: t("tabInternational"),
          favorites: t("tabFavorites"),
        }[tab];

  return (
    <div className="shell">
      <Cabinet
        onPrev={index > 0 ? goPrev : undefined}
        onNext={index !== -1 && index < visible.length - 1 ? goNext : undefined}
      />

      <div className="browse">
        <Header query={query} onQuery={setQuery} onVoice={setQuery} />

        <Tabs
          tab={tab}
          onTab={(next) => { setTab(next); setCollection(null); }}
        />

        {tab !== "favorites" && !debounced && (
          <Collections
            scope={tab}
            active={collection}
            onSelect={setCollection}
          />
        )}

        <main className="main">
          <div className="main-head">
            <h1 className="main-title">{debounced || title}</h1>
            {!loading && !error && visible.length > 0 && (
              <span className="main-sub">
                {t(visible.length === 1 ? "stationsCountOne" : "stationsCount",
                   { count: visible.length })}
                {hidden > 0 ? ` · ${t("hiddenCount", { count: hidden })}` : ""}
              </span>
            )}
          </div>

          {loading && (
            <div className="grid" aria-busy="true" aria-label={t("loading")}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="empty">
              <div className="empty-title">{t("loadFailed")}</div>
              <div className="empty-hint">{error}</div>
              <button
                type="button"
                className="coll"
                style={{ marginTop: 12 }}
                onClick={() => loadPage(0, { reset: true })}
              >
                {t("retry")}
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="empty">
              <div className="empty-title">
                {tab === "favorites" ? t("noFavorites") : t("noResults")}
              </div>
              <div className="empty-hint">
                {tab === "favorites" ? t("noFavoritesHint") : t("noResultsHint")}
              </div>
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              <div className="grid">
                {visible.map((s) => (
                  <StationCard key={s.id} station={s} />
                ))}
              </div>

              {/* Watched by the observer above; sits below the list so it comes
                  into view as the reader nears the end. */}
              <div ref={sentinel} style={{ height: 1 }} aria-hidden="true" />

              {loadingMore && (
                <div className="loading-more">{t("loading")}</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
