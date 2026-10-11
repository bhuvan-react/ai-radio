"use client";

import { useEffect, useRef, useState } from "react";
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
  const [error, setError] = useState("");

  const greeted = useRef(false);

  // Typing shouldn't fire a request per keystroke at a volunteer-run directory.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 420);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (tab === "favorites") {
      setStations(favorites);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ scope: tab });
    if (debounced) params.set("q", debounced);

    fetch(`/api/stations?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStations(data.stations ?? []);
        if (debounced) {
          announce(
            data.stations?.length ? "foundResults" : "foundNothing",
            { count: data.stations?.length ?? 0 }
          );
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setStations([]);
        setError(err.message || t("loadFailed"));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // `announce` and `t` change with language; refetching on a language switch
    // would be wasteful, so they are deliberately left out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debounced, favorites]);

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
            <div className="grid">
              {stations.map((s) => (
                <StationCard key={s.id} station={s} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Player />
    </div>
  );
}
