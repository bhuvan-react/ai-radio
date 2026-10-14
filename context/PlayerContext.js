"use client";

/**
 * What is playing, and where the needle sits.
 *
 * Kept apart from LanguageContext on purpose. Audio state changes constantly —
 * buffering, volume, errors — and language changes almost never. Sharing one
 * context would re-render every translated string each time the stream
 * buffers.
 *
 * There used to be a spoken DJ here announcing each station. It has been
 * removed: a synthetic voice talking over the opening bars of a song is worse
 * than seeing the name, and the dial now does the announcing — the needle
 * sweeps and the name lights up in the glass.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";

const FAVORITES_KEY = "ai-radio-favorites";

/**
 * Version 2 of the key, and the bump is deliberate.
 *
 * Until the fix below, switching away from a playing station recorded a
 * failure against the station being switched TO. Two of those and it was
 * hidden for good. Every listener's stored list therefore contains stations
 * that work perfectly well, and there is no way to tell those apart from
 * genuine duds. Starting a new key throws the bad data away.
 */
const DEAD_KEY = "ai-radio-dead-stations-v2";

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

/** `MediaError.MEDIA_ERR_ABORTED` — the load was cancelled, by us. */
const MEDIA_ERR_ABORTED = 1;

/**
 * Where a station sits on the dial.
 *
 * Internet stations have no frequency, but a dial without a position is just a
 * picture. Hashing the station's id gives every station its own spot, the same
 * spot every time — so the needle lands somewhere meaningful and a station you
 * listen to often is always in the same place.
 */
export function dialPosition(id) {
  if (!id) return 0.5;
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

/** The number printed next to the name, derived from the same position. */
export function dialFrequency(id) {
  return (88 + dialPosition(id) * 20).toFixed(1);
}

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  // The audio element's listeners are attached once, so they need the current
  // station id from a ref rather than from state they cannot see updating.
  const currentId = useRef(null);
  const [station, setStation] = useState(null);
  const [status, setStatus] = useState("idle");   // idle | buffering | playing | error
  const [volume, setVolume] = useState(0.8);
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

    /**
     * Only a real fault counts.
     *
     * Assigning a new `src` while a stream is playing makes the browser abandon
     * the old one, and that raises an error on the element — but `currentId`
     * has already moved to the new station, so the old stream's abort was being
     * recorded against the station the listener just chose. Two switches and a
     * perfectly good station was hidden.
     *
     * It also explains the symptom: switching from a PLAYING station failed,
     * switching from an already-failed one worked, so the errors appeared to
     * alternate.
     */
    const onError = () => {
      if (audio.error?.code === MEDIA_ERR_ABORTED) return;
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
    };
  }, [clearFailures, recordFailure]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback(
    (next) => {
      const audio = audioRef.current;
      if (!audio || !next?.url) return;

      currentId.current = next.id;
      setStation(next);
      setStatus("buffering");

      /**
       * Stop the old stream before starting the new one.
       *
       * Assigning `src` over a playing stream would do it anyway, but doing it
       * ourselves makes the teardown deliberate and keeps the abort that
       * follows distinguishable from a station that genuinely failed.
       */
      audio.pause();

      /**
       * Start in the same task as the tap that asked for it.
       *
       * Mobile browsers — iOS especially — only allow audio to begin from a
       * user gesture, and the permission does not survive an await. Nothing
       * asynchronous may come between the tap and this call.
       */
      audio.src = next.url;
      audio.volume = volume;

      Promise.resolve(audio.play()).catch((err) => {
        // NotAllowedError means the browser blocked it, not that the station is
        // down. AbortError means a newer play() replaced this one — the
        // listener changed their mind mid-connect. Neither is the station's
        // fault, and neither may count as a strike against it.
        if (err?.name === "NotAllowedError" || err?.name === "AbortError") return;
        setStatus("error");
        recordFailure(next.id);
      });
    },
    [volume, recordFailure]
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    currentId.current = null;
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
      }
    },
    [favorites, isFavorite]
  );

  const value = useMemo(
    () => ({
      station, status, volume, setVolume,
      play, stop, toggle,
      favorites, isFavorite, toggleFavorite,
      isDead,
    }),
    [station, status, volume, play, stop, toggle,
     favorites, isFavorite, toggleFavorite, isDead]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
