"use client";

/**
 * Voice search, using the browser's own recognition.
 *
 * Recognition is told which language to expect — the same tag the DJ speaks
 * in — so saying a Telugu station name while the UI is in Telugu actually
 * works. That only happens because language is a shared context rather than a
 * prop threaded through the tree.
 *
 * Chrome and Edge support this. Firefox does not, so the button disables
 * itself and says so rather than failing silently when pressed.
 */

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function MicButton({ onResult }) {
  const { t, meta } = useLanguage();
  const [state, setState] = useState("idle");   // idle | listening | thinking | unsupported | denied
  const [heard, setHeard] = useState("");
  const recRef = useRef(null);

  // Support is checked after mount, never during render — the server has no
  // window and would disagree with the client.
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setState("unsupported");
  }, []);

  useEffect(() => () => recRef.current?.abort?.(), []);

  const listen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setState("unsupported");

    if (state === "listening") {
      recRef.current?.stop?.();
      return;
    }

    const rec = new SR();
    recRef.current = rec;
    rec.lang = meta.speech;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => { setHeard(""); setState("listening"); };

    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript?.trim();
      if (text) {
        setHeard(text);
        setState("thinking");
        onResult?.(text);
        setTimeout(() => setState("idle"), 1600);
      } else {
        setState("idle");
      }
    };

    rec.onerror = (e) => {
      setState(e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "denied" : "idle");
    };

    rec.onend = () => setState((s) => (s === "listening" ? "idle" : s));

    try {
      rec.start();
    } catch {
      setState("idle");
    }
  };

  const label = {
    idle: t("micIdle"),
    listening: t("micListening"),
    thinking: heard ? `${t("micHeard")}: "${heard}"` : t("micThinking"),
    unsupported: t("micUnsupported"),
    denied: t("micDenied"),
  }[state];

  const blocked = state === "unsupported" || state === "denied";

  return (
    <div style={{ position: "relative", flex: "none" }}>
      {state !== "idle" && <div className="mic-status">{label}</div>}
      <button
        className="mic"
        data-listening={state === "listening"}
        onClick={listen}
        disabled={blocked}
        aria-label={label}
        title={label}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             aria-hidden="true">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
        </svg>
      </button>
    </div>
  );
}
