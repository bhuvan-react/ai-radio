"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePlayer } from "@/context/PlayerContext";

export default function Player() {
  const { t } = useLanguage();
  const {
    station, status, volume, setVolume,
    djEnabled, setDjEnabled, toggle,
  } = usePlayer();

  const stateLabel = {
    idle: station ? t("pause") : t("nothingPlaying"),
    buffering: t("buffering"),
    playing: t("nowPlaying"),
    error: t("streamFailed"),
  }[status];

  return (
    <div className="player">
      <button
        className="play-btn"
        onClick={toggle}
        disabled={!station}
        aria-label={status === "playing" ? t("pause") : t("play")}
        title={status === "playing" ? t("pause") : t("play")}
      >
        {status === "playing" ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
          </svg>
        )}
      </button>

      <div className="now">
        <div style={{ minWidth: 0 }}>
          <div className="now-name">{station?.name ?? t("nothingPlaying")}</div>
          <div className="now-state" data-error={status === "error"}>
            {stateLabel}
          </div>
        </div>
      </div>

      <div className="player-right">
        <button
          className="chip"
          data-on={djEnabled}
          onClick={() => setDjEnabled(!djEnabled)}
          aria-pressed={djEnabled}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
          </svg>
          {djEnabled ? t("djOn") : t("djOff")}
        </button>

        <div className="vol">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" />
            <path d="M16 9a4 4 0 0 1 0 6" />
          </svg>
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label={t("volume")}
          />
        </div>
      </div>
    </div>
  );
}
