"use client";

/**
 * What is playing, and the DJ who talks over it.
 *
 * Kept apart from LanguageContext on purpose. Audio state changes constantly —
 * buffering, volume, errors — and language changes almost never. Sharing one
 * context would re-render every translated string each time the stream
 * buffers.
 *
 * The DJ ducks rather than pauses. Pausing a live stream and resuming it means
 * reconnecting and losing a few seconds; lowering the volume while the host
 * speaks is what an actual radio does.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { say, speechSupported, stopSpeaking } from "@/lib/dj";
import { useLanguage } from "@/context/LanguageContext";

const FAVORITES_KEY = "ai-radio-favorites";
const DUCKED_VOLUME = 0.12;

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { t, meta } = useLanguage();

  const audioRef = useRef(null);
  const [station, setStation] = useState(null);
  const [status, setStatus] = useState("idle");   // idle | buffering | playing | error
  const [volume, setVolume] = useState(0.8);
  const [djEnabled, setDjEnabled] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Same rule as the language: never read storage during render.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* corrupt or unavailable — start with none */
    }
  }, []);

  const persistFavorites = (next) => {
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* storage disabled; favourites last for this session only */
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    // Deliberately NOT crossOrigin="anonymous". That makes the browser demand
    // CORS headers, which most radio servers do not send, and the stream fails
    // to load. It is only needed to read audio data with the Web Audio API,
    // which this app does not do.
    audioRef.current = audio;

    const onPlaying = () => setStatus("playing");
    const onWaiting = () => setStatus("buffering");
    const onError = () => setStatus("error");

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  /** Say a line with the stream turned down underneath it. */
  const announce = useCallback(
    async (key, vars) => {
      if (!djEnabled || !speechSupported()) return;
      const audio = audioRef.current;
      const restore = audio ? audio.volume : volume;
      if (audio) audio.volume = Math.min(restore, DUCKED_VOLUME);
      try {
        await say(t(`dj.${key}`, vars), meta.speech);
      } finally {
        if (audio) audio.volume = restore;
      }
    },
    [djEnabled, t, meta.speech, volume]
  );

  const play = useCallback(
    (next) => {
      const audio = audioRef.current;
      if (!audio || !next?.url) return;

      const switching = station && station.id !== next.id;
      setStation(next);
      setStatus("buffering");

      /**
       * Start the stream in the same task as the tap that asked for it.
       *
       * Mobile browsers — iOS especially — only allow audio to begin from a
       * user gesture, and the permission does not survive an await. An earlier
       * version let the DJ speak first and then called play(); on a phone that
       * lost the gesture and every station came back as "not responding".
       *
       * So: play first, then talk over it. Which is also what a real radio
       * does — the host speaks over the opening bars rather than making you
       * sit in silence waiting for them to finish.
       */
      audio.src = next.url;
      audio.volume = volume;
      const started = audio.play();

      if (djEnabled && speechSupported()) {
        // Not awaited — it ducks and restores on its own.
        announce(switching ? "switching" : "intro", { station: next.name });
      }

      Promise.resolve(started).catch((err) => {
        setStatus("error");
        // NotAllowedError means the browser blocked it, not that the station
        // is down. Saying "not responding" there sends people hunting for a
        // problem with a station that is perfectly fine.
        if (err?.name !== "NotAllowedError") {
          announce("failed", { station: next.name });
        }
      });
    },
    [station, djEnabled, announce, volume]
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    stopSpeaking();
    setStatus("idle");
    setStation(null);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !station) return;
    if (status === "playing") {
      audio.pause();
      setStatus("idle");
    } else {
      audio.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
    }
  }, [station, status]);

  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (s) => {
      if (isFavorite(s.id)) {
        persistFavorites(favorites.filter((f) => f.id !== s.id));
      } else {
        persistFavorites([...favorites, s]);
        announce("favorited", { station: s.name });
      }
    },
    [favorites, isFavorite, announce]
  );

  const value = useMemo(
    () => ({
      station, status, volume, setVolume,
      djEnabled, setDjEnabled,
      play, stop, toggle, announce,
      favorites, isFavorite, toggleFavorite,
    }),
    [station, status, volume, djEnabled, play, stop, toggle, announce,
     favorites, isFavorite, toggleFavorite]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
