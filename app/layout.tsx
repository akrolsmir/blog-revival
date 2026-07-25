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

export const metadata: Metadata = {
  title: "revive.blog — Blog Revival Project",
  description: "Bounties for beloved dormant bloggers to write one more post.",
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
