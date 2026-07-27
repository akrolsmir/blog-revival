import type { Metadata } from "next";
import { Crimson_Pro, Marcellus_SC } from "next/font/google";
import { FaviconSwitcher } from "@/components/FaviconSwitcher";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

// Marcellus SC ships a single 400 weight and no italic — the graveyard's
// display/caps rules must not ask for anything else or browsers synthesize it.
const marcellusSC = Marcellus_SC({
  variable: "--font-marcellus-sc",
  subsets: ["latin"],
  weight: "400",
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const TITLE = "revive.blog — Blog Revival Project";
const DESCRIPTION = "Bounties for beloved dormant bloggers to write one more post.";

export const metadata: Metadata = {
  // Required for og:image to come out as an absolute URL; without it Next
  // emits a relative path and every crawler drops the image.
  metadataBase: new URL("https://revive.blog"),
  title: TITLE,
  description: DESCRIPTION,
  // rel="icon" is owned by <FaviconSwitcher/>, which follows the chosen skin —
  // see the note there for why it isn't declared here.
  icons: { apple: "/apple-touch-icon.png" },
  // The images themselves are app/opengraph-image.tsx and app/twitter-image.tsx;
  // Next appends the og:image / twitter:image tags automatically.
  openGraph: {
    type: "website",
    siteName: "Blog Revival Project",
    url: "https://revive.blog",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
      className={`${marcellusSC.variable} ${crimsonPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <FaviconSwitcher />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
