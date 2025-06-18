import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bitcoin Outpost - powered by Mars Protocol",
    short_name: "BTC Outpost",
    description: "Lend and borrow Bitcoin Derivatives on Neutron.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#f7931a",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "24x24",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "16x16",
        type: "image/x-icon",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
