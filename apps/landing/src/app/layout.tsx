import type { Metadata } from "next";
import { ReactNode } from "react";
import "@/app/globals.css";
import RunningLogo from "@/components/RunningLogo";
import { Space_Mono } from 'next/font/google'

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Bitcoin Outpost - Landing",
  description: "Bitcoin Outpost Landing Page",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable}`}>
        <RunningLogo />
          {children}
      </body>
    </html>
  );
}
