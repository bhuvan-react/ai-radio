"use client";

/**
 * Who is listening, and whether they are allowed in.
 *
 * Google hands the browser a credential; this asks our own server to verify it
 * and look the person up on the access sheet. The answer is re-checked on every
 * load rather than cached as a verdict — approval can be taken away, and a
 * "yes" remembered in the browser would outlive it.
 *
 * The credential itself is kept so a reload does not demand a fresh sign-in.
 * It expires after about an hour, at which point the check fails and the sign-in
 * screen returns, which is the correct behaviour rather than a bug.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";

const CREDENTIAL_KEY = "sv-radio-credential";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // checking | signed-out | pending | approved | error | unconfigured
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  const check = useCallback(async (credential) => {
    if (!credential) {
      setStatus("signed-out");
      return;
    }
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();

      if (data.status === "signed-out") {
        // The credential is stale or was rejected. Drop it so the next load
        // goes straight to the sign-in screen instead of retrying forever.
        try { localStorage.removeItem(CREDENTIAL_KEY); } catch { /* ignore */ }
        setUser(null);
        setStatus("signed-out");
        return;
      }

      setUser({ email: data.email, name: data.name, picture: data.picture });
      setStatus(data.status);
    } catch {
      setStatus("error");
    }
  }, []);

  // Never read storage during render — it does not exist on the server, and
  // the markup would not match what the browser produced.
  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(CREDENTIAL_KEY); } catch { /* ignore */ }
    check(stored);
  }, [check]);

  /** Called by the Google button with the credential it was given. */
  const signIn = useCallback((credential) => {
    try { localStorage.setItem(CREDENTIAL_KEY, credential); } catch { /* ignore */ }
    setStatus("checking");
    check(credential);
  }, [check]);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(CREDENTIAL_KEY); } catch { /* ignore */ }
    setUser(null);
    setStatus("signed-out");
  }, []);

  const refresh = useCallback(() => {
    let stored = null;
    try { stored = localStorage.getItem(CREDENTIAL_KEY); } catch { /* ignore */ }
    setStatus("checking");
    check(stored);
  }, [check]);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, refresh }),
    [status, user, signIn, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
