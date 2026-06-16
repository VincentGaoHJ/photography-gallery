import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import "./globals.css";

// Fonts are self-hosted from src/app/fonts/ (see scripts/fetch-fonts.mjs) so the
// build has NO Google Fonts dependency — works offline and behind the GFW.

// Display serif for headings (matches the original "Cormorant Garamond").
const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-500-italic.woff2", weight: "500", style: "italic" },
  ],
});

// Body serif — free stand-in for the original's paid "Adobe Garamond Pro".
const ebGaramond = localFont({
  variable: "--font-eb-garamond",
  display: "swap",
  src: [
    { path: "./fonts/ebgaramond-400-600-normal.woff2", weight: "400 600", style: "normal" },
    { path: "./fonts/ebgaramond-400-600-italic.woff2", weight: "400 600", style: "italic" },
  ],
});

// Sans for small uppercase labels / nav.
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "./fonts/poppins-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${ebGaramond.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
