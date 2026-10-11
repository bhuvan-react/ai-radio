import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { PlayerProvider } from "@/context/PlayerContext";

export const metadata = {
  title: "AI Radio",
  description: "Live radio stations with a host who speaks your language",
};

export const viewport = {
  themeColor: "#0b0a14",
  width: "device-width",
  initialScale: 1,
};

/**
 * `lang` stays "en" on the server. It is the language the server rendered in,
 * and claiming otherwise would be a lie to screen readers as well as a
 * hydration mismatch. LanguageProvider corrects it after detection.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <PlayerProvider>{children}</PlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
