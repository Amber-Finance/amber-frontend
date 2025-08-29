import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html
      lang="en"
      className="no-scrollbar overflow-y-scroll"
      suppressHydrationWarning
    >
      <Head>
        <meta charSet="UTF-8" />
        <meta
          content="ie=edge"
          httpEquiv="X-UA-Compatible"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('btc-outpost-theme');
                const theme = stored || 'dark';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </Head>
      <body
        className="overflow-x-hidden font-sans antialiased"
        style={{ overscrollBehavior: "none" }}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
