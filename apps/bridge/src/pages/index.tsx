import dynamic from "next/dynamic";

const SkipPage = dynamic(() => import("@/components/pages/skip").then((m) => m.SkipPage), {
  ssr: false,
});

export default function Home() {
  return <SkipPage />;
}
