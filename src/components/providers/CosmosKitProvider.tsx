"use client";

import chainConfig from "@/config/chain";
import { getCosmosKitTheme } from "@/theme/cosmosKitTheme";
import { GasPrice } from "@cosmjs/stargate";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as okxWallets } from "@cosmos-kit/okxwallet";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as vectisWallets } from "@cosmos-kit/vectis";
import { wallets as xdefiWallets } from "@cosmos-kit/xdefi";
import "@interchain-ui/react/styles";
import { assets, chains } from "chain-registry";

const chain = chains.filter(
  (chain) =>
    chain.chain_name === chainConfig.name && chain.network_type === "mainnet"
);
const chainAssets = assets.filter(
  (asset) => asset.chain_name === chainConfig.name
);

// Combine all wallets
const wallets = [
  ...keplrWallets,
  ...leapWallets,
  ...cosmostationWallets,
  ...xdefiWallets,
  ...okxWallets,
  ...vectisWallets,
];

export const CosmosKitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get the theme configuration
  const modalTheme = getCosmosKitTheme();

  return (
    <ChainProvider
      chains={chain}
      assetLists={chainAssets}
      wallets={wallets}
      walletConnectOptions={{
        signClient: {
          projectId:
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
            "your-project-id",
          relayUrl: "wss://relay.walletconnect.org",
          metadata: {
            name: "Bitcoin Outpost",
            description: "Bitcoin Outpost - powered by Mars Protocol",
            url: "https://bitcoin-outpost-fe.vercel.app",
            icons: ["https://bitcoin-outpost-fe.vercel.app/favicon-96x96.png"],
          },
        },
      }}
      signerOptions={{
        signingCosmwasm: () => {
          return {
            gasPrice: GasPrice.fromString("0.025untrn"),
          };
        },
        signingStargate: () => {
          return {
            gasPrice: GasPrice.fromString("0.025untrn"),
          };
        },
      }}
      modalTheme={modalTheme}
    >
      {children}
    </ChainProvider>
  );
};
