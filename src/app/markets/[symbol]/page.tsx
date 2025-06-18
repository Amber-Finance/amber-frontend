import MarketDetails from "@/components/markets/MarketDetails";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  return {
    title: `Bitcoin Outpost - ${symbol.toUpperCase()} Market`,
    metadataBase: new URL("https://bitcoin-outpost-fe.vercel.app"),
    description: `Explore the ${symbol.toUpperCase()} market on the Bitcoin Outpost.`,
    keywords: [
      "ibc",
      "neutron",
      "lend",
      "borrow",
      "earn",
      "mars protocol",
      symbol,
    ],
    openGraph: {
      type: "website",
      url: `https://bitcoin-outpost-fe.vercel.app/markets/${symbol}`,
      title: `Bitcoin Outpost - ${symbol.toUpperCase()} Market`,
      locale: "en_US",
      description: `Explore the ${symbol} market on the Bitcoin Outpost.`,
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
      site: "@Bitcoin Outpost_Lend",
      title: `Bitcoin Outpost - ${symbol.toUpperCase()} Market`,
      description: `Explore the ${symbol.toUpperCase()} market on the Bitcoin Outpost.`,
      images: [
        {
          url: "https://bitcoin-outpost-fe.vercel.app/banner.jpg",
          width: 1280,
          height: 720,
          alt: "Bitcoin Outpost",
        },
      ],
    },
  };
}

export default function MarketDetailsPage() {
  return <MarketDetails />;
}
