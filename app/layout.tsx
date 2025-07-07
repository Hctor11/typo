import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.sass";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Typo",
  description: "Test your typing speed",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="antialiased bg-gray-900 text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}