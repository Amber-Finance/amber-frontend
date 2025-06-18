import { Dashboard, InstanceHeader, UserPortfolioStats } from "@/components";
import { metaData } from "@/app/metadata";

export const metadata = metaData.home;

export default function Home() {
  return (
    <div className="w-full px-0 lg:container lg:px-4 py-8 mx-auto">
      <InstanceHeader />
      <UserPortfolioStats />
      <Dashboard />
    </div>
  );
}
