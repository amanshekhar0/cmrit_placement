import { useState, useEffect } from "react";
import App from "../App.jsx";
import Landing from "./Landing.jsx";

/**
 * "/" serves two different pages by design.
 *
 * A signed-out visitor -- including Googlebot -- gets the public landing page,
 * which is indexable and links out to every company page. A signed-in student
 * goes straight to the dashboard rather than a marketing page they have already
 * converted on.
 *
 * Lives in its own file rather than in main.jsx so that entry point exports
 * nothing but the bootstrap, which is what Fast Refresh needs to work.
 */
export default function Home() {
  // Guarded for the prerender pass (no localStorage in Node). Prerendered "/"
  // is therefore always the signed-out landing page, which is what we want
  // indexed anyway.
  const [signedIn, setSignedIn] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("cmrit_user")
  );

  useEffect(() => {
    const sync = () => setSignedIn(!!localStorage.getItem("cmrit_user"));
    // `storage` only fires for OTHER tabs, so App dispatches a custom event for
    // same-tab sign-in and sign-out.
    window.addEventListener("storage", sync);
    window.addEventListener("cmrit:auth", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cmrit:auth", sync);
    };
  }, []);

  return signedIn ? <App /> : <Landing />;
}
