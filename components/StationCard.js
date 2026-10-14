"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePlayer, dialFrequency } from "@/context/PlayerContext";

/**
 * One station, drawn as a printed label.
 *
 * The whole card tunes in, but it is a real `<button>` that does it rather
 * than a div with a click handler — the name stretches over the card with a
 * pseudo-element, so a pointer can hit anywhere while a keyboard still finds
 * one focusable control with a sensible label. The bookmark sits above it and
 * stops the click from reaching through.
 *
 * Station logos are gone. They came from thousands of unrelated hosts, a good
 * number were dead links, and the cream label reads better without a grid of
 * mismatched squares on it.
 */
export default function StationCard({ station }) {
  const { t } = useLanguage();
  const { play, station: current, status, isFavorite, toggleFavorite } = usePlayer();

  const playing = current?.id === station.id;
  const live = playing && status === "playing";
  const faved = isFavorite(station.id);

  const where =
    [station.country || station.language, station.bitrate ? `${station.bitrate} kbps` : null]
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <div className="card" data-playing={playing}>
      <button
        type="button"
        className="card-main"
        onClick={() => play(station)}
        aria-label={`${t("play")} ${station.name}`}
      >
        <span className="card-name" title={station.name}>{station.name}</span>
        <span className="card-where">{where}</span>
      </button>

      <span className="card-freq" aria-hidden="true">{dialFrequency(station.id)}</span>

      {playing && (
        <span className="card-live" data-live={live}>
          <span className="bars" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          {live ? t("nowPlaying") : t("buffering")}
        </span>
      )}

      <button
        type="button"
        className="fav"
        data-on={faved}
        onClick={() => toggleFavorite(station)}
        aria-label={faved ? t("removeFavorite") : t("addFavorite")}
        title={faved ? t("removeFavorite") : t("addFavorite")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24"
             fill={faved ? "currentColor" : "none"} stroke="currentColor"
             strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
