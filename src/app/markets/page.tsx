import { metaData } from "@/app/metadata";
import MarketsOverview from "@/components/markets/ MarketsOverview";

export const metadata = metaData.markets;

export default function MarketsPage() {
  return <MarketsOverview />;
}
