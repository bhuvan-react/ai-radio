"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StationCard from "@/components/StationCard";
import Player from "@/components/Player";
import { useLanguage } from "@/context/LanguageContext";
import { usePlayer } from "@/context/PlayerContext";

export default function Home() {
  const { t } = useLanguage();
  const { favorites, announce } = usePlayer();

  const [tab, setTab] = useState("india");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const greeted = useRef(false);
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
      if (fetching.current) return;
      fetching.current = true;
      reset ? setLoading(true) : setLoadingMore(true);
      setError("");

      const params = new URLSearchParams({ scope: tab, offset: String(offset) });
      if (debounced) params.set("q", debounced);

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

        if (reset && debounced) {
          announce(page.length ? "foundResults" : "foundNothing", {
            count: page.length,
          });
        }
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
    // `announce` and `t` change with language; rebuilding this on a language
    // switch would refetch the list for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, debounced]
  );

  // Start again whenever the tab or the search changes.
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

  // Greet once, after the language has settled, so the welcome is not spoken
  // in English and then corrected.
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    const id = setTimeout(() => announce("welcome"), 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = {
    india: t("tabIndia"),
    international: t("tabInternational"),
    favorites: t("tabFavorites"),
  }[tab];

  return (
    <div className="shell">
      <Header query={query} onQuery={setQuery} onVoice={setQuery} />

      <div className="body-row">
        <Sidebar tab={tab} onTab={setTab} />

        <main className="main">
          <div className="main-head">
            <h1 className="main-title">{debounced || title}</h1>
            {!loading && !error && stations.length > 0 && (
              <span className="main-sub">
                {t("stationsCount", { count: stations.length })}
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
                className="chip"
                style={{ marginTop: 10 }}
                onClick={() => setDebounced((d) => `${d}`)}
              >
                {t("retry")}
              </button>
            </div>
          )}

          {!loading && !error && stations.length === 0 && (
            <div className="empty">
              <div className="empty-title">
                {tab === "favorites" ? t("noFavorites") : t("noResults")}
              </div>
              <div className="empty-hint">
                {tab === "favorites" ? t("noFavoritesHint") : t("noResultsHint")}
              </div>
            </div>
          )}

          {!loading && !error && stations.length > 0 && (
            <>
              <div className="grid">
                {stations.map((s) => (
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

      <Player />
    </div>
  );
}
