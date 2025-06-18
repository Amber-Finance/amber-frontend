import chainConfig from "@/config/chain";
import { getUrl } from "@/utils/format";
import { useChain } from "@cosmos-kit/react";
import useSWR from "swr";

export default function useWalletBalances() {
  const { address } = useChain(chainConfig.name);

  // Specify a key immediately when address is available to ensure the hook is called
  const swrKey = address ? `${address}/balances` : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    () => getWalletBalances(chainConfig, address!),
    {
      // No longer using isPaused - we either have a key (address) or we don't
      fallbackData: [],
      // Ensure we revalidate when component mounts or window gets focus
      revalidateOnMount: true,
      revalidateOnFocus: true,
    }
  );

  // Return loading state explicitly to help components display loaders instead of zeros
  return {
    data,
    error,
    isLoading: address ? isLoading : false,
    isReady: !!address,
  };
}

async function getWalletBalances(
  chainConfig: ChainConfig,
  address: string
): Promise<Coin[]> {
  const url = getUrl(
    chainConfig.endpoints.restUrl,
    `/cosmos/bank/v1beta1/balances/${address}`
  );
  return fetch(url)
    .catch(() => {
      return new Response(null, {
        status: 404,
        statusText: "Network request failed",
      });
    })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        return data.balances;
      }
      return [];
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
}
