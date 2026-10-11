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
const DEAD_KEY = "ai-radio-dead-stations";
const DUCKED_VOLUME = 0.12;

/**
 * A station is only hidden after it has failed twice.
 *
 * The directory marks a station broken only when its own checker fails, which
 * misses the ones that are merely unreliable. But one failure is often the
 * listener's own network rather than the station, and permanently hiding a
 * good station because a train went into a tunnel would be worse than showing
 * the occasional dud.
 */
const FAILURES_BEFORE_HIDING = 2;

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { t, meta } = useLanguage();

  const audioRef = useRef(null);
  // The audio element's listeners are attached once, so they need the current
  // station id from a ref rather than from state they cannot see updating.
  const currentId = useRef(null);
  const [station, setStation] = useState(null);
  const [status, setStatus] = useState("idle");   // idle | buffering | playing | error
  const [volume, setVolume] = useState(0.8);
  const [djEnabled, setDjEnabled] = useState(true);
  const [favorites, setFavorites] = useState([]);
  // station id -> number of times it has failed to play
  const [deadStations, setDeadStations] = useState({});

  // Same rule as the language: never read storage during render.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
      const dead = localStorage.getItem(DEAD_KEY);
      if (dead) setDeadStations(JSON.parse(dead));
    } catch {
      /* corrupt or unavailable — start with none */
    }
  }, []);

  /** Count a failure, and persist it. */
  const recordFailure = useCallback((id) => {
    setDeadStations((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      try {
        localStorage.setItem(DEAD_KEY, JSON.stringify(next));
      } catch {
        /* session only */
      }
      return next;
    });
  }, []);

  /** A station that played is proven alive — clear any earlier strikes. */
  const clearFailures = useCallback((id) => {
    setDeadStations((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem(DEAD_KEY, JSON.stringify(next));
      } catch {
        /* session only */
      }
      return next;
    });
  }, []);

  const isDead = useCallback(
    (id) => (deadStations[id] ?? 0) >= FAILURES_BEFORE_HIDING,
    [deadStations]
  );

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

    const onPlaying = () => {
      setStatus("playing");
      // Read the station from the ref rather than closing over state — this
      // listener is attached once and would otherwise see the first station
      // for ever.
      if (currentId.current) clearFailures(currentId.current);
    };
    const onWaiting = () => setStatus("buffering");
    const onError = () => {
      setStatus("error");
      if (currentId.current) recordFailure(currentId.current);
    };

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
      currentId.current = next.id;
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
        // problem with a station that is perfectly fine — and it must not
        // count as a strike against the station either.
        if (err?.name !== "NotAllowedError") {
          recordFailure(next.id);
          announce("failed", { station: next.name });
        }
      });
    },
    [station, djEnabled, announce, volume, recordFailure]
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
      isDead,
    }),
    [station, status, volume, djEnabled, play, stop, toggle, announce,
     favorites, isFavorite, toggleFavorite, isDead]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
