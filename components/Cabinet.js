"use client";

/**
 * The radio itself: dial, grille, knobs.
 *
 * This replaced the spoken DJ. A synthetic voice reading the station name over
 * the opening bars was worse than simply seeing it, so the announcement became
 * something you watch instead of something you hear — the needle sweeps to the
 * new station's position and the name lights up in the glass.
 *
 * Every station gets a fixed spot on the dial, hashed from its id, so a
 * station you play often is always in the same place and the sweep carries
 * real information rather than being decoration.
 */

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlayer, dialPosition, dialFrequency } from "@/context/PlayerContext";

const TICKS = Array.from({ length: 21 });

/** How often to ask the stream what it is playing. */
const TRACK_POLL_MS = 20000;

/**
 * The song the stream says it is playing.
 *
 * Only some stations send this — measured against real Indian streams, rather
 * more than half, and never from an HLS playlist. So null is an ordinary
 * answer and the caller shows the station's own details instead.
 */
function useNowPlaying(station, isPlaying) {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!station?.url || !isPlaying) {
      setTrack(null);
      return;
    }

    let alive = true;
    const controller = new AbortController();

    const read = async () => {
      try {
        const res = await fetch(
          `/api/nowplaying?url=${encodeURIComponent(station.url)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (alive) setTrack(data.title || null);
      } catch {
        // A failed read means the title is unknown, not that anything broke —
        // the stream carries on regardless.
        if (alive) setTrack(null);
      }
    };

    // Clear immediately on a station change so the previous station's song
    // never sits under the new station's name.
    setTrack(null);
    read();
    const id = setInterval(read, TRACK_POLL_MS);

    return () => {
      alive = false;
      controller.abort();
      clearInterval(id);
    };
  }, [station?.url, station?.id, isPlaying]);

  return track;
}

function VolumeKnob({ value, onChange, label }) {
  // The knob is the visual; the range input sits transparently on top of it so
  // the control stays a real slider — draggable, focusable, and announced
  // properly — rather than a div pretending to be one.
  const angle = -140 + value * 280;

  return (
    <div className="knob-wrap">
      <div className="knob" aria-hidden="true">
        <span className="knob-mark" style={{ transform: `rotate(${angle}deg)` }} />
      </div>
      <input
        className="knob-input"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <span className="knob-label">{label}</span>
    </div>
  );
}

export default function Cabinet({ onPrev, onNext }) {
  const { t } = useLanguage();
  const { station, status, volume, setVolume, toggle } = usePlayer();

  const playing = status === "playing";
  const position = station ? dialPosition(station.id) : 0.5;
  const track = useNowPlaying(station, playing);

  const state = {
    idle: station ? t("pause") : t("nothingPlaying"),
    buffering: t("buffering"),
    playing: t("nowPlaying"),
    error: t("streamFailed"),
  }[status];

  const where = station
    ? [station.country, station.language, station.bitrate ? `${station.bitrate} kbps` : null]
        .filter(Boolean)
        .join(" · ")
    : t("pickAStation");

  return (
    <aside className="cabinet">
      <div className="cab-top">
        <span className="plate">{t("appName")}</span>
        <span className="onair" data-live={playing}>
          <span className="onair-lamp" aria-hidden="true" />
          {playing ? t("onAir") : t("standby")}
        </span>
      </div>

      <div className="dial">
        <div className="dial-row">
          <span className="dial-name" title={station?.name}>
            {station?.name ?? t("nothingPlaying")}
          </span>
          {station && <span className="dial-freq">{dialFrequency(station.id)}</span>}
        </div>
        <p className="dial-where">{where}</p>

        <div className="scale">
          <div className="scale-line" aria-hidden="true" />
          <div className="scale-ticks" aria-hidden="true">
            {TICKS.map((_, i) => (
              <span key={i} data-major={i % 4 === 0} />
            ))}
          </div>
          <div
            className="needle"
            data-on={Boolean(station)}
            style={{ left: `${position * 100}%` }}
            aria-hidden="true"
          />
          <div className="scale-nums" aria-hidden="true">
            <span>88</span><span>92</span><span>96</span>
            <span>100</span><span>104</span><span>108</span>
          </div>
        </div>

        <p className="dial-state" data-error={status === "error"}>{state}</p>
      </div>

      <div className="grille">
        {/* The grille carries the song when the stream names one. Stations
            that send nothing keep a plain grille rather than an empty panel
            that looks like a failure. */}
        {track && (
          <p className="track" aria-live="polite">
            <span className="track-label">{t("nowPlayingTrack")}</span>
            <span className="track-name" title={track}>{track}</span>
          </p>
        )}
      </div>

      <div className="controls">
        <VolumeKnob value={volume} onChange={setVolume} label={t("volume")} />

        <div className="transport">
          <button
            type="button"
            className="tbtn"
            onClick={onPrev}
            disabled={!onPrev}
            aria-label={t("previousStation")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button
            type="button"
            className="tbtn tbtn-main"
            onClick={toggle}
            disabled={!station}
            aria-label={playing ? t("pause") : t("play")}
          >
            {playing ? (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="tbtn"
            onClick={onNext}
            disabled={!onNext}
            aria-label={t("nextStation")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
