"use client";

/**
 * The Radio DJ's voice.
 *
 * Uses the browser's own speech synthesis rather than a cloud text-to-speech
 * service. A radio host talks continuously, and cloud TTS bills per character,
 * so it is the one piece that would cost real money per hour of listening.
 * The browser's is free, works offline once the voice is installed, and covers
 * every language this app speaks.
 *
 * The DJ talks *over the station being quiet*, so the player ducks the stream
 * while a line is spoken and brings it back after. That is handled by the
 * player; this file only produces speech.
 */

/** Browsers disagree on how many voices they have and when they load them. */
export function voicesReady() {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    // Chrome sometimes never fires the event. Don't hang the DJ on it.
    setTimeout(done, 1200);
  });
}

/**
 * Best voice for a language tag like "te-IN".
 * Falls back to the base language, then to whatever the browser defaults to —
 * an English voice reading Telugu is poor, but silence is worse.
 */
function pickVoice(voices, speechTag) {
  const base = speechTag.split("-")[0];
  return (
    voices.find((v) => v.lang === speechTag) ||
    voices.find((v) => v.lang?.replace("_", "-") === speechTag) ||
    voices.find((v) => v.lang?.startsWith(base)) ||
    null
  );
}

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Say one line. Resolves when it finishes so the caller can un-duck the
 * stream, and resolves (rather than rejects) on failure for the same reason —
 * a DJ that breaks must not leave the radio muted.
 */
export async function say(text, speechTag, { rate = 1.0, pitch = 1.0 } = {}) {
  if (!speechSupported() || !text) return;

  const voices = await voicesReady();
  const voice = pickVoice(voices, speechTag);

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel();      // never let two lines overlap
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = speechTag;
      u.rate = rate;
      u.pitch = pitch;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);

      // Chrome drops long utterances silently. A hard ceiling means the stream
      // always comes back even if the voice never finishes.
      setTimeout(resolve, Math.min(20000, 2500 + text.length * 90));
    } catch {
      resolve();
    }
  });
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
