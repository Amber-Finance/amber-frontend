import { Navbar } from "@/components/layout";
import { CosmosKitProvider } from "@/components/providers/CosmosKitProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitcoin Outpost - powered by Mars Protocol",
  description: "Lend and borrow Bitcoin Derivatives on Neutron.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="overflow-y-scroll no-scrollbar"
      suppressHydrationWarning
    >
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased cursor-default`}
      >
        <ThemeProvider defaultTheme="system" storageKey="btc-outpost-theme">
          <SWRProvider>
            <CosmosKitProvider>
              <main className="min-h-screen text-gray-900 bg-yellow-50 dark:bg-zinc-950 dark:text-white">
                <Navbar />
                {children}
                <ToastContainer
                  position="bottom-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
                <Analytics />
              </main>
            </CosmosKitProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
