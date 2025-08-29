import "../styles/globals.css";

import { GoogleTagManager } from "@next/third-parties/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import React from "react";

import { DefaultSeo } from "@/components/DefaultSeo";
import { Background } from "@/components/layout/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemedParticles } from "@/components/ui/ThemedParticles";
import { initAmplitude } from "@/utils/initAmplitude";

export default function App({ Component, pageProps }: any) {
  initAmplitude();
  const [queryClient] = React.useState(() => new QueryClient());

  // require('../styles/globals.css')

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          href={`/favicon-96x96.png`}
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`/favicon.svg`}
        />
        <link
          rel="shortcut icon"
          href={`/favicon.ico`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/apple-touch-icon.png`}
        />
        <meta
          name="apple-mobile-web-app-title"
          content={"Amber Finance"}
        />
        <link
          rel="manifest"
          href={`/web-app-manifest-192x192.png`}
        />
        <meta
          name="description"
          content="Bridge assets across chains with Amber Finance. Powered by Skip Protocol."
        />
      </Head>
      <DefaultSeo />
      <GoogleTagManager gtmId="GTM-5XMZ695Z" />
      <ThemeProvider
        defaultTheme="dark"
        storageKey="btc-outpost-theme"
      >
        <QueryClientProvider client={queryClient}>
          <div className="no-scrollbar relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background">
            <Background />
            <ThemedParticles
              className="absolute inset-0 z-0"
              quantity={100}
              ease={70}
              size={0.6}
              staticity={30}
              refresh={false}
            />
            <main className="relative z-10 mx-auto w-full max-w-screen-2xl flex-1 px-2 pt-16 sm:px-8 sm:pt-20">
              <Navbar />
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </QueryClientProvider>
      </ThemeProvider>

      <Analytics />
    </>
  );
}
