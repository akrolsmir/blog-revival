import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Newsreader } from "next/font/google";
import { FaviconSwitcher } from "@/components/FaviconSwitcher";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const cormorantSC = Cormorant_SC({
  variable: "--font-cormorant-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "revive.blog — Blog Revival Project",
  description:
    "Bounties for beloved dormant bloggers to write one more post. Quadratic funding by Manifund.",
  // rel="icon" is owned by <FaviconSwitcher/>, which follows the chosen skin —
  // see the note there for why it isn't declared here.
  icons: { apple: "/apple-touch-icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cormorantSC.variable} ${newsreader.variable} h-full antialiased`}
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
