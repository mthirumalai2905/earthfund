import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Earth Fund: Capital for a living planet",
  description:
    "Earth Fund is an environmental investment fund. It backs solar, hemp and natural materials, and does not invest in fossil fuels or wind.",
  openGraph: {
    title: "Earth Fund",
    description: "Capital for a living planet",
    images: ["/images/silver-00-earth.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020306",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
