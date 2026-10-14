import { Oswald, Jost } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { AuthProvider } from "@/context/AuthContext";

/**
 * Oswald is the dial: condensed grotesque, which is what was actually printed
 * on tuning scales. Jost carries the interface — geometric and warm, and it
 * keeps out of the way of a face that is doing the talking.
 *
 * Self-hosted by next/font rather than linked, so there is no request to
 * another origin on load and no flash of a fallback face.
 */
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-oswald",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

/**
 * Icons are declared here and served from public/, not placed in app/ as
 * icon.svg.
 *
 * Next's file-based metadata convention writes the absolute file path into a
 * single-quoted JavaScript string, and this project lives under a folder whose
 * name contains an apostrophe. That closes the string early and the build
 * fails with a parse error wearing a misleading "exceeds 8MB" message.
 */
export const metadata = {
  title: "SV Radio",
  description: "Live radio stations from India and the world",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  themeColor: "#2B1B13",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * `lang` stays "en" on the server. It is the language the server rendered in,
 * and claiming otherwise would be a lie to screen readers as well as a
 * hydration mismatch. LanguageProvider corrects it after detection.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${oswald.variable} ${jost.variable}`}>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
