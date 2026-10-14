"use client";

/**
 * The front door, drawn as the radio's own front panel.
 *
 * Everything before approval happens here: signing in, waiting, and being told
 * why if something is wrong. The set is shown dark and silent behind the panel
 * so it is obvious what is being waited for.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const GSI_SRC = "https://accounts.google.com/gsi/client";

/** Load Google's script once, however many times this component mounts. */
function useGoogleScript(onReady) {
  useEffect(() => {
    if (window.google?.accounts?.id) {
      onReady();
      return;
    }
    let script = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", onReady);
    return () => script.removeEventListener("load", onReady);
  }, [onReady]);
}

function GoogleButton({ onCredential }) {
  const slot = useRef(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useGoogleScript(() => {
    if (!clientId || !slot.current || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => onCredential(response.credential),
    });
    window.google.accounts.id.renderButton(slot.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 260,
    });
  });

  if (!clientId) {
    return (
      <p className="gate-note">
        No Google client ID is configured, so signing in is not possible yet.
      </p>
    );
  }

  return <div ref={slot} className="gate-button" />;
}

export default function SignInGate() {
  const { status, user, signIn, signOut, refresh } = useAuth();

  return (
    <div className="gate">
      <div className="gate-panel">
        <span className="plate">SV Radio</span>

        {status === "checking" && (
          <>
            <h1 className="gate-title">Warming up</h1>
            <p className="gate-note">One moment.</p>
          </>
        )}

        {status === "signed-out" && (
          <>
            <h1 className="gate-title">Sign in to listen</h1>
            <p className="gate-note">
              Access is granted one listener at a time while the station is new.
            </p>
            <GoogleButton onCredential={signIn} />
          </>
        )}

        {status === "pending" && (
          <>
            <h1 className="gate-title">You&rsquo;re on the list</h1>
            <p className="gate-note">
              {user?.name ? `Thanks, ${user.name}. ` : ""}
              Your request has been noted and you&rsquo;ll be let in shortly.
              Come back and check, or reload this page once you hear.
            </p>
            <div className="gate-actions">
              <button type="button" className="gate-btn" onClick={refresh}>
                Check again
              </button>
              <button type="button" className="gate-btn gate-btn-quiet" onClick={signOut}>
                Sign out
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="gate-title">Can&rsquo;t check the list</h1>
            <p className="gate-note">
              The access list could not be reached, so nobody can be let in
              right now. This is at our end, not yours.
            </p>
            <div className="gate-actions">
              <button type="button" className="gate-btn" onClick={refresh}>
                Try again
              </button>
            </div>
          </>
        )}

        {status === "unconfigured" && (
          <>
            <h1 className="gate-title">Not set up yet</h1>
            <p className="gate-note">
              Sign-in works, but the access list is not connected. Set
              GOOGLE_SHEET_URL and GOOGLE_SHEET_SECRET, then reload.
            </p>
            <div className="gate-actions">
              <button type="button" className="gate-btn" onClick={refresh}>
                Check again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
