import { Metadata } from "next";

export const metaData: { [key: string]: Metadata } = {
  home: {
    title: "Bitcoin Outpost - powered by Mars Protocol",
    metadataBase: new URL("https://bitcoin-outpost-fe.vercel.app"),
    description: "Lend and borrow Bitcoin Derivatives on Neutron.",
    keywords: ["ibc", "neutron", "lend", "borrow", "earn", "mars protocol"],
    openGraph: {
      type: "website",
      url: "https://bitcoin-outpost-fe.vercel.app",
      title: "Bitcoin Outpost - powered by Mars Protocol",
      locale: "en_US",
      description: "Lend and borrow Bitcoin Derivatives on Neutron.",
      siteName: "Bitcoin Outpost",
      images: [
        {
          url: "https://bitcoin-outpost-fe.vercel.app/banner.jpg",
          width: 1280,
          height: 720,
          alt: "Bitcoin Outpost",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@mars_protocol",
      title: "Bitcoin Outpost - powered by Mars Protocol",
      description:
        "Lend and borrow on Neutron with easy. Simple, secure, and fast.",
      images: [
        {
          url: "https://bitcoin-outpost-fe.vercel.app/banner.jpg",
          width: 1280,
          height: 720,
          alt: "Bitcoin Outpost",
        },
      ],
    },
  },
  markets: {
    title: "Bitcoin Outpost - Markets",
    metadataBase: new URL("https://bitcoin-outpost-fe.vercel.app"),
    description: "Explore the markets on Bitcoin Outpost.",
    keywords: ["ibc", "neutron", "lend", "borrow", "earn", "mars protocol"],
    openGraph: {
      type: "website",
      url: "https://bitcoin-outpost-fe.vercel.app/markets",
      title: "Bitcoin Outpost - Markets",
      locale: "en_US",
      description: "Explore the markets on Bitcoin Outpost.",
      siteName: "Bitcoin Outpost",
      images: [
        {
          url: "https://bitcoin-outpost-fe.vercel.app/banner.jpg",
          width: 1280,
          height: 720,
          alt: "Bitcoin Outpost",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@mars_protocol",
      title: "Bitcoin Outpost - Markets",
      description: "Explore the markets on Bitcoin Outpost.",
      images: [
        {
          url: "https://bitcoin-outpost-fe.vercel.app/banner.jpg",
          width: 1280,
          height: 720,
          alt: "Bitcoin Outpost",
        },
      ],
    },
  },
};
