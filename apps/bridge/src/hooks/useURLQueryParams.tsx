import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export const useURLQueryParams = () => {
  const searchParams = useSearchParams();
  const srcChainQP = searchParams.get("src_chain");
  const srcAssetQP = searchParams.get("src_asset");
  const destChainQP = searchParams.get("dest_chain");
  const destAssetQP = searchParams.get("dest_asset");
  const amountInQP = searchParams.get("amount_in");
  const amountOutQP = searchParams.get("amount_out");

  const queryParams = useMemo(() => {
    return {
      srcChainId: srcChainQP ?? undefined,
      srcAssetDenom: srcAssetQP ?? undefined,
      destChainId: destChainQP ?? undefined,
      destAssetDenom: destAssetQP ?? undefined,
      amountIn: amountInQP ? Number(amountInQP) : undefined,
      amountOut: amountOutQP ? Number(amountOutQP) : undefined,
    };
  }, [amountInQP, amountOutQP, destAssetQP, destChainQP, srcAssetQP, srcChainQP]);

  if (!srcChainQP && !srcAssetQP && !destChainQP && !destAssetQP && !amountInQP && !amountOutQP) {
    return;
  }

  return queryParams;
};
