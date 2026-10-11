"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlayer } from "@/context/PlayerContext";

/**
 * Station logos come from thousands of unrelated hosts and a good number are
 * dead links. A broken image icon on a third of the grid looks like the app
 * is broken, so a failed load falls back to the station's initials.
 */
export default function StationCard({ station }) {
  const { t } = useLanguage();
  const { play, station: current, isFavorite, toggleFavorite } = usePlayer();
  const [logoBroken, setLogoBroken] = useState(false);

  const playing = current?.id === station.id;
  const faved = isFavorite(station.id);

  const initials = station.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="card"
      data-playing={playing}
      role="button"
      tabIndex={0}
      onClick={() => play(station)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          play(station);
        }
      }}
      aria-label={`${t("play")} ${station.name}`}
    >
      <button
        className="heart"
        data-on={faved}
        onClick={(e) => {
          e.stopPropagation();          // the card itself plays; the heart must not
          toggleFavorite(station);
        }}
        aria-label={faved ? t("removeFavorite") : t("addFavorite")}
        title={faved ? t("removeFavorite") : t("addFavorite")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24"
             fill={faved ? "currentColor" : "none"} stroke="currentColor"
             strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8c0 4.8-7 9.2-7 9.2z" />
        </svg>
      </button>

      <div className="card-top">
        {station.favicon && !logoBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="logo"
            src={station.favicon}
            alt=""
            loading="lazy"
            onError={() => setLogoBroken(true)}
          />
        ) : (
          <div className="logo-fallback" aria-hidden="true">{initials}</div>
        )}

        <div style={{ minWidth: 0 }}>
          <div className="card-name" title={station.name}>{station.name}</div>
          <div className="card-where">
            {station.country || station.language || "—"}
            {station.bitrate ? ` · ${station.bitrate}kbps` : ""}
          </div>
        </div>
      </div>

      {station.tags.length > 0 && (
        <div className="tags">
          {station.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
