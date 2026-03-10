import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "YADAH — International Gospel Music Minister",
  description:
    "She doesn't just sing. She carries Light. 100M+ streams globally. Worship, ministry, and the presence of God through music.",
  openGraph: {
    title: "YADAH — International Gospel Music Minister",
    description:
      "She doesn't just sing. She carries Light. Worship, ministry, and the presence of God through music.",
    type: "website",
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
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="antialiased bg-[var(--bg)] text-[var(--ivory)] font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
