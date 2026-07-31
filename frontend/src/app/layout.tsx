import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import CoachWidget from "@/components/CoachWidget";
import "./globals.css";

const heading = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "The Debate Standard",
  description: "Ideas. Arguments. Impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable}`}>
        {children}
        <CoachWidget />
      </body>
    </html>
  );
}